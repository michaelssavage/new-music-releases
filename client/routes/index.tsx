import { Anchor } from "@client/components/Anchor";
import { Button } from "@client/components/Button";
import { Group } from "@client/components/Group";
import { SpotifyIcon } from "@client/components/Icons/Spotify";
import { Info } from "@client/components/InfoToast";
import { Loader } from "@client/components/Loader";
import { Panel } from "@client/components/Panel";
import { ArtistTable } from "@client/components/Table/Artist";
import { PlaylistTable } from "@client/components/Table/Playlist";
import { TrackTable } from "@client/components/Table/Track";
import { type Tab, Tabs } from "@client/components/Tabs";
import {
	getSpotifyPlaylist,
	updateSpotifyPlaylistReleases,
} from "@client/lib/spotify";
import { useAppStore } from "@client/store/appStore";
import { requireAuth } from "@client/utils/auth";
import {} from "@client/utils/defaults";
import styled from "@emotion/styled";
import type { SpotifyDataProps } from "@model/spotify";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "react-hot-toast";

export const Route = createFileRoute("/")({
	beforeLoad: async () => await requireAuth(),
	component: Releases,
});

const Content = styled.div`
  padding: 2rem;
`;

function Releases() {
	const { userId } = useAppStore();

	const {
		data,
		refetch: refetchPlaylist,
		isLoading,
	} = useQuery<SpotifyDataProps | null>({
		queryKey: ["playlist"],
		queryFn: () => getSpotifyPlaylist(userId),
		refetchOnWindowFocus: false,
	});

	const { isPending, mutate } = useMutation({
		mutationFn: updateSpotifyPlaylistReleases,
		onSuccess: (data) => {
			if (Array.isArray(data.tracks) && data.tracks?.length > 0) {
				toast.success("Fetched new playlist releases");
				refetchPlaylist();
			} else {
				toast.custom(<Info text="No new releases found" />);
			}
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to fetch new releases");
		},
	});

	const tabs: Array<Tab> = [
		{
			key: "playlist",
			tab: "Playlist Updates",
			panel: (
				<Panel title="New releases" direction="column">
					<Group justify="center" width="100%">
						<Button
							onClick={() => mutate(userId)}
							text="Fetch new releases"
							variant="secondary"
							loading={isPending}
						/>

						{data?.playlist && (
							<Anchor
								link={data?.playlist.external_urls.spotify}
								text="Open playlist"
								variant="secondary"
								icon={<SpotifyIcon />}
								isExternal
							/>
						)}
					</Group>

					{data ? (
						<PlaylistTable tracks={data?.playlistItems.items} />
					) : (
						<p>No tracks found</p>
					)}
				</Panel>
			),
		},
		{
			key: "artists",
			tab: "Saved Artists",
			panel: (
				<Panel>
					<ArtistTable />
				</Panel>
			),
		},
		{
			key: "liked",
			tab: "Liked Songs",
			panel: (
				<Panel>
					<TrackTable />
				</Panel>
			),
		},
	];

	if (isLoading) {
		return <Loader />;
	}

	return (
		<Content>
			<Tabs data={tabs} defaultTab="playlist" />
		</Content>
	);
}
