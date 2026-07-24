import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { boardApi } from '@/api/endpoints/board';
import { useAuthStore } from '@/stores/auth-store';
import type { CreateGroupPostDto, UpdateGroupPostDto } from '@inos/types';

export function useOrgPosts(orgId: string | undefined, page: number) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['org', orgId, 'posts', page],
    queryFn: () => boardApi.list(orgId as string, page),
    enabled: !!token && !!orgId,
    placeholderData: keepPreviousData,
  });
}

export function useOrgPost(orgId: string | undefined, postId: string | undefined) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['org', orgId, 'post', postId],
    queryFn: () => boardApi.getById(orgId as string, postId as string),
    enabled: !!token && !!orgId && !!postId,
  });
}

function useInvalidatePosts(orgId: string | undefined) {
  const qc = useQueryClient();
  return (postId?: string) => {
    void qc.invalidateQueries({ queryKey: ['org', orgId, 'posts'] });
    if (postId) {
      void qc.invalidateQueries({ queryKey: ['org', orgId, 'post', postId] });
    }
  };
}

export function useCreateOrgPost(orgId: string | undefined) {
  const invalidate = useInvalidatePosts(orgId);
  return useMutation({
    mutationFn: (dto: CreateGroupPostDto) => boardApi.create(orgId as string, dto),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateOrgPost(orgId: string | undefined, postId: string | undefined) {
  const invalidate = useInvalidatePosts(orgId);
  return useMutation({
    mutationFn: (dto: UpdateGroupPostDto) =>
      boardApi.update(orgId as string, postId as string, dto),
    onSuccess: () => invalidate(postId),
  });
}

export function useDeleteOrgPost(orgId: string | undefined) {
  const invalidate = useInvalidatePosts(orgId);
  return useMutation({
    mutationFn: (postId: string) => boardApi.remove(orgId as string, postId),
    onSuccess: () => invalidate(),
  });
}

export function useToggleOrgPostLike(orgId: string | undefined) {
  const invalidate = useInvalidatePosts(orgId);
  return useMutation({
    mutationFn: (postId: string) => boardApi.toggleLike(orgId as string, postId),
    onSuccess: (_data, postId) => invalidate(postId),
  });
}
