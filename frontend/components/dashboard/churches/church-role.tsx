"use client";

import * as React from "react";
import { useState } from "react";
import { PencilIcon, Trash2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

import { mockChurchRoles } from "@/lib/mock-data/mock-church-roles";
import { MESSAGES } from "@/constants/message";
import type { ChurchRole, ChurchRoleFormData } from "@/types/church";

// ─── Role Form Dialog ─────────────────────────────────────────────────────────

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialData?: ChurchRoleFormData;
  onSubmit: (data: ChurchRoleFormData) => void;
}

function RoleFormDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: RoleFormDialogProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setError("");
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Role name is required.");
      return;
    }
    onSubmit({ name: name.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Role" : "Edit Role"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            label="Role Name"
            required
            description="E.g., Senior Pastor, Youth Pastor, Treasurer"
            error={error}
          >
            <Input
              placeholder="e.g. Senior Pastor, Youth Pastor, Treasurer"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
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
            <Button type="submit">Save Role</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Church Roles (main export) ───────────────────────────────────────────────

export function ChurchRoles() {
  const [roles, setRoles] = useState<ChurchRole[]>(mockChurchRoles);

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ChurchRole | null>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const nextId = () => {
    const num = roles.length + 1;
    return `ROL${String(num).padStart(3, "0")}`;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEdit = (role: ChurchRole) => {
    setSelectedRole(role);
    setEditOpen(true);
  };

  const handleDelete = (role: ChurchRole) => {
    setSelectedRole(role);
    setDeleteOpen(true);
  };

  const handleAddSubmit = (data: ChurchRoleFormData) => {
    const newRole: ChurchRole = {
      id: nextId(),
      name: data.name,
      assignments: 0,
    };
    setRoles((prev) => [...prev, newRole]);
    toast.success(MESSAGES.ROLE.ADD_SUCCESS);
  };

  const handleEditSubmit = (data: ChurchRoleFormData) => {
    if (!selectedRole) return;
    setRoles((prev) =>
      prev.map((r) =>
        r.id === selectedRole.id ? { ...r, name: data.name } : r
      )
    );
    toast.success(MESSAGES.ROLE.EDIT_SUCCESS);
    setSelectedRole(null);
  };

  const handleDeleteConfirm = () => {
    if (!selectedRole) return;
    setRoles((prev) => prev.filter((r) => r.id !== selectedRole.id));
    toast.success(MESSAGES.ROLE.DELETE_SUCCESS);
    setDeleteOpen(false);
    setSelectedRole(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {roles.length} {roles.length === 1 ? "role" : "roles"} defined
        </p>
        <Button onClick={() => setAddOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          Add Role
        </Button>
      </div>

      {/* Table */}
      {roles.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-30">ID</TableHead>
              <TableHead>Role Name</TableHead>
              <TableHead className="text-right">Assignments</TableHead>
              <TableHead className="w-25 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-mono text-primary">
                  {role.id}
                </TableCell>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell className="text-right">
                  <span className="font-medium text-brand-success">
                    {role.assignments}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEdit(role)}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-brand-error"
                      onClick={() => handleDelete(role)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          title={MESSAGES.EMPTY.ROLES}
          description={MESSAGES.EMPTY.ROLES_DESCRIPTION}
          action={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              Add Role
            </Button>
          }
        />
      )}

      {/* Add Role Dialog */}
      <RoleFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        mode="add"
        onSubmit={handleAddSubmit}
      />

      {/* Edit Role Dialog */}
      <RoleFormDialog
        open={editOpen}
        onOpenChange={(open: boolean) => {
          setEditOpen(open);
          if (!open) setSelectedRole(null);
        }}
        mode="edit"
        initialData={selectedRole ? { name: selectedRole.name } : undefined}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open: boolean) => {
          setDeleteOpen(open);
          if (!open) setSelectedRole(null);
        }}
        title={MESSAGES.ROLE.DELETE_CONFIRM_TITLE}
        description={
          selectedRole
            ? MESSAGES.ROLE.DELETE_CONFIRM_DESCRIPTION(selectedRole.name)
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
