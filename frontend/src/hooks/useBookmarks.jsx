// src/hooks/useBookmarks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookmarksAPI } from "../services/api.js";

export const bookmarkKeys = {
  all: ["bookmarks"],
  list: (params) => ["bookmarks", "list", params],
};

export const useBookmarks = (params = {}) =>
  useQuery({
    queryKey: bookmarkKeys.list(params),
    queryFn: () => bookmarksAPI.getAll(params),
    select: (res) => ({ bookmarks: res.data, total: res.total }),
  });

export const useCreateBookmark = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => bookmarksAPI.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookmarkKeys.all }),
  });
};

export const useUpdateBookmark = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => bookmarksAPI.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookmarkKeys.all }),
  });
};

export const useDeleteBookmark = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => bookmarksAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookmarkKeys.all }),
  });
};

export const useFetchTitle = () =>
  useMutation({ mutationFn: (url) => bookmarksAPI.fetchTitle(url) });