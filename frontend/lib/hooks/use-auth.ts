import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, type SignupInput } from '@/lib/api/auth';
import type { AuthUser } from '@/types/auth';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  pendingUsers: () => [...authKeys.all, 'pending-users'] as const,
};

/**
 * Current user from the httpOnly session cookie. Resolves to `null` (not an error)
 * when unauthenticated, so consumers can branch on presence without try/catch.
 */
export function useMe() {
  return useQuery<AuthUser | null>({
    queryKey: authKeys.me(),
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (data: SignupInput) => authApi.signup(data),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
  });
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerificationEmail(email),
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
  });
}

export function useConfirmPasswordReset() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.confirmPasswordReset(token, password),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ otpToken, code }: { otpToken: string; code: string }) =>
      authApi.verifyOtp(otpToken, code),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (otpToken: string) => authApi.resendOtp(otpToken),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me(), null);
      queryClient.clear();
    },
  });
}

export function usePendingUsers(enabled = true) {
  return useQuery({
    queryKey: authKeys.pendingUsers(),
    queryFn: authApi.pendingUsers,
    enabled,
  });
}

export function useApproveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => authApi.approveUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.pendingUsers() });
    },
  });
}
