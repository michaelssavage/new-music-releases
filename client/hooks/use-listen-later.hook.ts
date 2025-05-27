import { getPlaylistTracks } from "@client/lib/spotify";
import { logger } from "@client/utils/logger";
import type { PlaylistTracksI } from "@model/spotify/tracks";
import { useQuery } from "@tanstack/react-query";

export const useListenLater = (playlistId?: string) => {
	const {
		data: tracks,
		refetch: refetchListenLater,
		isLoading,
	} = useQuery<PlaylistTracksI>({
		queryKey: ["listenLaterTracks", playlistId],
		queryFn: () => getPlaylistTracks(playlistId),
		enabled: !!playlistId,
		refetchOnWindowFocus: false,
	});

	const isTrackInListenLater = (trackId: string): boolean => {
		if (!tracks || tracks.items.length === 0) return false;

		logger.debug(
			"useListenLater:isTrackInListenLater: ",
			tracks.items.some(({ track }) => track?.id === trackId),
		);
		return tracks.items.some(({ track }) => track?.id === trackId);
	};

	return {
		tracks,
		refetchListenLater,
		isLoading,
		isTrackInListenLater,
	};
};
