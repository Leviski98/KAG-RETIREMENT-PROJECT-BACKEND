"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  Trash2Icon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { FormField } from "@/components/patterns/form-field";
import { EmptyState } from "@/components/patterns/empty-state";

import type { ApiPastor } from "@/lib/api/churches";
import {
  useChurches,
  useChurchRoles,
  useCreatePastorAssignment,
  useDeletePastorAssignment,
  usePastorAssignments,
  usePastors,
} from "@/lib/hooks/use-church-module";
import { MESSAGES } from "@/constants/message";
import { PASTOR_TITLE_COLORS } from "@/constants/pastor-status";
import type {
  Church,
  PastorAssignment,
  PastorAssignmentFormData,
} from "@/types/church";

const ITEMS_PER_PAGE = 10;
const EMPTY_ASSIGNMENTS: PastorAssignment[] = [];
const EMPTY_CHURCHES: Church[] = [];
const EMPTY_PASTORS: ApiPastor[] = [];

// ─── Assignment Form Dialog ───────────────────────────────────────────────────

interface AssignmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PastorAssignmentFormData) => void;
  churches: Pick<Church, "id" | "name">[];
  pastors: ApiPastor[];
  roles: { id: string; name: string }[];
}

function AssignmentFormDialog({
  open,
  onOpenChange,
  onSubmit,
  churches,
  pastors,
  roles,
}: AssignmentFormDialogProps) {
  const [churchId, setChurchId] = useState("");
  const [pastorId, setPastorId] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof PastorAssignmentFormData, string>>
  >({});

  React.useEffect(() => {
    if (open) {
      setChurchId("");
      setPastorId("");
      setRole("");
      setErrors({});
    }
  }, [open]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PastorAssignmentFormData, string>> =
      {};
    if (!churchId) newErrors.churchId = "Please select a church.";
    if (!pastorId) newErrors.pastorId = "Please select a pastor.";
    if (!role) newErrors.role = "Please select a role.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ churchId, pastorId, role });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Pastor Assignment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Church" required error={errors.churchId}>
            <Select
              value={churchId}
              onValueChange={(v) => setChurchId(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <span className="flex flex-1 text-left">
                  {churchId
                    ? churches.find((c) => String(c.id) === churchId)?.name
                    : <span className="text-muted-foreground">Select a church</span>}
                </span>
              </SelectTrigger>
              <SelectContent>
                {churches.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Pastor" required error={errors.pastorId}>
            <Select
              value={pastorId}
              onValueChange={(v) => setPastorId(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <span className="flex flex-1 text-left">
                  {pastorId
                    ? pastors.find((p) => String(p.id) === pastorId)?.full_name
                    : <span className="text-muted-foreground">Select a pastor</span>}
                </span>
              </SelectTrigger>
              <SelectContent>
                {pastors.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Role" required error={errors.role}>
            <Select value={role} onValueChange={(v) => setRole(v ?? "")}>
              <SelectTrigger className="w-full">
                <span className="flex flex-1 text-left">
                  {role
                    ? roles.find((r) => r.id === role)?.name
                    : <span className="text-muted-foreground">Select a role</span>}
                </span>
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  // value = role ID so the parent can send it directly to the API
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Assignment</Button>
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

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

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
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="icon-sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
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

// ─── Pastor Assignments (main export) ─────────────────────────────────────────

export function PastorAssignments() {
  const assignmentsQuery = usePastorAssignments();
  const churchesQuery = useChurches();
  const pastorsQuery = usePastors();
  const rolesQuery = useChurchRoles();
  const createAssignment = useCreatePastorAssignment();
  const deleteAssignment = useDeletePastorAssignment();
  const assignments = assignmentsQuery.data ?? EMPTY_ASSIGNMENTS;
  const formChurches = churchesQuery.data ?? EMPTY_CHURCHES;
  const formPastors = pastorsQuery.data ?? EMPTY_PASTORS;
  const formRoles = (rolesQuery.data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
  }));
  const loading =
    assignmentsQuery.isLoading ||
    churchesQuery.isLoading ||
    pastorsQuery.isLoading ||
    rolesQuery.isLoading;
  const error =
    assignmentsQuery.error ??
    churchesQuery.error ??
    pastorsQuery.error ??
    rolesQuery.error;

  // Filters
  const [churchFilter, setChurchFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<PastorAssignment | null>(null);

  const availableChurches = useMemo(() => {
    const set = new Set(assignments.map((a) => a.churchName));
    return Array.from(set).sort();
  }, [assignments]);

  const availableRoles = useMemo(() => {
    const set = new Set(assignments.map((a) => a.role));
    return Array.from(set).sort();
  }, [assignments]);

  // ── Filtered data ─────────────────────────────────────────────────────────

  const filteredAssignments = useMemo(() => {
    let result = [...assignments];
    if (churchFilter !== "all") {
      result = result.filter((a) => a.churchName === churchFilter);
    }
    if (roleFilter !== "all") {
      result = result.filter((a) => a.role === roleFilter);
    }
    return result;
  }, [assignments, churchFilter, roleFilter]);

  const totalPages = Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE);
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [churchFilter, roleFilter]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDelete = (assignment: PastorAssignment) => {
    setSelectedAssignment(assignment);
    setDeleteOpen(true);
  };

  const handleAddSubmit = async (data: PastorAssignmentFormData) => {
    try {
      await createAssignment.mutateAsync({
        churchId: data.churchId,
        pastorId: data.pastorId,
        roleId: data.role,
      });
      toast.success(MESSAGES.ASSIGNMENT.ADD_SUCCESS);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add assignment.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAssignment) return;
    try {
      await deleteAssignment.mutateAsync(selectedAssignment.id);
      toast.success(MESSAGES.ASSIGNMENT.DELETE_SUCCESS);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete assignment.");
    } finally {
      setDeleteOpen(false);
      setSelectedAssignment(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        Loading assignments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-brand-error">
        {error instanceof Error ? error.message : "Failed to load assignments"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: Filters + Count + Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Church filter */}
          <Select
            value={churchFilter}
            onValueChange={(v) => setChurchFilter(v ?? "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Churches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Churches</SelectItem>
              {availableChurches.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Role filter */}
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v ?? "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {availableRoles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <p className="shrink-0 text-sm text-muted-foreground">
            {filteredAssignments.length}{" "}
            {filteredAssignments.length === 1 ? "assignment" : "assignments"}
          </p>
          <Button onClick={() => setAddOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            Add Assignment
          </Button>
        </div>
      </div>

      {/* Table */}
      {paginatedAssignments.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Church</TableHead>
              <TableHead>Pastor</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead className="w-18 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAssignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  {assignment.churchName}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{assignment.pastorName}</span>
                    <Badge
                      variant="secondary"
                      className={
                        PASTOR_TITLE_COLORS[assignment.pastorTitle]
                      }
                    >
                      {assignment.pastorTitle}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-primary">
                    {assignment.role}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {assignment.assignedDate}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-brand-error"
                    onClick={() => handleDelete(assignment)}
                  >
                    <Trash2Icon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          title={MESSAGES.EMPTY.ASSIGNMENTS}
          description={MESSAGES.EMPTY.ASSIGNMENTS_DESCRIPTION}
          action={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              Add Assignment
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

      {/* Add Assignment Dialog */}
      <AssignmentFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAddSubmit}
        churches={formChurches}
        pastors={formPastors}
        roles={formRoles}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setSelectedAssignment(null);
        }}
        title={MESSAGES.ASSIGNMENT.DELETE_CONFIRM_TITLE}
        description={
          selectedAssignment
            ? MESSAGES.ASSIGNMENT.DELETE_CONFIRM_DESCRIPTION(
                selectedAssignment.pastorName,
                selectedAssignment.churchName
              )
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
