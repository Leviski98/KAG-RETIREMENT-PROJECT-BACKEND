"use client";

import { useState } from "react";
import { PageHeader } from "@/components/global/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Printer,
  ExternalLink,
  AlertTriangle,
  Download,
  ChevronDown,
  UserX,
  X,
  Loader2,
} from "lucide-react";
import { mockChurches } from "@/lib/mock-data/mock-churches";
import { useDistricts } from "@/lib/hooks/use-districts";
import { useSections } from "@/lib/hooks/use-sections";
import { usePastors, useCreatePastor, useUpdatePastor, useDeletePastor } from "@/lib/hooks/use-pastors";
import { Pastor, PastorRank, PastorStatus } from "@/types/pastor";
import { toast } from "sonner";
import { PASTOR_TITLE_COLORS } from "@/constants/pastor-status";

export function PastorsManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRank, setSelectedRank] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedChurch, setSelectedChurch] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Fetch data from API
  const { data: pastorsData, isLoading, error } = usePastors({ search: searchQuery });
  const { data: districtsData } = useDistricts();
  const { data: sectionsData } = useSections();

  const pastors = pastorsData?.results || [];
  const districts = districtsData?.results || [];
  const sections = sectionsData?.results || [];

  // Mutations
  const createMutation = useCreatePastor();
  const updateMutation = useUpdatePastor();
  const deleteMutation = useDeletePastor();

  // Add Pastor Dialog State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "Male",
    dateOfBirth: "",
    nationalId: "",
    phoneNumber: "+254",
    pastorRank: "Pastor",
    startOfService: "",
    status: "active",
  });

  // Pastor Detail Sheet State
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedPastor, setSelectedPastor] = useState<Pastor | null>(null);

  // Edit Pastor Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    gender: "Male",
    dateOfBirth: "",
    nationalId: "",
    phoneNumber: "+254",
    pastorRank: "Pastor",
    startOfService: "",
    status: "active",
  });
  const [originalEditFormData, setOriginalEditFormData] = useState({
    fullName: "",
    gender: "Male",
    dateOfBirth: "",
    nationalId: "",
    phoneNumber: "+254",
    pastorRank: "Pastor",
    startOfService: "",
    status: "active",
  });

  // Delete Pastor Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPastorId, setDeletingPastorId] = useState<number | null>(null);

  // Export dropdown state
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Calculate stats from current pastors state
  const stats = {
    total: pastors.length,
    active: pastors.filter((p) => p.status === "active").length,
    retired: pastors.filter((p) => p.status === "retired").length,
    suspended: pastors.filter((p) => p.status === "suspended").length,
    deceased: pastors.filter((p) => p.status === "deceased").length,
  };

  const rankStats = {
    archbishop: pastors.filter((p) => p.pastor_rank === "ArchBishop").length,
    bishop: pastors.filter((p) => p.pastor_rank === "Bishop").length,
    presbyter: pastors.filter((p) => p.pastor_rank === "Presbyter").length,
    reverend: pastors.filter((p) => p.pastor_rank === "Reverend").length,
    pastor: pastors.filter((p) => p.pastor_rank === "Pastor").length,
  };

  // Cascading filter logic: get available sections based on selected district
  const availableSections = selectedDistrict === "all"
    ? sections
    : sections.filter(section => section.district === Number(selectedDistrict));

  // Cascading filter logic: get available churches based on selected section
  const availableChurches = selectedSection === "all"
    ? mockChurches
    : mockChurches.filter(church => {
        // Find the selected section's name to match with church.section
        const section = sections.find(s => s.id === Number(selectedSection));
        return section ? church.section === section.name : false;
      });

  // Reset section when district changes
  const handleDistrictChange = (value: string | null) => {
    setSelectedDistrict(value || "all");
    setSelectedSection("all");
    setSelectedChurch("all");
  };

  // Reset church when section changes
  const handleSectionChange = (value: string | null) => {
    setSelectedSection(value || "all");
    setSelectedChurch("all");
  };

  // Filter pastors based on search and filters
  const filteredPastors = pastors.filter((pastor) => {
    const matchesSearch =
      pastor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pastor.pastor_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pastor.phone_number?.includes(searchQuery);

    const matchesRank =
      selectedRank === "all" || pastor.pastor_rank === selectedRank;

    const matchesStatus =
      selectedStatus === "all" || pastor.status === selectedStatus;

    // TODO: Add district/section/church filtering when assignment relationships are implemented
    // const matchesDistrict =
    //   selectedDistrict === "all" || pastor.district_id === selectedDistrict;

    return matchesSearch && matchesRank && matchesStatus;
  });

  const handleView = (id: number) => {
    const pastor = pastors.find((p) => p.id === id);
    if (pastor) {
      setSelectedPastor(pastor);
      setIsDetailSheetOpen(true);
    }
  };

  const handleEdit = (id: number) => {
    const pastor = pastors.find((p) => p.id === id);
    if (pastor) {
      const formData = {
        fullName: pastor.full_name,
        gender: pastor.gender,
        dateOfBirth: pastor.date_of_birth ? pastor.date_of_birth.split("T")[0] : "",
        nationalId: pastor.national_id || "",
        phoneNumber: pastor.phone_number || "+254",
        pastorRank: pastor.pastor_rank,
        startOfService: pastor.start_of_service ? pastor.start_of_service.split("T")[0] : "",
        status: pastor.status,
      };

      setEditFormData(formData);
      setOriginalEditFormData(formData);
      setSelectedPastor(pastor);
      setIsEditDialogOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setDeletingPastorId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingPastorId) {
      try {
        await deleteMutation.mutateAsync(deletingPastorId);

        setIsDeleteDialogOpen(false);
        setDeletingPastorId(null);

        // Show success message
        toast.success("Pastor deleted successfully");
      } catch (error) {
        console.error("Error deleting pastor:", error);
        toast.error("Failed to delete pastor");
      }
    } else {
      setIsDeleteDialogOpen(false);
      setDeletingPastorId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeletingPastorId(null);
  };

  const handleAddPastor = () => {
    setIsAddDialogOpen(true);
  };

  const handleSavePastor = async () => {
    // Validate required fields
    if (
      !formData.fullName.trim() ||
      !formData.gender.trim() ||
      !formData.dateOfBirth ||
      !formData.nationalId.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.pastorRank.trim() ||
      !formData.status.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createMutation.mutateAsync({
        full_name: formData.fullName,
        gender: formData.gender as "Male" | "Female",
        pastor_rank: formData.pastorRank as PastorRank,
        national_id: formData.nationalId,
        date_of_birth: formData.dateOfBirth,
        phone_number: formData.phoneNumber,
        start_of_service: formData.startOfService || undefined,
        status: formData.status as PastorStatus,
      });

      // Reset form and close dialog
      setFormData({
        fullName: "",
        gender: "Male",
        dateOfBirth: "",
        nationalId: "",
        phoneNumber: "+254",
        pastorRank: "Pastor",
        startOfService: "",
        status: "active",
      });
      setIsAddDialogOpen(false);

      toast.success("Pastor added successfully");
    } catch (error) {
      console.error("Error creating pastor:", error);
      toast.error("Failed to create pastor");
    }
  };

  const handleCancelAdd = () => {
    setFormData({
      fullName: "",
      gender: "Male",
      dateOfBirth: "",
      nationalId: "",
      phoneNumber: "+254",
      pastorRank: "Pastor",
      startOfService: "",
      status: "active",
    });
    setIsAddDialogOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!editFormData.fullName.trim() || !editFormData.phoneNumber.trim() || !selectedPastor) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: selectedPastor.id,
        data: {
          full_name: editFormData.fullName,
          gender: editFormData.gender as "Male" | "Female",
          pastor_rank: editFormData.pastorRank as PastorRank,
          national_id: editFormData.nationalId || undefined,
          date_of_birth: editFormData.dateOfBirth,
          phone_number: editFormData.phoneNumber,
          start_of_service: editFormData.startOfService || undefined,
          status: editFormData.status as PastorStatus,
        },
      });

      // Reset form and close dialog
      setEditFormData({
        fullName: "",
        gender: "Male",
        dateOfBirth: "",
        nationalId: "",
        phoneNumber: "+254",
        pastorRank: "Pastor",
        startOfService: "",
        status: "active",
      });
      setOriginalEditFormData({
        fullName: "",
        gender: "Male",
        dateOfBirth: "",
        nationalId: "",
        phoneNumber: "+254",
        pastorRank: "Pastor",
        startOfService: "",
        status: "active",
      });
      setIsEditDialogOpen(false);

      toast.success("Pastor updated successfully");
    } catch (error) {
      console.error("Error updating pastor:", error);
      toast.error("Failed to update pastor");
    }
  };

  const handleCancelEdit = () => {
    setEditFormData({
      fullName: "",
      gender: "Male",
      dateOfBirth: "",
      nationalId: "",
      phoneNumber: "+254",
      pastorRank: "Pastor",
      startOfService: "",
      status: "active",
    });
    setOriginalEditFormData({
      fullName: "",
      gender: "Male",
      dateOfBirth: "",
      nationalId: "",
      phoneNumber: "+254",
      pastorRank: "Pastor",
      startOfService: "",
      status: "active",
    });
    setIsEditDialogOpen(false);
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Helper function to calculate years of service
  const calculateYearsOfService = (startOfService: string | null): number => {
    if (!startOfService) return 0;

    const startDate = new Date(startOfService);
    const today = new Date();
    let years = today.getFullYear() - startDate.getFullYear();
    const monthDiff = today.getMonth() - startDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < startDate.getDate())) {
      years--;
    }

    return Math.max(0, years);
  };

  // Helper function to calculate projected retirement (age 70)
  const calculateProjectedRetirement = (dateOfBirth: string): string => {
    const birthDate = new Date(dateOfBirth);
    const retirementAge = 70;
    const retirementYear = birthDate.getFullYear() + retirementAge;
    const retirementMonth = birthDate.toLocaleString('default', { month: 'short' });
    return `${retirementMonth} ${retirementYear}`;
  };

  // Helper function to calculate remaining tenure until retirement
  const calculateRemainingTenure = (dateOfBirth: string, status: PastorStatus): number => {
    if (status === 'deceased' || status === 'retired') return 0;

    const age = calculateAge(dateOfBirth);
    return Math.max(0, 70 - age);
  };

  // Check if edit form has changes
  const hasEditFormChanges = () => {
    return (
      editFormData.fullName !== originalEditFormData.fullName ||
      editFormData.gender !== originalEditFormData.gender ||
      editFormData.dateOfBirth !== originalEditFormData.dateOfBirth ||
      editFormData.nationalId !== originalEditFormData.nationalId ||
      editFormData.phoneNumber !== originalEditFormData.phoneNumber ||
      editFormData.pastorRank !== originalEditFormData.pastorRank ||
      editFormData.startOfService !== originalEditFormData.startOfService ||
      editFormData.status !== originalEditFormData.status
    );
  };

  const getRankBadgeClass = (rank: PastorRank) => {
    // Map backend rank to display rank for colors
    const displayRank = rank === 'ArchBishop' ? 'Archbishop' : rank;
    return PASTOR_TITLE_COLORS[displayRank as keyof typeof PASTOR_TITLE_COLORS] || PASTOR_TITLE_COLORS.Pastor;
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleExportPDF = (exportAll: boolean) => {
    const dataToExport = exportAll ? pastors : filteredPastors;
    const exportType = exportAll ? "All Pastors" : "Filtered Results";

    // Create print-friendly content
    const printWindow = window.open('', '_blank', 'height=800,width=1000');

    if (!printWindow) {
      // Popup was blocked
      alert('Popup blocked! Please allow popups for this site to export PDF.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pastors Export - ${exportType}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
              color: #1a1a1a;
            }
            .subtitle {
              color: #666;
              margin-bottom: 20px;
              font-size: 14px;
            }
            .print-button-container {
              margin-bottom: 20px;
              display: flex;
              gap: 12px;
            }
            .print-button {
              background-color: #2563eb;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              gap: 8px;
            }
            .print-button:hover {
              background-color: #1d4ed8;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f8f9fa;
              font-weight: 600;
              color: #1a1a1a;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .status-active { color: #059669; font-weight: 500; }
            .status-retired { color: #7c3aed; font-weight: 500; }
            .status-suspended { color: #dc2626; font-weight: 500; }
            .status-deceased { color: #6b7280; font-weight: 500; }
            .text-center { text-align: center; }
            @media print {
              body { padding: 10px; }
              .print-button-container { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Pastors Manager - ${exportType}</h1>
          <div class="subtitle">
            ${dataToExport.length} records | Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            ${!exportAll && searchQuery ? `<br/>Search: "${searchQuery}"` : ''}
            ${!exportAll && selectedRank !== 'all' ? `<br/>Rank: ${selectedRank}` : ''}
            ${!exportAll && selectedStatus !== 'all' ? `<br/>Status: ${selectedStatus}` : ''}
          </div>
          <div class="print-button-container">
            <button class="print-button" onclick="window.print()">
              🖨️ Print / Save as PDF
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Rank</th>
                <th>Status</th>
                <th class="text-center">Age</th>
                <th class="text-center">Years Served</th>
                <th>Proj. Retirement</th>
                <th class="text-center">Remaining Tenure</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              ${dataToExport.map(pastor => `
                <tr>
                  <td>${pastor.pastor_id}</td>
                  <td>${pastor.full_name}</td>
                  <td>${pastor.pastor_rank}</td>
                  <td class="status-${pastor.status}">${pastor.status.charAt(0).toUpperCase() + pastor.status.slice(1)}</td>
                  <td class="text-center">${calculateAge(pastor.date_of_birth) || '-'}</td>
                  <td class="text-center">${calculateYearsOfService(pastor.start_of_service) || '0'} yrs</td>
                  <td>${calculateProjectedRetirement(pastor.date_of_birth) || '-'}</td>
                  <td class="text-center">${calculateRemainingTenure(pastor.date_of_birth, pastor.status)} yrs</td>
                  <td>${pastor.phone_number || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Focus the window and let user choose when to print
      printWindow.focus();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
      printWindow.close();
    }

    setIsExportDropdownOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-brand-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Loading pastors...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <AlertTriangle className="size-12 text-destructive" />
            <p className="text-sm font-medium">Failed to load pastors</p>
            <p className="text-xs text-muted-foreground">Please try again later</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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

        {/* Suspended */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <UserX className="size-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Suspended</span>
              <span className="text-2xl font-bold">{stats.suspended}</span>
            </div>
          </CardContent>
        </Card>

        {/* Deceased */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <X className="size-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Deceased</span>
              <span className="text-2xl font-bold">{stats.deceased}</span>
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
              {/* Archbishop */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 rounded-t bg-amber-400"
                  style={{ height: `${rankStats.archbishop > 0 ? (rankStats.archbishop / stats.total) * 60 : 2}px` }}
                />
                <span className="text-xs text-muted-foreground">Arc</span>
              </div>
              {/* Bishop */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 rounded-t bg-blue-400"
                  style={{ height: `${rankStats.bishop > 0 ? (rankStats.bishop / stats.total) * 60 : 2}px` }}
                />
                <span className="text-xs text-muted-foreground">Bis</span>
              </div>
              {/* Presbyter */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 rounded-t bg-purple-400"
                  style={{ height: `${rankStats.presbyter > 0 ? (rankStats.presbyter / stats.total) * 60 : 2}px` }}
                />
                <span className="text-xs text-muted-foreground">Pre</span>
              </div>
              {/* Reverend */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 rounded-t bg-emerald-400"
                  style={{ height: `${rankStats.reverend > 0 ? (rankStats.reverend / stats.total) * 60 : 2}px` }}
                />
                <span className="text-xs text-muted-foreground">Rev</span>
              </div>
              {/* Pastor */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 rounded-t bg-slate-400"
                  style={{ height: `${rankStats.pastor > 0 ? (rankStats.pastor / stats.total) * 60 : 2}px` }}
                />
                <span className="text-xs text-muted-foreground">Pas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-xs min-w-[200px]">
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
            <SelectValue placeholder="All Ranks">
              {selectedRank === "all" ? "All Ranks" : selectedRank}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ranks</SelectItem>
            <SelectItem value="Archbishop">Archbishop</SelectItem>
            <SelectItem value="Bishop">Bishop</SelectItem>
            <SelectItem value="Presbyter">Presbyter</SelectItem>
            <SelectItem value="Reverend">Reverend</SelectItem>
            <SelectItem value="Pastor">Pastor</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value || "all")}
        >
          <SelectTrigger className="w-fit min-w-37.5">
            <SelectValue placeholder="All Status">
              {selectedStatus === "all"
                ? "All Status"
                : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="deceased">Deceased</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedDistrict}
          onValueChange={handleDistrictChange}
        >
          <SelectTrigger className="w-fit min-w-37.5">
            <SelectValue placeholder="All Districts">
              {selectedDistrict === "all"
                ? "All Districts"
                : districts.find(d => d.id === Number(selectedDistrict))?.name || "All Districts"}
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

        <Select
          value={selectedSection}
          onValueChange={handleSectionChange}
          disabled={selectedDistrict === "all"}
        >
          <SelectTrigger className="w-fit min-w-37.5">
            <SelectValue placeholder="All Sections">
              {selectedSection === "all"
                ? "All Sections"
                : availableSections.find(s => s.id === Number(selectedSection))?.name || "All Sections"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {availableSections.map((section) => (
              <SelectItem key={section.id} value={String(section.id)}>
                {section.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedChurch}
          onValueChange={(value) => setSelectedChurch(value || "all")}
          disabled={selectedSection === "all"}
        >
          <SelectTrigger className="w-fit min-w-37.5">
            <SelectValue placeholder="All Churches">
              {selectedChurch === "all"
                ? "All Churches"
                : availableChurches.find(c => c.id === selectedChurch)?.name || "All Churches"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Churches</SelectItem>
            {availableChurches.map((church) => (
              <SelectItem key={church.id} value={church.id}>
                {church.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredPastors.length} pastors
          </span>

          <DropdownMenu open={isExportDropdownOpen} onOpenChange={setIsExportDropdownOpen}>
            <DropdownMenuTrigger>
              <Button variant="outline" size="default" className="gap-2">
                <Download className="size-4" />
                Export PDF
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-2 py-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Export as PDF
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleExportPDF(true)}
                className="flex flex-col items-start py-3 cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">All Pastors</span>
                  <Printer className="size-4 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {pastors.length} records
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExportPDF(false)}
                className="flex flex-col items-start py-3 cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">Filtered Results</span>
                  <Printer className="size-4 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {searchQuery || selectedRank !== 'all' || selectedStatus !== 'all' || selectedDistrict !== 'all' || selectedSection !== 'all' || selectedChurch !== 'all'
                    ? `${filteredPastors.length} records with active filters`
                    : 'No filters applied'}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <p className="text-xs text-muted-foreground">
                  Includes all auto-calculated fields
                </p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
              <TableHead className="w-20">ID</TableHead>
              <TableHead className="min-w-40">Name</TableHead>
              <TableHead className="w-28">Rank</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-16 text-center">Age</TableHead>
              <TableHead className="w-28 text-center">Years Served</TableHead>
              <TableHead className="w-32 text-center">Proj. Retirement</TableHead>
              <TableHead className="w-32 text-center">Remaining Tenure</TableHead>
              <TableHead className="w-36">Phone</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPastors.length > 0 ? (
              filteredPastors.map((pastor) => (
                <TableRow key={pastor.id}>
                  <TableCell className="font-medium text-brand-primary">
                    {pastor.pastor_id}
                  </TableCell>
                  <TableCell className="font-medium">
                    <button
                      onClick={() => handleView(pastor.id)}
                      className="text-left hover:text-brand-primary hover:underline transition-colors"
                    >
                      {pastor.full_name}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getRankBadgeClass(pastor.pastor_rank)}
                    >
                      {pastor.pastor_rank}
                    </Badge>
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
                      {pastor.status === "suspended" && (
                        <>
                          <div className="size-2 rounded-full bg-amber-500" />
                          <span className="text-sm">Suspended</span>
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
                  <TableCell className="text-muted-foreground text-center">
                    {calculateAge(pastor.date_of_birth)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-center">
                    {calculateYearsOfService(pastor.start_of_service)} yrs
                  </TableCell>
                  <TableCell className="text-muted-foreground text-center">
                    {calculateProjectedRetirement(pastor.date_of_birth)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-center">
                    {calculateRemainingTenure(pastor.date_of_birth, pastor.status)} yrs
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {pastor.phone_number || "—"}
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
                <TableCell colSpan={10} className="h-24 text-center">
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

      {/* Add Pastor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Pastor</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Personal Information Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-brand-primary uppercase tracking-wider">
                Personal Information
              </h3>

              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="e.g. James Kamau"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  autoFocus
                />
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-2">
                <Label>Gender <span className="text-red-500">*</span></Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, gender: value })
                  }
                  className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Male" id="male" />
                    <Label htmlFor="male" className="font-normal cursor-pointer">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Female" id="female" />
                    <Label htmlFor="female" className="font-normal cursor-pointer">
                      Female
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="dateOfBirth">Date of Birth <span className="text-red-500">*</span></Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                />
              </div>

              {/* National ID */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="nationalId">National ID <span className="text-red-500">*</span></Label>
                <Input
                  id="nationalId"
                  type="text"
                  placeholder="e.g. 12345678"
                  value={formData.nationalId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
                    setFormData({ ...formData, nationalId: value });
                  }}
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Must be exactly 8 digits
                </p>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="phoneNumber">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+254XXXXXXXXX"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const input = e.target.value;
                    // Always keep +254 prefix
                    if (!input.startsWith('+254')) {
                      setFormData({ ...formData, phoneNumber: '+254' });
                      return;
                    }
                    // Extract digits after +254 and limit to 9
                    const digits = input.slice(4).replace(/[^0-9]/g, '').slice(0, 9);
                    setFormData({ ...formData, phoneNumber: '+254' + digits });
                  }}
                  onKeyDown={(e) => {
                    // Prevent deleting the +254 prefix
                    if ((e.key === 'Backspace' || e.key === 'Delete') &&
                        e.currentTarget.selectionStart !== null &&
                        e.currentTarget.selectionStart <= 4) {
                      e.preventDefault();
                    }
                  }}
                  maxLength={13}
                />
                <p className="text-xs text-muted-foreground">
                  Enter 9 digits after +254
                </p>
              </div>
            </div>

            {/* Ministry Information Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-brand-primary uppercase tracking-wider">
                Ministry Information
              </h3>

              {/* Pastor Rank */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="pastorRank">Pastor Rank <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.pastorRank}
                  onValueChange={(value) =>
                    setFormData({ ...formData, pastorRank: value || "Pastor" })
                  }
                >
                  <SelectTrigger id="pastorRank">
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Archbishop">Archbishop</SelectItem>
                    <SelectItem value="Bishop">Bishop</SelectItem>
                    <SelectItem value="Presbyter">Presbyter</SelectItem>
                    <SelectItem value="Reverend">Reverend</SelectItem>
                    <SelectItem value="Pastor">Pastor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start of Service */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="startOfService">
                  Start of Service <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startOfService"
                  type="date"
                  value={formData.startOfService}
                  onChange={(e) =>
                    setFormData({ ...formData, startOfService: e.target.value })
                  }
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value || "active" })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="deceased">Deceased</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelAdd}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePastor}
              disabled={
                !formData.fullName.trim() ||
                !formData.gender.trim() ||
                !formData.dateOfBirth ||
                !formData.nationalId.trim() ||
                formData.nationalId.length !== 8 ||
                !formData.phoneNumber.trim() ||
                formData.phoneNumber.length !== 13 ||
                !formData.pastorRank.trim() ||
                !formData.startOfService ||
                !formData.status.trim()
              }
              className="flex-1 sm:flex-none"
            >
              Save Pastor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Pastor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Pastor</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Personal Information Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-brand-primary uppercase tracking-wider">
                Personal Information
              </h3>

              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="editFullName">
                  Full Name
                </Label>
                <Input
                  id="editFullName"
                  type="text"
                  placeholder="e.g. James Kamau"
                  value={editFormData.fullName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, fullName: e.target.value })
                  }
                  autoFocus
                />
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-2">
                <Label>Gender</Label>
                <RadioGroup
                  value={editFormData.gender}
                  onValueChange={(value: string) =>
                    setEditFormData({ ...editFormData, gender: value })
                  }
                  className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Male" id="editMale" />
                    <Label htmlFor="editMale" className="font-normal cursor-pointer">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Female" id="editFemale" />
                    <Label htmlFor="editFemale" className="font-normal cursor-pointer">
                      Female
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="editDateOfBirth">Date of Birth</Label>
                <Input
                  id="editDateOfBirth"
                  type="date"
                  value={editFormData.dateOfBirth}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, dateOfBirth: e.target.value })
                  }
                />
              </div>

              {/* National ID */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="editNationalId">National ID</Label>
                <Input
                  id="editNationalId"
                  type="text"
                  placeholder="e.g. 12345678"
                  value={editFormData.nationalId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
                    setEditFormData({ ...editFormData, nationalId: value });
                  }}
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Must be exactly 8 digits
                </p>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="editPhoneNumber">
                  Phone Number
                </Label>
                <Input
                  id="editPhoneNumber"
                  type="tel"
                  placeholder="+254XXXXXXXXX"
                  value={editFormData.phoneNumber}
                  onChange={(e) => {
                    const input = e.target.value;
                    // Always keep +254 prefix
                    if (!input.startsWith('+254')) {
                      setEditFormData({ ...editFormData, phoneNumber: '+254' });
                      return;
                    }
                    // Extract digits after +254 and limit to 9
                    const digits = input.slice(4).replace(/[^0-9]/g, '').slice(0, 9);
                    setEditFormData({ ...editFormData, phoneNumber: '+254' + digits });
                  }}
                  onKeyDown={(e) => {
                    // Prevent deleting the +254 prefix
                    if ((e.key === 'Backspace' || e.key === 'Delete') &&
                        e.currentTarget.selectionStart !== null &&
                        e.currentTarget.selectionStart <= 4) {
                      e.preventDefault();
                    }
                  }}
                  maxLength={13}
                />
                <p className="text-xs text-muted-foreground">
                  Enter 9 digits after +254
                </p>
              </div>
            </div>

            {/* Ministry Information Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-brand-primary uppercase tracking-wider">
                Ministry Information
              </h3>

              {/* Pastor Rank */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="editPastorRank">Pastor Rank</Label>
                <Select
                  value={editFormData.pastorRank}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, pastorRank: value || "Pastor" })
                  }
                >
                  <SelectTrigger id="editPastorRank">
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Archbishop">Archbishop</SelectItem>
                    <SelectItem value="Bishop">Bishop</SelectItem>
                    <SelectItem value="Presbyter">Presbyter</SelectItem>
                    <SelectItem value="Reverend">Reverend</SelectItem>
                    <SelectItem value="Pastor">Pastor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start of Service */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="editStartOfService">
                  Start of Service
                </Label>
                <Input
                  id="editStartOfService"
                  type="date"
                  value={editFormData.startOfService}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, startOfService: e.target.value })
                  }
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, status: value || "active" })
                  }
                >
                  <SelectTrigger id="editStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="deceased">Deceased</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={
                !editFormData.fullName.trim() ||
                !editFormData.phoneNumber.trim() ||
                !editFormData.startOfService ||
                !hasEditFormChanges()
              }
              className="flex-1 sm:flex-none"
            >
              Save Pastor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Pastor Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <AlertTriangle className="size-8 text-yellow-600 dark:text-yellow-500" />
            </div>

            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-lg font-semibold">Delete Pastor?</h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">
                  {deletingPastorId
                    ? pastors.find((p) => p.id === deletingPastorId)?.full_name
                    : ""}
                </span>
                ? This action cannot be undone and will remove all associated assignments.
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

      {/* Pastor Detail Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
          {selectedPastor && (
            <div className="flex flex-col h-full">
              {/* Header with Avatar */}
              <div className="flex flex-col items-center gap-4 pt-8 pb-6 px-6">
                <Avatar size="lg" className="size-20">
                  <AvatarFallback className="bg-brand-primary text-white text-2xl font-semibold">
                    {getInitials(selectedPastor.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    {selectedPastor.full_name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={getRankBadgeClass(selectedPastor.pastor_rank)}
                    >
                      {selectedPastor.pastor_rank}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={
                        selectedPastor.status === "active"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : selectedPastor.status === "retired"
                          ? "bg-violet-100 text-violet-700 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400"
                          : selectedPastor.status === "suspended"
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-900/30 dark:text-slate-400"
                      }
                    >
                      ● {selectedPastor.status.charAt(0).toUpperCase() + selectedPastor.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Content Section */}
              <div className="flex-1 px-6 py-6 space-y-6">
                {/* Personal Information */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-semibold">Personal Information</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Pastor ID
                      </span>
                      <span className="text-sm font-medium">
                        {selectedPastor.pastor_id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Gender</span>
                      <span className="text-sm font-medium">
                        Male
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Date of Birth
                      </span>
                      <span className="text-sm font-medium">
                        {selectedPastor.date_of_birth
                          ? new Date(selectedPastor.date_of_birth).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        National ID
                      </span>
                      <span className="text-sm font-medium">
                        {selectedPastor.national_id || "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Phone</span>
                      <span className="text-sm font-medium">
                        {selectedPastor.phone_number || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Ministry Service */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-semibold">Ministry Service</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Start of Service
                      </span>
                      <span className="text-sm font-medium">
                        1 June 1992
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Years Active
                      </span>
                      <span className="text-sm font-medium">
                        {calculateYearsOfService(selectedPastor.start_of_service)} years
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedPastor.status === "active"
                          ? "Current Assignments"
                          : "Last Assignment"}
                      </span>
                      <div className="flex flex-col gap-0.5 bg-muted/50 p-3 rounded-md">
                        <span className="text-sm font-medium">
                          {/* TODO: Add church assignment relationship */}
                          —
                        </span>
                        <span className="text-xs text-brand-primary">
                          {/* TODO: Add role field to pastor */}
                          —
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t p-6 space-y-2">
                <Button
                  onClick={() => {
                    setIsDetailSheetOpen(false);
                    if (selectedPastor) {
                      handleEdit(selectedPastor.id);
                    }
                  }}
                  className="w-full"
                >
                  <Pencil className="size-4" />
                  Edit Pastor
                </Button>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="size-4" />
                  View Assignments
                </Button>
                <Button variant="outline" className="w-full">
                  <Printer className="size-4" />
                  Print Profile
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
        </>
      )}
    </div>
  );
}
