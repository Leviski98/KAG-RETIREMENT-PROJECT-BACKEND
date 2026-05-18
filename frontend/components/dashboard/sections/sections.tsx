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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import {
  useSections,
  useCreateSection,
  usePartialUpdateSection,
  useDeleteSection,
} from "@/lib/hooks/use-sections";
import { useDistricts } from "@/lib/hooks/use-districts";
import type { Section } from "@/types/section";

export function SectionsManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<number | "all">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [selectedDistrictForNew, setSelectedDistrictForNew] = useState<number | undefined>();
  
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editSectionName, setEditSectionName] = useState("");
  const [editSelectedDistrict, setEditSelectedDistrict] = useState<number | undefined>();
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  
  // Success toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch sections using TanStack Query
  const {
    data: sectionsResponse,
    isLoading,
    error,
  } = useSections({
    search: searchQuery,
    district: selectedDistrict === "all" ? undefined : selectedDistrict,
  });

  // Fetch districts for dropdown
  const { data: districtsResponse } = useDistricts();

  // Mutations
  const createMutation = useCreateSection();
  const updateMutation = usePartialUpdateSection();
  const deleteMutation = useDeleteSection();

  // Extract data from paginated responses
  const sections = useMemo(() => sectionsResponse?.results || [], [sectionsResponse]);
  const districts = useMemo(() => districtsResponse?.results || [], [districtsResponse]);

  // Show success toast helper
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  const handleEdit = (id: number) => {
    const section = sections.find((s: Section) => s.id === id);
    if (section) {
      setEditingSection(section);
      setEditSectionName(section.name);
      setEditSelectedDistrict(section.district);
      setIsEditDialogOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    const section = sections.find((s: Section) => s.id === id);
    if (section) {
      setSectionToDelete(section);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleAddSection = () => {
    setIsAddDialogOpen(true);
  };

  const handleSaveSection = () => {
    if (!newSectionName.trim() || !selectedDistrictForNew) {
      return;
    }

    createMutation.mutate(
      {
        name: newSectionName,
        district: selectedDistrictForNew,
      },
      {
        onSuccess: () => {
          showSuccess("Section added successfully.");
          setNewSectionName("");
          setSelectedDistrictForNew(undefined);
          setIsAddDialogOpen(false);
        },
        onError: (error) => {
          console.error("Error creating section:", error);
        },
      }
    );
  };

  const handleCancelAdd = () => {
    setNewSectionName("");
    setSelectedDistrictForNew(undefined);
    setIsAddDialogOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editSectionName.trim() || !editSelectedDistrict || !editingSection) {
      return;
    }

    updateMutation.mutate(
      {
        id: editingSection.id,
        data: {
          name: editSectionName,
          district: editSelectedDistrict,
        },
      },
      {
        onSuccess: () => {
          showSuccess("Section updated successfully.");
          setEditSectionName("");
          setEditSelectedDistrict(undefined);
          setEditingSection(null);
          setIsEditDialogOpen(false);
        },
        onError: (error) => {
          console.error("Error updating section:", error);
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditSectionName("");
    setEditSelectedDistrict(undefined);
    setEditingSection(null);
    setIsEditDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (sectionToDelete) {
      deleteMutation.mutate(sectionToDelete.id, {
        onSuccess: () => {
          showSuccess("Section deleted successfully.");
          setSectionToDelete(null);
          setIsDeleteDialogOpen(false);
        },
        onError: (error) => {
          console.error("Error deleting section:", error);
        },
      });
    }
  };

  const handleCancelDelete = () => {
    setSectionToDelete(null);
    setIsDeleteDialogOpen(false);
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
        title="Sections Manager"
        description="Organize and manage sections within each district."
        action={
          <Button onClick={handleAddSection} size="default">
            <Plus className="size-4" />
            Add Section
          </Button>
        }
      />

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={selectedDistrict === "all" ? "all" : String(selectedDistrict)}
          onValueChange={(value) => setSelectedDistrict(value === "all" ? "all" : Number(value))}
        >
          <SelectTrigger className="w-fit min-w-45">
            <SelectValue placeholder="All Districts">
              {selectedDistrict === "all"
                ? "All Districts"
                : districts.find((d) => d.id === selectedDistrict)?.name || "All Districts"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {districts.map((district) => (
              <SelectItem key={district.id} value={String(district.id)}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto text-sm text-muted-foreground">
          Showing {sections.length} sections
        </div>
      </div>

      {/* Sections Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-30">ID</TableHead>
              <TableHead>Section Name</TableHead>
              <TableHead>District</TableHead>
              <TableHead className="w-35">Created</TableHead>
              <TableHead className="w-25 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading sections...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24">
                  <div className="flex items-center justify-center gap-2 text-destructive">
                    <AlertTriangle className="size-4" />
                    <p className="text-sm">Error loading sections</p>
                    <p className="text-xs text-muted-foreground">{error.message}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : sections.length > 0 ? (
              sections.map((section: Section) => (
                <TableRow key={section.id}>
                  <TableCell className="font-medium text-brand-primary">
                    {section.section_id}
                  </TableCell>
                  <TableCell className="font-medium">{section.name}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/districts/${section.district}`}
                      className="text-brand-primary hover:underline"
                    >
                      {section.district_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(section.created_at), "d MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(section.id)}
                        className="hover:text-brand-primary"
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit section</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(section.id)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete section</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-muted-foreground">No sections found</p>
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

      {/* Add Section Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {/* Section Name Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="sectionName" className="text-sm font-medium">
                Section Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="sectionName"
                type="text"
                placeholder="Nahoru"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter the official section name.
              </p>
            </div>

            {/* District Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="district" className="text-sm font-medium">
                District <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedDistrictForNew ? String(selectedDistrictForNew) : ""}
                onValueChange={(value) => setSelectedDistrictForNew(value ? Number(value) : undefined)}
              >
                <SelectTrigger id="district">
                  <SelectValue placeholder="Select district">
                    {selectedDistrictForNew
                      ? districts.find((d) => d.id === selectedDistrictForNew)?.name
                      : "Select district"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={String(district.id)}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the district this section belongs to.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelAdd}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSection}
              disabled={!newSectionName.trim() || !selectedDistrictForNew || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Section"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {/* Section Name Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="editSectionName" className="text-sm font-medium">
                Section Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="editSectionName"
                type="text"
                placeholder="Ahero Section"
                value={editSectionName}
                onChange={(e) => setEditSectionName(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter the official section name.
              </p>
            </div>

            {/* District Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="editDistrict" className="text-sm font-medium">
                District <span className="text-red-500">*</span>
              </label>
              <Select
                value={editSelectedDistrict ? String(editSelectedDistrict) : ""}
                onValueChange={(value) => setEditSelectedDistrict(value ? Number(value) : undefined)}
              >
                <SelectTrigger id="editDistrict">
                  <SelectValue placeholder="Select district">
                    {editSelectedDistrict
                      ? districts.find((d) => d.id === editSelectedDistrict)?.name
                      : "Select district"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={String(district.id)}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the district this section belongs to.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editSectionName.trim() || !editSelectedDistrict || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Section"
              )}
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
              <h2 className="text-lg font-semibold">Delete Section?</h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">
                  {sectionToDelete?.name}
                </span>
                ? This action cannot be undone and will affect all related churches.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
