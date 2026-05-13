import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateGroupContentDto } from '@inos/types';
import { contentApi, type GroupContentDto } from '@/api/endpoints/content';

export function useContents(type?: 'MOVIE' | 'BOOK') {
  return useInfiniteQuery({
    queryKey: ['contents', type ?? 'all'],
    queryFn: ({ pageParam }) =>
      contentApi.listContents(type, pageParam as string | undefined).then((r) => r.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}

export function useContent(contentId: string) {
  return useQuery({
    queryKey: ['contents', contentId],
    queryFn: () => contentApi.getContent(contentId).then((r) => r.data),
    enabled: !!contentId,
  });
}

export function useGroupContents(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId, 'contents'],
    queryFn: () => contentApi.getGroupContents(groupId).then((r) => r.data),
    enabled: !!groupId,
  });
}

export function useAddGroupContent(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupContentDto) =>
      contentApi.addGroupContent(groupId, data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'contents'] }),
  });
}

export function useToggleLike(groupId: string, groupContentId: string) {
  const qc = useQueryClient();
  const key = ['groups', groupId, 'contents'];

  return useMutation({
    mutationFn: () =>
      contentApi.toggleLike(groupId, groupContentId).then((r) => r.data),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<GroupContentDto[]>(key);
      qc.setQueryData<GroupContentDto[]>(key, (old) =>
        old?.map((gc) =>
          gc.id !== groupContentId
            ? gc
            : { ...gc, likeCount: gc.likeCount + 1 },
        ),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) {
        qc.setQueryData(key, ctx.prev);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: key });
    },
  });
}
