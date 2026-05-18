"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/global/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  useDistricts,
  useCreateDistrict,
  usePartialUpdateDistrict,
  useDeleteDistrict
} from "@/lib/hooks/use-districts";
import { useSections } from "@/lib/hooks/use-sections";
import type { District } from "@/types/district";

export function DistrictsManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [editDistrictName, setEditDistrictName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [districtToDelete, setDistrictToDelete] = useState<District | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch districts using TanStack Query
  const { data: districtsResponse, isLoading, error } = useDistricts({ search: searchQuery });

  // Fetch sections to count sections per district
  const { data: sectionsResponse } = useSections();

  // Mutations
  const createMutation = useCreateDistrict();
  const updateMutation = usePartialUpdateDistrict();
  const deleteMutation = useDeleteDistrict();

  // Extract districts from paginated response
  const districts = useMemo(() => districtsResponse?.results || [], [districtsResponse]);

  // Extract sections from paginated response
  const sections = useMemo(() => sectionsResponse?.results || [], [sectionsResponse]);

  // Count sections per district
  const getSectionCount = (districtId: number): number => {
    return sections.filter(section => section.district === districtId).length;
  };

  // Filter districts based on search query (client-side additional filtering if needed)
  const filteredDistricts = useMemo(() => {
    if (!searchQuery) return districts;
    return districts.filter((district: District) =>
      district.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      district.district_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [districts, searchQuery]);

  // Show success toast helper
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  const handleEdit = (id: number) => {
    const district = districts.find((d: District) => d.id === id);
    if (district) {
      setEditingDistrict(district);
      setEditDistrictName(district.name);
      setIsEditDialogOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    const district = districts.find((d: District) => d.id === id);
    if (district) {
      setDistrictToDelete(district);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (districtToDelete) {
      deleteMutation.mutate(districtToDelete.id, {
        onSuccess: () => {
          showSuccess("District deleted successfully.");
          setDistrictToDelete(null);
          setIsDeleteDialogOpen(false);
        },
        onError: (error) => {
          console.error("Error deleting district:", error);
          // You can add error toast here
        },
      });
    }
  };

  const handleCancelDelete = () => {
    setDistrictToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleAddDistrict = () => {
    setIsAddDialogOpen(true);
  };

  const handleSaveDistrict = () => {
    if (!newDistrictName.trim()) {
      return;
    }

    createMutation.mutate(
      { name: newDistrictName },
      {
        onSuccess: () => {
          showSuccess("District added successfully.");
          setNewDistrictName("");
          setIsAddDialogOpen(false);
        },
        onError: (error) => {
          console.error("Error creating district:", error);
          // You can add error toast here
        },
      }
    );
  };

  const handleCancelAdd = () => {
    setNewDistrictName("");
    setIsAddDialogOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editDistrictName.trim() || !editingDistrict) {
      return;
    }

    updateMutation.mutate(
      {
        id: editingDistrict.id,
        data: { name: editDistrictName }
      },
      {
        onSuccess: () => {
          showSuccess("District updated successfully.");
          setEditDistrictName("");
          setEditingDistrict(null);
          setIsEditDialogOpen(false);
        },
        onError: (error) => {
          console.error("Error updating district:", error);
          // You can add error toast here
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditDistrictName("");
    setEditingDistrict(null);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-lg">
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Districts Manager"
        description="Manage all administrative districts in the KAG organization."
        action={
          <Button onClick={handleAddDistrict} size="default">
            <Plus className="size-4" />
            Add District
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search districts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="ml-auto text-sm text-muted-foreground">
          Showing {filteredDistricts.length} districts
        </div>
      </div>

      {/* Districts Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-30">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-28 text-center">Sections</TableHead>
              <TableHead className="w-35">Created</TableHead>
              <TableHead className="w-25 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading districts...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-destructive">Error loading districts</p>
                    <p className="text-xs text-muted-foreground">{error.message}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredDistricts.length > 0 ? (
              filteredDistricts.map((district: District) => (
                <TableRow key={district.id}>
                  <TableCell className="font-medium text-brand-primary">
                    {district.district_id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {district.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-semibold text-emerald-600">
                      {getSectionCount(district.id)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(district.created_at), "d MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(district.id)}
                        className="hover:text-brand-primary"
                        disabled={updateMutation.isPending}
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit district</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(district.id);
                        }}
                        className="hover:text-destructive"
                        type="button"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete district</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      No districts found
                    </p>
                    {searchQuery && (
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search query
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add District Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New District</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="districtName" className="text-sm font-medium">
                District Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="districtName"
                type="text"
                placeholder="e.g. Nairobi Central District"
                value={newDistrictName}
                onChange={(e) => setNewDistrictName(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter the official district name as registered.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelAdd}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDistrict}
              disabled={!newDistrictName.trim() || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {createMutation.isPending ? "Saving..." : "Save District"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit District Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit District</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="editDistrictName" className="text-sm font-medium">
                District Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="editDistrictName"
                type="text"
                placeholder="e.g. Nairobi Central District"
                value={editDistrictName}
                onChange={(e) => setEditDistrictName(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter the official district name as registered.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editDistrictName.trim() || updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {updateMutation.isPending ? "Saving..." : "Save District"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <AlertTriangle className="size-8 text-yellow-600 dark:text-yellow-500" />
            </div>

            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-lg font-semibold">Delete District?</h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">
                  {districtToDelete?.name}
                </span>
                ? This action cannot be undone and will affect all related sections.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="flex-1"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
