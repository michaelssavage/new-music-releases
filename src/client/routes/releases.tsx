import { Anchor } from "@client/components/Anchor.tsx";
import { Button } from "@client/components/Button.tsx";
import { Group } from "@client/components/Group.tsx";
import { Info } from "@client/components/InfoToast.tsx";
import { Panel } from "@client/components/Panel.tsx";
import { ArtistTable } from "@client/components/Table/Artist.tsx";
import { PlaylistTable } from "@client/components/Table/Playlist.tsx";
import { TrackTable } from "@client/components/Table/Track.tsx";
import { type Tab, Tabs } from "@client/components/Tabs.tsx";
import {
	getSpotifyPlaylist,
	updateSpotifyPlaylistReleases,
} from "@client/lib/Spotify/playlist.ts";
import { Wrapper } from "@client/styles/global.styled.ts";
import { requireAuth } from "@client/utils/auth.ts";
import styled from "@emotion/styled";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import type { SpotifyDataProps } from "src/types/spotify.ts";

export const Route = createFileRoute("/releases")({
	beforeLoad: async () => await requireAuth(),
	component: Releases,
});

const Content = styled.div`
  padding: 2rem;
`;

function Releases() {
	const { data, refetch } = useQuery<SpotifyDataProps | null>({
		queryKey: ["playlist"],
		queryFn: getSpotifyPlaylist,
		refetchOnWindowFocus: false,
	});

	const { isPending, mutate } = useMutation({
		mutationFn: updateSpotifyPlaylistReleases,
		onSuccess: ({ tracks }) => {
			if (Array.isArray(tracks) && tracks?.length > 0) {
				toast.success("Fetched new playlist releases");
				refetch();
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
							onClick={mutate}
							text="Fetch new releases"
							variant="secondary"
							loading={isPending}
						/>

						{data?.playlist && (
							<Anchor
								link={data?.playlist.external_urls.spotify}
								text="Open playlist"
								variant="secondary"
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

	return (
		<div>
			<Wrapper color="#1ed4b6" />

			<Content>
				<Tabs data={tabs} defaultTab="playlist" />
			</Content>
		</div>
	);
}
