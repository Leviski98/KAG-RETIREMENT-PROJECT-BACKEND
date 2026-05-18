import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  churchApi,
  type AssignmentWriteInput,
  type ChurchWriteInput,
  type RoleWriteInput,
} from "@/lib/api/churches";

export const churchQueryKeys = {
  churches: ["churches"] as const,
  sections: ["sections"] as const,
  roles: ["church-roles"] as const,
  assignments: ["church-pastors"] as const,
  pastors: ["pastors"] as const,
};

export function useChurches() {
  return useQuery({
    queryKey: churchQueryKeys.churches,
    queryFn: churchApi.getChurches,
  });
}

export function useSections() {
  return useQuery({
    queryKey: churchQueryKeys.sections,
    queryFn: churchApi.getSections,
  });
}

export function useChurchRoles() {
  return useQuery({
    queryKey: churchQueryKeys.roles,
    queryFn: churchApi.getRoles,
  });
}

export function usePastorAssignments() {
  return useQuery({
    queryKey: churchQueryKeys.assignments,
    queryFn: churchApi.getAssignments,
  });
}

export function usePastors() {
  return useQuery({
    queryKey: churchQueryKeys.pastors,
    queryFn: churchApi.getPastors,
  });
}

export function useCreateChurch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ChurchWriteInput) => churchApi.createChurch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.churches });
    },
  });
}

export function useUpdateChurch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ChurchWriteInput }) =>
      churchApi.updateChurch(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.churches });
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.assignments });
    },
  });
}

export function useDeleteChurch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: churchApi.deleteChurch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.churches });
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.assignments });
    },
  });
}

export function useCreateChurchRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RoleWriteInput) => churchApi.createRole(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.roles });
    },
  });
}

export function useUpdateChurchRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RoleWriteInput }) =>
      churchApi.updateRole(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.roles });
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.assignments });
    },
  });
}

export function useDeleteChurchRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: churchApi.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.roles });
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.assignments });
    },
  });
}

export function useCreatePastorAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignmentWriteInput) =>
      churchApi.createAssignment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.assignments });
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.churches });
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.roles });
    },
  });
}

export function useDeletePastorAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: churchApi.deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.assignments });
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.churches });
      queryClient.invalidateQueries({ queryKey: churchQueryKeys.roles });
    },
  });
}
