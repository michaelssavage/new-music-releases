import { AlbumCard } from "@client/components/Card/Album.tsx";
import { ArtistCard } from "@client/components/Card/Artist.tsx";
import { getSavedArtists } from "@client/lib/getSavedArtists.ts";
import styled from "@emotion/styled";
import { useState } from "react";
import { useQuery } from "react-query";
import type { SearchResponse } from "src/types/spotify/search.ts";
import { Card } from "../components/Card.tsx";
import { Panel } from "../components/Panel.tsx";
import { SearchArea } from "../components/SearchArea.tsx";
import { type Tab, Tabs } from "../components/Tabs.tsx";
import { defaultOptions, defaultResults } from "../utils/defaults.ts";

const Content = styled.div`
	padding: 2rem;
`;

export const App = () => {
	const [loading, setLoading] = useState(false);
	const [type, setType] = useState(defaultOptions);
	const [results, setResults] = useState<SearchResponse>(defaultResults);

	const { data: artistIds = [], refetch: refetchArtists } = useQuery({
		queryKey: ["savedArtists"],
		queryFn: getSavedArtists,
	});

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
								isSaved={artistIds.includes(artist.id)}
								refetchArtists={refetchArtists}
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
							<Card
								key={track.id}
								image={track?.album?.images?.[0]?.url}
								name={track.name}
								fact={`Artists: ${track.artists.map((artist) => artist.name).join(", ")}`}
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
				refetchArtists={refetchArtists}
			/>
			<Content>
				<Tabs data={data.filter(({ visible }) => visible)} loading={loading} />
			</Content>
		</div>
	);
};
