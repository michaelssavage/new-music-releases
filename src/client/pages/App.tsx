import styled from "@emotion/styled";
import { useState } from "react";
import type { SearchResponse } from "src/types/spotify/search.ts";
import { Card } from "../components/Card.tsx";
import { SearchArea } from "../components/SearchArea.tsx";
import { SearchPanel } from "../components/SearchPanel.tsx";
import { type Tab, Tabs } from "../components/Tabs.tsx";
import { defaultOptions, defaultResults } from "../utils/defaults.ts";

const Content = styled.div`
	padding: 2rem;
`;

export const App = () => {
	const [loading, setLoading] = useState(false);
	const [type, setType] = useState(defaultOptions);
	const [results, setResults] = useState<SearchResponse>(defaultResults);

	const data: Array<Tab> = [
		{
			key: "artists",
			tab: "Artists",
			visible: type.some(({ value }) => value === "artist"),
			panel: (
				<SearchPanel title="Artists" show={results.artists?.length > 0}>
					{results.artists
						.filter((artist) => artist.images.length)
						.map((artist) => (
							<Card
								key={artist.id}
								image={artist?.images?.[0]?.url}
								name={artist.name}
								fact={`${artist.followers.total.toLocaleString()} Followers`}
								genres={artist?.genres}
							/>
						))}
				</SearchPanel>
			),
		},
		{
			key: "albums",
			tab: "Albums",
			visible: type.some(({ value }) => value === "album"),
			panel: (
				<SearchPanel title="Albums" show={results.albums?.length > 0}>
					{results.albums
						.filter((album) => album.images.length)
						.map((album) => (
							<Card
								key={album.id}
								image={album?.images?.[0]?.url}
								name={album.name}
								fact={`Album Type: ${album.album_type}`}
								artists={album.artists}
							/>
						))}
				</SearchPanel>
			),
		},
		{
			key: "tracks",
			tab: "Tracks",
			visible: type.some(({ value }) => value === "track"),
			panel: (
				<SearchPanel title="Tracks" show={results.tracks?.length > 0}>
					{results.tracks
						.filter((track) => track.album.images.length)
						.map((track) => (
							<Card
								key={track.id}
								image={track?.album?.images?.[0]?.url}
								name={track.name}
								fact={`Artists:
							${track.artists.map((artist) => artist.name).join(", ")}`}
							/>
						))}
				</SearchPanel>
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
				{results !== defaultResults ? (
					<Tabs
						data={data.filter(({ visible }) => visible)}
						loading={loading}
					/>
				) : null}
			</Content>
		</div>
	);
};
