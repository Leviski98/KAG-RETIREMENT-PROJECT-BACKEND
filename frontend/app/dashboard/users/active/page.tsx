"use client";

import { useAuth } from "@/components/providers";
import { useActiveUsers } from "@/lib/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
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

export default function ActiveUsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const isAdmin = !!user?.is_admin;

  const { data: active, isLoading } = useActiveUsers(isAdmin);

  if (!authLoading && !isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access restricted</CardTitle>
          <CardDescription>You need administrator access to view active users.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Active users</h1>
        <p className="text-sm text-muted-foreground">
          Accounts that have been approved and can sign in.
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
          ) : !active || active.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              There are no active users yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.is_admin ? "default" : "secondary"}>
                        {u.is_admin ? "Admin" : "Member"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(u.date_joined).toLocaleDateString()}
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
