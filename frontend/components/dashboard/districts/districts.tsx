"use client";

import { useState } from "react";
import { PageHeader } from "@/components/global/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

// Extended district interface with sections count
interface DistrictWithSections {
  id: string;
  district_name: string;
  sections_count: number;
  created_at: string;
}

// Mock data matching the design
const mockDistrictsData: DistrictWithSections[] = [
  {
    id: "DIS015",
    district_name: "Bungoma Western District",
    sections_count: 5,
    created_at: "2024-05-01T10:00:00Z",
  },
  {
    id: "DIS005",
    district_name: "Eldoret North Rift District",
    sections_count: 5,
    created_at: "2024-02-01T10:00:00Z",
  },
  {
    id: "DIS012",
    district_name: "Embu Eastern District",
    sections_count: 3,
    created_at: "2024-04-01T10:00:00Z",
  },
  {
    id: "DIS009",
    district_name: "Garissa North Eastern District",
    sections_count: 2,
    created_at: "2024-03-15T10:00:00Z",
  },
];

export function DistrictsManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [districts] = useState<DistrictWithSections[]>(mockDistrictsData);

  // Filter districts based on search query
  const filteredDistricts = districts.filter((district) =>
    district.district_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    district.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (id: string) => {
    console.log("Edit district:", id);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id: string) => {
    console.log("Delete district:", id);
    // TODO: Implement delete functionality
  };

  const handleAddDistrict = () => {
    console.log("Add new district");
    // TODO: Implement add district functionality
  };

  return (
    <div className="flex flex-col gap-6 p-6">
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

      {/* Search and Filter Bar */}
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
        
        <Select value={selectedFilter} onValueChange={(value) => setSelectedFilter(value || "all")}>
          <SelectTrigger className="w-fit">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

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
              <TableHead className="w-30">Sections</TableHead>
              <TableHead className="w-35">Created</TableHead>
              <TableHead className="w-25 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDistricts.length > 0 ? (
              filteredDistricts.map((district) => (
                <TableRow key={district.id}>
                  <TableCell className="font-medium text-brand-primary">
                    {district.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {district.district_name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                    >
                      {district.sections_count}
                    </Badge>
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
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit district</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(district.id)}
                        className="hover:text-destructive"
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
    </div>
  );
}
