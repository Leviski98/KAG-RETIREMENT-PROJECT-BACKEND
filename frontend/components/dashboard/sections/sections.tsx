"use client";

import { useState } from "react";
import { PageHeader } from "@/components/global/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

// Extended section interface with churches count
interface SectionWithDetails {
  id: string;
  section_name: string;
  district_id: string;
  district_name: string;
  churches_count: number;
  created_at: string;
}

// Mock data matching the design
const mockSectionsData: SectionWithDetails[] = [
  {
    id: "SEC018",
    section_name: "Ahero Section",
    district_id: "DIS001",
    district_name: "Kisumu Lakeside District",
    churches_count: 7,
    created_at: "2024-02-15T10:00:00Z",
  },
  {
    id: "SEC037",
    section_name: "Athi River Section",
    district_id: "DIS002",
    district_name: "Machakos Eastern District",
    churches_count: 6,
    created_at: "2024-03-10T10:00:00Z",
  },
  {
    id: "SEC075",
    section_name: "Awendo Section",
    district_id: "DIS003",
    district_name: "Migori South Nyanza District",
    churches_count: 6,
    created_at: "2024-06-01T10:00:00Z",
  },
  {
    id: "SEC014",
    section_name: "Bamburi Section",
    district_id: "DIS004",
    district_name: "Mombasa Coastal District",
    churches_count: 6,
    created_at: "2024-02-15T10:00:00Z",
  },
];

// Mock districts for dropdown
const mockDistricts = [
  { id: "DIS001", name: "Kisumu Lakeside District" },
  { id: "DIS002", name: "Machakos Eastern District" },
  { id: "DIS003", name: "Migori South Nyanza District" },
  { id: "DIS004", name: "Mombasa Coastal District" },
];

export function SectionsManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sections] = useState<SectionWithDetails[]>(mockSectionsData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [selectedDistrictForNew, setSelectedDistrictForNew] = useState("");

  // Filter sections based on search query
  const filteredSections = sections.filter(
    (section) =>
      section.section_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.district_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (id: string) => {
    console.log("Edit section:", id);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id: string) => {
    console.log("Delete section:", id);
    // TODO: Implement delete functionality
  };

  const handleAddSection = () => {
    setIsAddDialogOpen(true);
  };

  const handleSaveSection = () => {
    if (!newSectionName.trim() || !selectedDistrictForNew) {
      return;
    }

    console.log("Saving section:", {
      name: newSectionName,
      districtId: selectedDistrictForNew,
    });
    // TODO: Implement API call to save section

    // Reset form and close dialog
    setNewSectionName("");
    setSelectedDistrictForNew("");
    setIsAddDialogOpen(false);
  };

  const handleCancelAdd = () => {
    setNewSectionName("");
    setSelectedDistrictForNew("");
    setIsAddDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
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
          value={selectedDistrict}
          onValueChange={(value) => setSelectedDistrict(value || "all")}
        >
          <SelectTrigger className="w-fit min-w-45">
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            <SelectItem value="kisumu">Kisumu Lakeside</SelectItem>
            <SelectItem value="machakos">Machakos Eastern</SelectItem>
            <SelectItem value="migori">Migori South Nyanza</SelectItem>
            <SelectItem value="mombasa">Mombasa Coastal</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value || "all")}
        >
          <SelectTrigger className="w-fit min-w-37.5">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto text-sm text-muted-foreground">
          Showing {filteredSections.length} sections
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
              <TableHead className="w-30">Churches</TableHead>
              <TableHead className="w-35">Created</TableHead>
              <TableHead className="w-25 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSections.length > 0 ? (
              filteredSections.map((section) => (
                <TableRow key={section.id}>
                  <TableCell className="font-medium text-brand-primary">
                    {section.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {section.section_name}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/districts/${section.district_id}`}
                      className="text-brand-primary hover:underline"
                    >
                      {section.district_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                    >
                      {section.churches_count}
                    </Badge>
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
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      No sections found
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
                value={selectedDistrictForNew}
                onValueChange={(value) => setSelectedDistrictForNew(value || "")}
              >
                <SelectTrigger id="district">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {mockDistricts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
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
              disabled={!newSectionName.trim() || !selectedDistrictForNew}
            >
              Save Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
