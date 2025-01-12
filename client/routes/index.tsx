import { AlbumCard } from "@client/components/Card/Album";
import { ArtistCard } from "@client/components/Card/Artist";
import { TrackCard } from "@client/components/Card/Track";
import { Panel } from "@client/components/Panel";
import { SearchArea } from "@client/components/SearchArea";
import { type Tab, Tabs } from "@client/components/Tabs";
import { useAppStore } from "@client/store/appStore";
import { requireAuth } from "@client/utils/auth";
import { defaultOptions, defaultResults } from "@client/utils/defaults";
import styled from "@emotion/styled";
import type { SearchResponse } from "@model/spotify/search";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

const Content = styled.div`
  padding: 2rem;
`;

export const Route = createFileRoute("/")({
	beforeLoad: async () => await requireAuth(),
	component: App,
});

function App() {
	const [loading, setLoading] = useState(false);
	const [type, setType] = useState(defaultOptions);
	const [results, setResults] = useState<SearchResponse>(defaultResults);

	const { savedArtists } = useAppStore();

	const data: Array<Tab> = [
		{
			key: "artists",
			tab: "Artists",
			visible: type.some(({ value }) => value === "artist"),
			panel: (
				<Panel title="Artists" show={results.artists?.length > 0}>
					{results.artists
						.filter((artist) => artist.images.length)
						.map((artist) => (
							<ArtistCard
								key={artist.id}
								image={artist?.images?.[0]?.url}
								artist={artist}
								isSaved={savedArtists.some(({ id }) => id === artist.id)}
							/>
						))}
				</Panel>
			),
		},
		{
			key: "albums",
			tab: "Albums",
			visible: type.some(({ value }) => value === "album"),
			panel: (
				<Panel title="Albums" show={results.albums?.length > 0}>
					{results.albums
						.filter((album) => album.images.length)
						.map((album) => (
							<AlbumCard
								key={album.id}
								image={album?.images?.[0]?.url}
								name={album.name}
								type={album.album_type}
								artists={album.artists}
							/>
						))}
				</Panel>
			),
		},
		{
			key: "tracks",
			tab: "Tracks",
			visible: type.some(({ value }) => value === "track"),
			panel: (
				<Panel title="Tracks" show={results.tracks?.length > 0}>
					{results.tracks
						.filter((track) => track.album.images.length)
						.map((track) => (
							<TrackCard
								key={track.id}
								image={track?.album?.images?.[0]?.url}
								name={track.name}
								artists={track.artists}
								track={track}
							/>
						))}
				</Panel>
			),
		},
	];

	return (
		<div>
			<SearchArea
				setLoading={setLoading}
				setResults={setResults}
				type={type}
				setType={setType}
			/>
			<Content>
				<Tabs data={data.filter(({ visible }) => visible)} loading={loading} />
			</Content>
		</div>
	);
}
