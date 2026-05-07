"use client";

import { useState } from "react";
import { PageHeader } from "@/components/global/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  Clock,
  List,
  LayoutGrid,
} from "lucide-react";
import {
  mockPastors,
  getPastorStats,
  getPastorRankStats,
} from "@/lib/mock-data/mock-pastors";
import { Pastor, PastorRank } from "@/types/pastor";
import { PASTOR_TITLE_COLORS } from "@/constants/pastor-status";

export function PastorsManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRank, setSelectedRank] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [pastors] = useState<Pastor[]>(mockPastors);

  const stats = getPastorStats();
  const rankStats = getPastorRankStats();

  // Filter pastors based on search and filters
  const filteredPastors = pastors.filter((pastor) => {
    const matchesSearch =
      pastor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pastor.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pastor.phone_number?.includes(searchQuery);

    const matchesRank =
      selectedRank === "all" || pastor.rank === selectedRank;

    const matchesStatus =
      selectedStatus === "all" || pastor.status === selectedStatus;

    return matchesSearch && matchesRank && matchesStatus;
  });

  const handleView = (id: string) => {
    console.log("View pastor:", id);
    // TODO: Navigate to pastor detail page
  };

  const handleEdit = (id: string) => {
    console.log("Edit pastor:", id);
    // TODO: Open edit modal
  };

  const handleDelete = (id: string) => {
    console.log("Delete pastor:", id);
    // TODO: Open delete confirmation
  };

  const handleAddPastor = () => {
    console.log("Add new pastor");
    // TODO: Open add pastor modal
  };

  const getRankBadgeClass = (rank: PastorRank) => {
    return PASTOR_TITLE_COLORS[rank];
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <PageHeader
        title="Pastors Manager"
        description="Maintain pastor records, track assignments, and manage retirement status."
        action={
          <Button onClick={handleAddPastor} size="default">
            <Plus className="size-4" />
            Add Pastor
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Total Pastors */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Users className="size-6 text-brand-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                Total Pastors
              </span>
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Active */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <UserCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Active</span>
              <span className="text-2xl font-bold">{stats.active}</span>
            </div>
          </CardContent>
        </Card>

        {/* Retired */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Clock className="size-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Retired</span>
              <span className="text-2xl font-bold">{stats.retired}</span>
            </div>
          </CardContent>
        </Card>

        {/* By Rank Chart */}
        <Card>
          <CardContent className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2">
              <LayoutGrid className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">By Rank</span>
            </div>
            <div className="flex items-end gap-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 rounded-t bg-brand-primary"
                  style={{ height: `${(rankStats.reverend / stats.total) * 60}px` }}
                />
                <span className="text-xs text-muted-foreground">Rev</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 rounded-t bg-blue-400"
                  style={{ height: `${(rankStats.bishop / stats.total) * 60}px` }}
                />
                <span className="text-xs text-muted-foreground">Bis</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 rounded-t bg-blue-300"
                  style={{ height: `${(rankStats.pastor / stats.total) * 60}px` }}
                />
                <span className="text-xs text-muted-foreground">Pas</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 rounded-t bg-emerald-400"
                  style={{ height: `${(rankStats.presbyter / stats.total) * 60}px` }}
                />
                <span className="text-xs text-muted-foreground">Pre</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 rounded-t bg-slate-300"
                  style={{ height: "30px" }}
                />
                <span className="text-xs text-muted-foreground">Oth</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, ID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={selectedRank}
          onValueChange={(value) => setSelectedRank(value || "all")}
        >
          <SelectTrigger className="w-fit min-w-37.5">
            <SelectValue placeholder="All Ranks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ranks</SelectItem>
            <SelectItem value="Reverend">Reverend</SelectItem>
            <SelectItem value="Bishop">Bishop</SelectItem>
            <SelectItem value="Pastor">Pastor</SelectItem>
            <SelectItem value="Presbyter">Presbyter</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value || "all")}
        >
          <SelectTrigger className="w-fit min-w-37.5">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
            <SelectItem value="deceased">Deceased</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredPastors.length} pastors
          </span>
          <div className="flex items-center rounded-lg border">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-muted" : ""}
            >
              <List className="size-4" />
              <span className="sr-only">List view</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-muted" : ""}
            >
              <LayoutGrid className="size-4" />
              <span className="sr-only">Grid view</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Pastors Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-30">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead className="w-35">Phone</TableHead>
              <TableHead className="w-30">Status</TableHead>
              <TableHead className="w-25">Service</TableHead>
              <TableHead className="w-30 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPastors.length > 0 ? (
              filteredPastors.map((pastor) => (
                <TableRow key={pastor.id}>
                  <TableCell className="font-medium text-brand-primary">
                    {pastor.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {pastor.full_name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getRankBadgeClass(pastor.rank)}
                    >
                      {pastor.rank}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {pastor.phone_number || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {pastor.status === "active" && (
                        <>
                          <div className="size-2 rounded-full bg-emerald-500" />
                          <span className="text-sm">Active</span>
                        </>
                      )}
                      {pastor.status === "retired" && (
                        <>
                          <div className="size-2 rounded-full bg-violet-500" />
                          <span className="text-sm">Retired</span>
                        </>
                      )}
                      {pastor.status === "deceased" && (
                        <>
                          <div className="size-2 rounded-full bg-slate-400" />
                          <span className="text-sm">Deceased</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {pastor.years_of_service
                      ? `${pastor.years_of_service} yrs`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleView(pastor.id)}
                        className="hover:text-brand-primary"
                      >
                        <Eye className="size-4" />
                        <span className="sr-only">View pastor</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(pastor.id)}
                        className="hover:text-brand-primary"
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit pastor</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(pastor.id)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete pastor</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      No pastors found
                    </p>
                    {searchQuery && (
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search query or filters
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
