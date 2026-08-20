"use client";

import { useState, useRef, useEffect } from "react";
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
  Plus as PlusIcon,
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
  UserX,
  X,
  Loader2,
} from "lucide-react";
import { useDistricts } from "@/lib/hooks/use-districts";
import { useSections } from "@/lib/hooks/use-sections";
import { useChurches } from "@/lib/hooks/use-church-module";
import { usePastors, useCreatePastor, useUpdatePastor, useDeletePastor } from "@/lib/hooks/use-pastors";
import { useSettings } from "@/lib/hooks/use-settings";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Pastor, PastorRank, PastorStatus } from "@/types/pastor";
import { toast } from "sonner";
import {
  PASTOR_TITLE_COLORS,
  PASTOR_RANK_MAP,
  PASTOR_STATUS_LABELS,
} from "@/constants/pastor-status";
import { EmptyState } from "@/components/patterns/empty-state";

export function PastorsManager() {
  const { data: settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRank, setSelectedRank] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedChurch, setSelectedChurch] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  // Ref to maintain search input focus
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build query parameters for backend filtering
  const queryParams = {
    search: debouncedSearchQuery,
    pastor_rank: selectedRank !== "all" ? (selectedRank as PastorRank) : undefined,
    status: selectedStatus !== "all" ? (selectedStatus as PastorStatus) : undefined,
    district: selectedDistrict !== "all" ? Number(selectedDistrict) : undefined,
    section: selectedSection !== "all" ? Number(selectedSection) : undefined,
    church: selectedChurch !== "all" ? Number(selectedChurch) : undefined,
  };

  // Fetch data from API with all filters applied on backend
  const { data: pastorsData, isLoading, isFetching, error } = usePastors(queryParams);
  const { data: districtsData } = useDistricts();
  const { data: sectionsData } = useSections();
  const { data: churchesData } = useChurches();
  
  // Maintain focus on search input when user is actively searching
  useEffect(() => {
    if (isSearchFocused && searchInputRef.current && document.activeElement !== searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [pastorsData, isSearchFocused]); // Re-run when data updates

  const pastors = pastorsData?.results || [];
  const districts = districtsData?.results || [];
  const sections = sectionsData?.results || [];
  const churches = churchesData || [];

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
    endOfService: "",
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
    endOfService: "",
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
    endOfService: "",
    status: "active",
  });

  // Delete Pastor Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPastorId, setDeletingPastorId] = useState<number | null>(null);

  // Calculate stats from current pastors state
  const stats = {
    total: pastors.length,
    active: pastors.filter((p) => p.status === "active").length,
    retired: pastors.filter((p) => p.status === "retired").length,
    suspended: pastors.filter((p) => p.status === "suspended").length,
    deceased: pastors.filter((p) => p.status === "deceased").length,
  };

  // Cascading filter logic: get available sections based on selected district
  const availableSections = selectedDistrict === "all"
    ? sections
    : sections.filter(section => section.district === Number(selectedDistrict));

  // Cascading filter logic: get available churches based on selected section
  const availableChurches = selectedSection === "all"
    ? churches
    : churches.filter((church: { sectionId: number }) => church.sectionId === Number(selectedSection));

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

  // All filtering is now done on the backend, so we use pastors directly
  const filteredPastors = pastors;

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
        endOfService: pastor.end_of_service ? pastor.end_of_service.split("T")[0] : "",
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

    // Validate Date of Birth is not in the future
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (birthDate > today) {
        toast.error("Date of Birth cannot be in the future");
        return;
      }
    }

    // Validate Start of Service is not in the future
    if (formData.startOfService) {
      const serviceDate = new Date(formData.startOfService + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (serviceDate > today) {
        toast.error("Start of Service cannot be in the future");
        return;
      }
    }

    // Validate Start of Service is after Date of Birth
    if (formData.startOfService && formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth + 'T00:00:00');
      const serviceDate = new Date(formData.startOfService + 'T00:00:00');
      
      if (serviceDate <= birthDate) {
        toast.error("Start of Service must be after Date of Birth");
        return;
      }
    }

    // Validate End of Service is required for non-active statuses
    if (['retired', 'suspended', 'deceased'].includes(formData.status)) {
      if (!formData.endOfService) {
        toast.error("End of Service is required for retired, suspended, or deceased pastors");
        return;
      }

      // Validate End of Service is not in the future
      const endDate = new Date(formData.endOfService + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (endDate > today) {
        toast.error("End of Service cannot be in the future");
        return;
      }

      // Validate End of Service is after Start of Service
      if (formData.startOfService) {
        const startDate = new Date(formData.startOfService + 'T00:00:00');
        if (endDate <= startDate) {
          toast.error("End of Service must be after Start of Service");
          return;
        }
      }

      // Validate End of Service is after Date of Birth
      if (formData.dateOfBirth) {
        const birthDate = new Date(formData.dateOfBirth + 'T00:00:00');
        if (endDate <= birthDate) {
          toast.error("End of Service must be after Date of Birth");
          return;
        }
      }
    }

    // Check for existing active Archbishop
    if (formData.pastorRank === "ArchBishop" && formData.status === "active") {
      const existingActiveArchbishop = pastors.find(
        (p) => p.pastor_rank === "ArchBishop" && p.status === "active"
      );
      
      if (existingActiveArchbishop) {
        toast.error(
          `Only one active Archbishop is allowed. ${existingActiveArchbishop.full_name} is currently the active Archbishop.`,
          { duration: 5000 }
        );
        return;
      }
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
        end_of_service: formData.endOfService || undefined,
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
        endOfService: "",
        status: "active",
      });
      setIsAddDialogOpen(false);

      toast.success("Pastor added successfully");
    } catch (error: unknown) {
      console.error("Error creating pastor:", error);
      
      // Check if the error is about the Archbishop constraint
      let errorMessage = "Failed to create pastor";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { non_field_errors?: string[]; detail?: string } } }).response;
        errorMessage = response?.data?.non_field_errors?.[0] || response?.data?.detail || errorMessage;
      }
      
      toast.error(errorMessage, { duration: 5000 });
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
      endOfService: "",
      status: "active",
    });
    setIsAddDialogOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!editFormData.fullName.trim() || !editFormData.phoneNumber.trim() || !selectedPastor) {
      toast.error("Please fill in required fields");
      return;
    }

    // Validate Date of Birth is not in the future
    if (editFormData.dateOfBirth) {
      const birthDate = new Date(editFormData.dateOfBirth + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (birthDate > today) {
        toast.error("Date of Birth cannot be in the future");
        return;
      }
    }

    // Validate Start of Service is not in the future
    if (editFormData.startOfService) {
      const serviceDate = new Date(editFormData.startOfService + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (serviceDate > today) {
        toast.error("Start of Service cannot be in the future");
        return;
      }
    }

    // Validate Start of Service is after Date of Birth
    if (editFormData.startOfService && editFormData.dateOfBirth) {
      const birthDate = new Date(editFormData.dateOfBirth + 'T00:00:00');
      const serviceDate = new Date(editFormData.startOfService + 'T00:00:00');
      
      if (serviceDate <= birthDate) {
        toast.error("Start of Service must be after Date of Birth");
        return;
      }
    }

    // Validate End of Service is required for non-active statuses
    if (['retired', 'suspended', 'deceased'].includes(editFormData.status)) {
      if (!editFormData.endOfService) {
        toast.error("End of Service is required for retired, suspended, or deceased pastors");
        return;
      }

      // Validate End of Service is not in the future
      const endDate = new Date(editFormData.endOfService + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (endDate > today) {
        toast.error("End of Service cannot be in the future");
        return;
      }

      // Validate End of Service is after Start of Service
      if (editFormData.startOfService) {
        const startDate = new Date(editFormData.startOfService + 'T00:00:00');
        if (endDate <= startDate) {
          toast.error("End of Service must be after Start of Service");
          return;
        }
      }

      // Validate End of Service is after Date of Birth
      if (editFormData.dateOfBirth) {
        const birthDate = new Date(editFormData.dateOfBirth + 'T00:00:00');
        if (endDate <= birthDate) {
          toast.error("End of Service must be after Date of Birth");
          return;
        }
      }
    }

    // Check for existing active Archbishop (excluding the current pastor being edited)
    if (editFormData.pastorRank === "ArchBishop" && editFormData.status === "active") {
      const existingActiveArchbishop = pastors.find(
        (p) => p.pastor_rank === "ArchBishop" && p.status === "active" && p.id !== selectedPastor.id
      );
      
      if (existingActiveArchbishop) {
        toast.error(
          `Only one active Archbishop is allowed. ${existingActiveArchbishop.full_name} is currently the active Archbishop.`,
          { duration: 5000 }
        );
        return;
      }
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
          end_of_service: editFormData.endOfService || undefined,
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
        endOfService: "",
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
        endOfService: "",
        status: "active",
      });
      setIsEditDialogOpen(false);

      toast.success("Pastor updated successfully");
    } catch (error: unknown) {
      console.error("Error updating pastor:", error);
      
      // Check if the error is about the Archbishop constraint
      let errorMessage = "Failed to update pastor";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { non_field_errors?: string[]; detail?: string } } }).response;
        errorMessage = response?.data?.non_field_errors?.[0] || response?.data?.detail || errorMessage;
      }
      
      toast.error(errorMessage, { duration: 5000 });
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
      endOfService: "",
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
      endOfService: "",
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
  const calculateYearsOfService = (startOfService: string | null, status: PastorStatus = 'active', endOfService: string | null = null): number => {
    if (!startOfService) return 0;

    const startDate = new Date(startOfService);
    // Use end of service date for non-active pastors, otherwise use today
    const endDate = (['retired', 'suspended', 'deceased'].includes(status) && endOfService) 
      ? new Date(endOfService)
      : new Date();
    
    let years = endDate.getFullYear() - startDate.getFullYear();
    const monthDiff = endDate.getMonth() - startDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < startDate.getDate())) {
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

  // Helper function to get retirement date based on status
  const getRetirementDate = (pastor: Pastor): string => {
    // For retired, deceased, or suspended pastors, show actual end of service date if available
    if (['retired', 'deceased', 'suspended'].includes(pastor.status) && pastor.end_of_service) {
      const endDate = new Date(pastor.end_of_service);
      const month = endDate.toLocaleString('default', { month: 'short' });
      const year = endDate.getFullYear();
      return `${month} ${year}`;
    }
    // For active pastors or those without end_of_service, show projected retirement
    return calculateProjectedRetirement(pastor.date_of_birth);
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
      editFormData.endOfService !== originalEditFormData.endOfService ||
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

  const handleExportPDF = () => {
    const dataToExport = filteredPastors;

    // Calculate position for right side of screen
    const windowWidth = 1000;
    const windowHeight = 800;
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;
    const leftPosition = screenWidth - windowWidth - 20; // 20px from right edge
    const topPosition = (screenHeight - windowHeight) / 2; // Vertically centered

    // Create print-friendly content positioned on the right
    const printWindow = window.open(
      '', 
      '_blank', 
      `width=${windowWidth},height=${windowHeight},left=${leftPosition},top=${topPosition},resizable=yes,scrollbars=yes`
    );

    if (!printWindow) {
      // Popup was blocked
      alert('Popup blocked! Please allow popups for this site to export PDF.');
      return;
    }

    // Build filter summary
    const filters = [];
    if (searchQuery) filters.push(`Search: "${searchQuery}"`);
    if (selectedRank !== 'all') filters.push(`Rank: ${selectedRank}`);
    if (selectedStatus !== 'all') filters.push(`Status: ${selectedStatus}`);
    if (selectedDistrict !== 'all') {
      const district = districts.find(d => d.id === Number(selectedDistrict));
      if (district) filters.push(`District: ${district.name}`);
    }
    if (selectedSection !== 'all') {
      const section = sections.find(s => s.id === Number(selectedSection));
      if (section) filters.push(`Section: ${section.name}`);
    }
    if (selectedChurch !== 'all') {
      const church = churches.find(c => c.id === selectedChurch);
      if (church) filters.push(`Church: ${church.name}`);
    }
    const filterSummary = filters.length > 0 ? `<br/>Filters: ${filters.join(', ')}` : '<br/>No filters applied';

    // This window has no access to app/globals.css, so the org's actual
    // logo/name (same fallback the sidebar uses) has to be resolved here
    // rather than assumed.
    const orgName = (settings?.org_name || 'Kenya Assemblies of God').toUpperCase();
    const logoSrc = settings?.org_logo || `${window.location.origin}/images/logo.png`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pastors Export</title>
          <style>
            /*
             * This opens in its own window (window.open('')), so it can't
             * load app/globals.css or see the app's CSS custom properties —
             * they're duplicated here as a local :root, mirroring the brand
             * tokens' values. Keep this in sync if the palette changes.
             *
             * Also aligns .status-retired/.status-suspended with the colours
             * used everywhere else in this file (stat cards, status dots,
             * badges): retired as info/blue, suspended as warning/amber.
             * The previous version used violet for retired and red for
             * suspended, matching neither.
             */
            :root {
              --ink: #3A3A3C;
              --ink-muted: #6B758B;
              --heading: #003A70;
              --line: #C7C9D9;
              --surface-1: #F2F2F5;
              --surface-2: #FAFAFC;
              --success: #0A844B;
              --info: #0553D1;
              --warning: #8F6E0A;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: var(--ink);
            }
            .letterhead {
              text-align: center;
              margin-bottom: 4px;
            }
            .letterhead img {
              width: 48px;
              height: 48px;
              object-fit: contain;
              margin-bottom: 8px;
            }
            .org-name {
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              color: var(--heading);
              margin-bottom: 4px;
            }
            h1 {
              font-size: 24px;
              margin: 0 0 10px;
              color: var(--ink);
              text-align: center;
            }
            .subtitle {
              color: var(--ink-muted);
              margin-bottom: 20px;
              font-size: 14px;
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid var(--line);
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: var(--surface-1);
              font-weight: 600;
              color: var(--ink);
            }
            tr:nth-child(even) {
              background-color: var(--surface-2);
            }
            .status-active { color: var(--success); font-weight: 500; }
            .status-retired { color: var(--info); font-weight: 500; }
            .status-suspended { color: var(--warning); font-weight: 500; }
            .status-deceased { color: var(--ink-muted); font-weight: 500; }
            .text-center { text-align: center; }
            @media print {
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <img src="${logoSrc}" alt="" />
            <div class="org-name">${orgName}</div>
            <h1>Pastors Manager</h1>
          </div>
          <div class="subtitle">
            ${dataToExport.length} records | Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            ${filterSummary}
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
                <th>Retirement Date</th>
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
                  <td class="text-center">${calculateYearsOfService(pastor.start_of_service, pastor.status, pastor.end_of_service) || '0'} yrs</td>
                  <td>${getRetirementDate(pastor) || '-'}</td>
                  <td class="text-center">${calculateRemainingTenure(pastor.date_of_birth, pastor.status)} yrs</td>
                  <td>${pastor.phone_number || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            // Automatically open print dialog when page loads
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 100);
            };
            
            // Close window after print dialog is closed (whether printed or cancelled)
            window.onafterprint = function() {
              window.close();
            };
          </script>
        </body>
      </html>
    `;

    try {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
      printWindow.close();
    }
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
            <PlusIcon className="size-4" />
            Add Pastor
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-70' : 'opacity-100'}`}>
        {/* Total Pastors */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
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
            <div className="flex size-12 items-center justify-center rounded-lg bg-brand-success/10">
              <UserCheck className="size-6 text-brand-success" />
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
            <div className="flex size-12 items-center justify-center rounded-lg bg-chart-4/15">
              <Clock className="size-6 text-chart-4" />
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
            <div className="flex size-12 items-center justify-center rounded-lg bg-brand-warning/10">
              <UserX className="size-6 text-brand-warning" />
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
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
              <X className="size-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Deceased</span>
              <span className="text-2xl font-bold">{stats.deceased}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-xs min-w-[200px]">
          {isFetching && !isLoading ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-brand-primary" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          )}
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search by name or National ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="pl-9"
          />
        </div>

        <Select
          value={selectedRank}
          onValueChange={(value) => setSelectedRank(value || "all")}
        >
          <SelectTrigger className="w-fit min-w-37.5">
            <SelectValue placeholder="All Ranks">
              {selectedRank === "all" ? "All Ranks" : selectedRank === "ArchBishop" ? "Archbishop" : selectedRank}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ranks</SelectItem>
            <SelectItem value="ArchBishop">Archbishop</SelectItem>
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

        {selectedDistrict !== "all" && (
          <Select
            value={selectedSection}
            onValueChange={handleSectionChange}
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
        )}

        {selectedSection !== "all" && (
          <Select
            value={selectedChurch}
            onValueChange={(value) => setSelectedChurch(value || "all")}
          >
            <SelectTrigger className="w-fit min-w-37.5">
              <SelectValue placeholder="All Churches">
                {selectedChurch === "all"
                  ? "All Churches"
                  : availableChurches.find((c: { id: string }) => c.id === selectedChurch)?.name || "All Churches"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Churches</SelectItem>
              {availableChurches.map((church: { id: string; name: string }) => (
                <SelectItem key={church.id} value={church.id}>
                  {church.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredPastors.length} pastors
          </span>

          <Button variant="outline" size="default" className="gap-2" onClick={handleExportPDF}>
            <Download className="size-4" />
            Export PDF
          </Button>

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
      <div className={`rounded-lg border bg-card transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-70' : 'opacity-100'}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead className="min-w-40">Name</TableHead>
              <TableHead className="w-28">Rank</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-16 text-center">Age</TableHead>
              <TableHead className="w-28 text-center">Years Served</TableHead>
              <TableHead className="w-32 text-center">Retirement Date</TableHead>
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
                          <div className="size-2 rounded-full bg-brand-success-fill" />
                          <span className="text-sm">Active</span>
                        </>
                      )}
                      {pastor.status === "retired" && (
                        <>
                          <div className="size-2 rounded-full bg-chart-4" />
                          <span className="text-sm">Retired</span>
                        </>
                      )}
                      {pastor.status === "suspended" && (
                        <>
                          <div className="size-2 rounded-full bg-brand-warning-fill" />
                          <span className="text-sm">Suspended</span>
                        </>
                      )}
                      {pastor.status === "deceased" && (
                        <>
                          <div className="size-2 rounded-full bg-muted-foreground" />
                          <span className="text-sm">Deceased</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-center">
                    {calculateAge(pastor.date_of_birth)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-center">
                    {calculateYearsOfService(pastor.start_of_service, pastor.status, pastor.end_of_service)} yrs
                  </TableCell>
                  <TableCell className="text-muted-foreground text-center">
                    {getRetirementDate(pastor)}
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
                <TableCell colSpan={10} className="py-0">
                  <EmptyState
                    title="No pastors found"
                    action={
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        <PlusIcon data-icon="inline-start" />
                        Add Pastor
                      </Button>
                    }
                  />
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
                  Full Name <span className="text-destructive">*</span>
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
                <Label>Gender <span className="text-destructive">*</span></Label>
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
                <Label htmlFor="dateOfBirth">Date of Birth <span className="text-destructive">*</span></Label>
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
                <Label htmlFor="nationalId">National ID <span className="text-destructive">*</span></Label>
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
                  Phone Number <span className="text-destructive">*</span>
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
                <Label htmlFor="pastorRank">Pastor Rank <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.pastorRank}
                  onValueChange={(value) =>
                    setFormData({ ...formData, pastorRank: value || "Pastor" })
                  }
                >
                  <SelectTrigger id="pastorRank">
                    {/* value ("ArchBishop") differs from its label ("Archbishop"),
                        and this Select doesn't resolve that on its own — without
                        explicit children the trigger shows the raw value. */}
                    <SelectValue placeholder="Select rank">
                      {PASTOR_RANK_MAP[formData.pastorRank] ?? formData.pastorRank}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ArchBishop">Archbishop</SelectItem>
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
                  Start of Service <span className="text-destructive">*</span>
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

              {/* End of Service - Only show for non-active statuses */}
              {['retired', 'suspended', 'deceased'].includes(formData.status) && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="endOfService">
                    End of Service <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endOfService"
                    type="date"
                    value={formData.endOfService}
                    onChange={(e) =>
                      setFormData({ ...formData, endOfService: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for retired, suspended, or deceased pastors
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => {
                    const newStatus = value || "active";
                    // Clear end of service when changing to active status
                    setFormData({ 
                      ...formData, 
                      status: newStatus,
                      endOfService: newStatus === "active" ? "" : formData.endOfService
                    });
                  }}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status">
                      {PASTOR_STATUS_LABELS[formData.status] ?? formData.status}
                    </SelectValue>
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
                    <SelectValue placeholder="Select rank">
                      {PASTOR_RANK_MAP[editFormData.pastorRank] ?? editFormData.pastorRank}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ArchBishop">Archbishop</SelectItem>
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

              {/* End of Service - Only show for non-active statuses */}
              {['retired', 'suspended', 'deceased'].includes(editFormData.status) && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="editEndOfService">
                    End of Service <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="editEndOfService"
                    type="date"
                    value={editFormData.endOfService}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, endOfService: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for retired, suspended, or deceased pastors
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => {
                    const newStatus = value || "active";
                    // Clear end of service when changing to active status
                    setEditFormData({ 
                      ...editFormData, 
                      status: newStatus,
                      endOfService: newStatus === "active" ? "" : editFormData.endOfService
                    });
                  }}
                >
                  <SelectTrigger id="editStatus">
                    <SelectValue placeholder="Select status">
                      {PASTOR_STATUS_LABELS[editFormData.status] ?? editFormData.status}
                    </SelectValue>
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
            <div className="flex size-16 items-center justify-center rounded-full bg-brand-warning/10">
              <AlertTriangle className="size-8 text-brand-warning" />
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
              className="flex-1 bg-destructive text-white hover:bg-destructive/90"
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
                          ? "bg-brand-success/10 text-brand-success hover:bg-brand-success/10"
                          : selectedPastor.status === "retired"
                          ? "bg-chart-4/15 text-chart-4 hover:bg-chart-4/15"
                          : selectedPastor.status === "suspended"
                          ? "bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/10"
                          : "bg-muted text-muted-foreground hover:bg-muted"
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
                        {selectedPastor.gender}
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
                        {selectedPastor.start_of_service
                          ? new Date(selectedPastor.start_of_service).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>
                    {/* End of Service - only show for retired, suspended, or deceased pastors */}
                    {['retired', 'suspended', 'deceased'].includes(selectedPastor.status) && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          End of Service
                        </span>
                        <span className="text-sm font-medium">
                          {selectedPastor.end_of_service
                            ? new Date(selectedPastor.end_of_service).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Years Active
                      </span>
                      <span className="text-sm font-medium">
                        {calculateYearsOfService(selectedPastor.start_of_service, selectedPastor.status, selectedPastor.end_of_service)} years
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedPastor.status === "active"
                          ? "Current Assignment"
                          : selectedPastor.status === "retired" || selectedPastor.status === "deceased"
                          ? "Last Assignment"
                          : "Assignment"}
                      </span>
                      {selectedPastor.church_assignments && selectedPastor.church_assignments.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {selectedPastor.church_assignments.map((assignment) => (
                            <div key={assignment.id} className="flex flex-col gap-0.5 bg-muted/50 p-3 rounded-md">
                              <span className="text-sm font-medium">
                                {assignment.church_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {assignment.section_name}, {assignment.district_name}
                              </span>
                              <span className="text-xs text-brand-primary">
                                Role: {assignment.role_name}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5 bg-muted/50 p-3 rounded-md">
                          <span className="text-sm text-muted-foreground">
                            No church assignments
                          </span>
                        </div>
                      )}
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
