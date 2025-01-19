import { useTabs } from "@client/context/tabs.context";
import { fetchSearchResults } from "@client/lib/spotify";
import { useAppStore } from "@client/store/appStore";
import { getActiveTabKey } from "@client/utils/activeKeys";
import {
	type TypeI,
	defaultOptions,
	defaultResults,
} from "@client/utils/defaults";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import type { SearchResponse } from "@model/spotify/search";
import { useMutation } from "@tanstack/react-query";
import {
	type ChangeEvent,
	type KeyboardEvent,
	useCallback,
	useState,
} from "react";
import type { MultiValue } from "react-select";
import { Button } from "./Button";
import { AlbumCard } from "./Card/Album";
import { ArtistCard } from "./Card/Artist";
import { TrackCard } from "./Card/Track";
import { Select } from "./Form/Select";
import { TextInput } from "./Form/TextInput";
import { Group } from "./Group";
import { SearchIcon } from "./Icons/Search";
import { Modal } from "./Modal";
import { Panel } from "./Panel";
import { type Tab, Tabs } from "./Tabs";

const Content = styled.div`
	padding: 2rem;
`;

const searchBoxStyling = css`
	margin-left: auto;

	@media screen and (max-width:  440px) {
		margin-left: unset;
  }`;

export const SearchBox = () => {
	const [search, setSearch] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [results, setResults] = useState<SearchResponse>(defaultResults);
	const [type, setType] = useState(defaultOptions);
	const [loading, setLoading] = useState(false);

	const { setActiveTab } = useTabs();

	const { refetchArtists } = useAppStore();

	const handleRefetch = () => {
		if (refetchArtists) refetchArtists();
		else {
			console.error("Refetch function is not set in the store");
		}
	};

	const handleSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
	}, []);

	const handleType = (newValue: MultiValue<TypeI>) => {
		setType(newValue as TypeI[]);
	};

	const { isPending, mutate } = useMutation({
		mutationFn: fetchSearchResults,
		onMutate: () => setLoading(true),
		onSuccess: (data) => {
			const {
				artists: { items: artists = [] },
				albums: { items: albums = [] },
				tracks: { items: tracks = [] },
			} = data;

			setResults({ artists, albums, tracks });
			setActiveTab(getActiveTabKey({ artists, albums, tracks }));
			setLoading(false);
		},
		onError: (error) => {
			console.error(error);
			setResults(defaultResults);
			setLoading(false);
		},
	});

	const handleEnter = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") handleClick();
	};

	const handleClick = () => {
		mutate({ search, type: type.map((t) => t.value) });
		handleRefetch();
	};

	const disableSearch = !search || type.length === 0 || isPending;

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
		<Group justify="flex-end" align="center" styling={searchBoxStyling}>
			<Button
				icon={<SearchIcon />}
				variant="input"
				text="Search Artists"
				onClick={() => setIsOpen(true)}
			/>

			<Modal isOpen={isOpen} setIsOpen={setIsOpen} width="70%">
				<Group justify="flex-start" align="flex-end" width="100%" gap="1rem">
					<TextInput
						id="search"
						label="Search for an artist"
						placeholder="type here..."
						onChange={handleSearch}
						onKeyDown={handleEnter}
					/>

					<Select
						id="type"
						label="Search type"
						options={defaultOptions}
						value={type}
						onChange={handleType}
					/>

					<Button
						disabled={disableSearch}
						onClick={handleClick}
						text={isPending ? "Searching..." : "Search"}
					/>
				</Group>

				<Content>
					<Tabs
						data={data.filter(({ visible }) => visible)}
						loading={loading}
					/>
				</Content>
			</Modal>
		</Group>
	);
};
