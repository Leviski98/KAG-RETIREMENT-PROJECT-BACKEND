"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  BuildingIcon,
  MapPinIcon,
  EyeIcon,
  PencilIcon,
  Trash2Icon,
  SearchIcon,
  PlusIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { FormField } from "@/components/patterns/form-field";
import { EmptyState } from "@/components/patterns/empty-state";

import { mockChurches } from "@/lib/mock-data/mock-churches";
import { SECTIONS } from "@/constants/sections";
import { MESSAGES } from "@/constants/message";
import type { Church, ChurchFormData, SortField } from "@/types/church";

const ITEMS_PER_PAGE = 9;

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "name", label: "Sort by: Name" },
  { value: "location", label: "Sort by: Location" },
  { value: "createdAt", label: "Sort by: Created Date" },
];

// ─── Church Card ──────────────────────────────────────────────────────────────

interface ChurchCardProps {
  church: Church;
  onView: (church: Church) => void;
  onEdit: (church: Church) => void;
  onDelete: (church: Church) => void;
}

function ChurchCard({ church, onView, onEdit, onDelete }: ChurchCardProps) {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <BuildingIcon className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{church.name}</p>
          </div>
        </div>
        <CardAction>
          <Badge
            variant="secondary"
            className="gap-1 bg-brand-primary-subtle text-brand-success dark:bg-brand-primary/20 dark:text-brand-success"
          >
            <UsersIcon className="size-3" />
            {church.pastorCount} {church.pastorCount === 1 ? "pastor" : "pastors"}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPinIcon className="size-3 shrink-0" />
          <span className="truncate">{church.location}</span>
        </div>
        <div className="truncate">
          Section: {church.section}
        </div>
      </CardContent>

      <CardFooter className="gap-1">
        <Button
          variant="ghost"
          size="xs"
          className="text-brand-primary hover:text-brand-primary-darker"
          onClick={() => onView(church)}
        >
          <EyeIcon data-icon="inline-start" />
          View
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="text-muted-foreground"
          onClick={() => onEdit(church)}
        >
          <PencilIcon data-icon="inline-start" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="text-brand-error hover:text-brand-error"
          onClick={() => onDelete(church)}
        >
          <Trash2Icon data-icon="inline-start" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Church Form Dialog ───────────────────────────────────────────────────────

interface ChurchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialData?: ChurchFormData;
  onSubmit: (data: ChurchFormData) => void;
}

function ChurchFormDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: ChurchFormDialogProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [section, setSection] = useState(initialData?.section ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [errors, setErrors] = useState<Partial<Record<keyof ChurchFormData, string>>>({});

  // Reset form when dialog opens/closes or initialData changes
  React.useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setSection(initialData?.section ?? "");
      setLocation(initialData?.location ?? "");
      setErrors({});
    }
  }, [open, initialData]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ChurchFormData, string>> = {};
    if (!name.trim()) newErrors.name = "Church name is required.";
    if (!section) newErrors.section = "Please select a section.";
    if (!location.trim()) newErrors.location = "Location is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: name.trim(), section, location: location.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Church" : "Edit Church"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            label="Church Name"
            required
            description="Enter the official church name."
            error={errors.name}
          >
            <Input
              placeholder="e.g. KAG Cathedral Nairobi"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
          </FormField>

          <FormField
            label="Section"
            required
            description="Select the section this church belongs to."
            error={errors.section}
          >
            <Select value={section} onValueChange={(v: string) => setSection(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((s: string) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Location"
            required
            description="Physical address or location description."
            error={errors.location}
          >
            <Input
              placeholder="e.g. Kenyatta Avenue, Nakuru"
              value={location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === "add" ? "Save Church" : "Save Church"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeftIcon />
        </Button>
        {getPageNumbers().map((page, i) =>
          page === "ellipsis" ? (
            <span key={`e-${i}`} className="px-1 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="icon-sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="icon-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}

// ─── All Churches (main export) ───────────────────────────────────────────────

interface AllChurchesProps {
  externalAddOpen?: boolean;
  onAddOpenChange?: (open: boolean) => void;
}

export function AllChurches({ 
  externalAddOpen, 
  onAddOpenChange 
}: AllChurchesProps = {}) {
  // Data state (simulating mutable list)
  const [churches, setChurches] = useState<Church[]>(mockChurches);

  // Filter / sort state
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state (use external state if provided, otherwise internal)
  const [internalAddOpen, setInternalAddOpen] = useState(false);
  const addOpen = externalAddOpen ?? internalAddOpen;
  const setAddOpen = onAddOpenChange ?? setInternalAddOpen;
  
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);

  // ── Filtered & sorted data ──────────────────────────────────────────────────

  const filteredChurches = useMemo(() => {
    let result = [...churches];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }

    // Section filter
    if (sectionFilter !== "all") {
      result = result.filter((c) => c.section === sectionFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "location") return a.location.localeCompare(b.location);
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return result;
  }, [churches, search, sectionFilter, sortBy]);

  const totalPages = Math.ceil(filteredChurches.length / ITEMS_PER_PAGE);
  const paginatedChurches = filteredChurches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, sectionFilter, sortBy]);

  // ── Unique sections from data ───────────────────────────────────────────────

  const availableSections = useMemo(() => {
    const set = new Set(churches.map((c) => c.section));
    return Array.from(set).sort();
  }, [churches]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleView = (church: Church) => {
    // For now, could navigate to detail page
    toast.info(`Viewing ${church.name}`);
  };

  const handleEdit = (church: Church) => {
    setSelectedChurch(church);
    setEditOpen(true);
  };

  const handleDelete = (church: Church) => {
    setSelectedChurch(church);
    setDeleteOpen(true);
  };

  const handleAddSubmit = (data: ChurchFormData) => {
    const newChurch: Church = {
      id: String(Date.now()),
      name: data.name,
      location: data.location,
      section: data.section,
      pastorCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setChurches((prev) => [...prev, newChurch]);
    toast.success(MESSAGES.CHURCH.ADD_SUCCESS);
  };

  const handleEditSubmit = (data: ChurchFormData) => {
    if (!selectedChurch) return;
    setChurches((prev) =>
      prev.map((c) =>
        c.id === selectedChurch.id
          ? { ...c, name: data.name, section: data.section, location: data.location }
          : c
      )
    );
    toast.success(MESSAGES.CHURCH.EDIT_SUCCESS);
    setSelectedChurch(null);
  };

  const handleDeleteConfirm = () => {
    if (!selectedChurch) return;
    setChurches((prev) => prev.filter((c) => c.id !== selectedChurch.id));
    toast.success(MESSAGES.CHURCH.DELETE_SUCCESS);
    setDeleteOpen(false);
    setSelectedChurch(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: Search + Filters + Count */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full max-w-55">
            <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search churches or locations..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Section filter */}
          <Select value={sectionFilter} onValueChange={(v: string) => setSectionFilter(v ?? "all")}>
            <SelectTrigger>
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {availableSections.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v: string) => setSortBy((v ?? "name") as SortField)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="shrink-0 text-sm text-muted-foreground">
          Showing {filteredChurches.length}{" "}
          {filteredChurches.length === 1 ? "church" : "churches"}
        </p>
      </div>

      {/* Church Cards Grid */}
      {paginatedChurches.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedChurches.map((church) => (
            <ChurchCard
              key={church.id}
              church={church}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={MESSAGES.EMPTY.CHURCHES}
          description={MESSAGES.EMPTY.CHURCHES_DESCRIPTION}
          action={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              Add Church
            </Button>
          }
        />
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Add Church Dialog */}
      <ChurchFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        mode="add"
        onSubmit={handleAddSubmit}
      />

      {/* Edit Church Dialog */}
      <ChurchFormDialog
        open={editOpen}
        onOpenChange={(open: boolean) => {
          setEditOpen(open);
          if (!open) setSelectedChurch(null);
        }}
        mode="edit"
        initialData={
          selectedChurch
            ? {
                name: selectedChurch.name,
                section: selectedChurch.section,
                location: selectedChurch.location,
              }
            : undefined
        }
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open: boolean) => {
          setDeleteOpen(open);
          if (!open) setSelectedChurch(null);
        }}
        title={MESSAGES.CHURCH.DELETE_CONFIRM_TITLE}
        description={
          selectedChurch
            ? MESSAGES.CHURCH.DELETE_CONFIRM_DESCRIPTION(selectedChurch.name)
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
