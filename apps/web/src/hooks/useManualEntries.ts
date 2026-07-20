import { useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '@/api/endpoints/library';
import type {
  CreateManualLibraryEntryDto,
  UpdateManualLibraryEntryDto,
} from '@inos/types';

export function useCreateManualEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateManualLibraryEntryDto) =>
      libraryApi.createManualEntry(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library', 'mine'] });
    },
  });
}

export function useUpdateManualEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      entryId,
      dto,
    }: {
      entryId: string;
      dto: UpdateManualLibraryEntryDto;
    }) => libraryApi.updateManualEntry(entryId, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library', 'mine'] });
    },
  });
}

export function useDeleteManualEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => libraryApi.deleteManualEntry(entryId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library', 'mine'] });
    },
  });
}
