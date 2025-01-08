import { useTabs } from "@client/context/tabs.context";
import { fetchSearchResults } from "@client/lib/spotify";
import { Wrapper } from "@client/styles/global.styled";
import { getActiveTabKey } from "@client/utils/activeKeys";
import {
	type TypeI,
	defaultOptions,
	defaultResults,
} from "@client/utils/defaults";
import styled from "@emotion/styled";
import type { SearchResponse } from "@model/spotify/search";
import { useMutation } from "@tanstack/react-query";
import { type ChangeEvent, type KeyboardEvent, useState } from "react";
import type { MultiValue } from "react-select";
import { Button } from "./Button";
import { Select } from "./Form/Select";
import { TextInput } from "./Form/TextInput";
import { Group } from "./Group";

const Content = styled.div`
	padding: 2rem;
`;

interface Props {
	setLoading: (loading: boolean) => void;
	setResults: (results: SearchResponse) => void;
	type: Array<TypeI>;
	setType: (type: Array<TypeI>) => void;
	refetchArtists: () => void;
}

export const SearchArea = ({
	setLoading,
	setResults,
	type,
	setType,
	refetchArtists,
}: Props) => {
	const [search, setSearch] = useState("");
	const { setActiveTab } = useTabs();

	const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
	};

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
		refetchArtists();
	};

	const disableSearch = !search || type.length === 0 || isPending;

	return (
		<div>
			<Wrapper />
			<Content>
				<Group justify="flex-start" align="flex-end">
					<TextInput
						id="search"
						label="Search for an artist:"
						placeholder="Search for an artist"
						onChange={handleSearch}
						onKeyDown={handleEnter}
					/>

					<Select
						id="type"
						label="Type:"
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
			</Content>
		</div>
	);
};
