"use client";

import { toast } from "sonner";

import { useAuth } from "@/components/providers";
import { usePendingUsers, useApproveUser } from "@/lib/hooks/use-auth";
import { ApiRequestError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const isAdmin = !!user?.is_admin;

  const { data: pending, isLoading } = usePendingUsers(isAdmin);
  const approve = useApproveUser();

  function handleApprove(id: number, email: string) {
    approve.mutate(id, {
      onSuccess: () => toast.success(`Approved ${email}.`),
      onError: (err) => {
        toast.error(
          err instanceof ApiRequestError ? err.message : "Could not approve this user."
        );
      },
    });
  }

  if (!authLoading && !isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access restricted</CardTitle>
          <CardDescription>You need administrator access to approve accounts.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Pending approvals</h1>
        <p className="text-sm text-muted-foreground">
          Accounts that have verified their email and are waiting to be activated.
        </p>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2 py-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : !pending || pending.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No accounts are waiting for approval.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(u.date_joined).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(u.id, u.email)}
                        disabled={approve.isPending}
                      >
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
