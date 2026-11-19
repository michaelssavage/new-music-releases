import { getSpotifyPlaylist } from "@client/lib/spotify";
import type { SpotifyDataProps } from "@model/spotify";
import type { UserID } from "@model/spotify/user";
import { useInfiniteQuery } from "@tanstack/react-query";

const PLAYLIST_PAGE_SIZE = 30;

const flattenPlaylistPages = ({
  pages,
}: {
  pages: Array<SpotifyDataProps>;
}) => ({
  playlist: pages[0].playlist,
  tracks: pages.flatMap((page) => page.playlistItems.items),
  total: pages[0].playlistItems.total,
});

export const usePlaylistUpdates = (userId: UserID, enabled: boolean) =>
  useInfiniteQuery({
    queryKey: ["playlist", userId],
    queryFn: ({ pageParam }) =>
      getSpotifyPlaylist(userId, {
        offset: pageParam,
        limit: PLAYLIST_PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const loaded = lastPageParam + lastPage.playlistItems.items.length;
      return loaded < lastPage.playlistItems.total ? loaded : undefined;
    },
    select: flattenPlaylistPages,
    refetchOnWindowFocus: false,
    enabled,
  });
