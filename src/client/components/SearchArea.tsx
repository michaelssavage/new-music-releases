import styled from "@emotion/styled";
import axios from "axios";
import { type ChangeEvent, useState } from "react";
import Select, { type MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import type { SearchResponse } from "src/types/spotify/search.ts";
import { useTabs } from "../context/tabs.context.tsx";
import {
	type TypeI,
	defaultOptions,
	defaultResults,
} from "../utils/defaults.ts";
import { Group } from "./Group.tsx";

const Wrapper = styled.div`
  padding: 3rem 2rem;
  background-color: #8090c0;
`;

const animatedComponents = makeAnimated();

const TextInput = styled.input`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  min-height: 38px;
  outline: 0 !important;
  background-color: hsl(0, 0%, 100%);
  border-color: hsl(0, 0%, 80%);
  padding: 0.5rem;
  border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  box-sizing: border-box;
`;

const Button = styled.button`
	text-decoration: none;
	border: none;
	color: #dfe2e0;
	background-color: #3c3d8b;
	border-radius: 4px;
	height: 100%;
	cursor: pointer;
	display: inline-block;
	font-size: 1rem;
	font-weight: 400;
	margin: 0;
	padding: 0.5rem 1.5rem;
	transition: background-color 0.15s, border-color 0.15s, color 0.15s;
	vertical-align: middle;
	white-space: nowrap;
	&:hover {
		color: #f5faf7;
		background-color: #3c8b71;
	}
	&:disabled {
		background-color: #dfe2e0;
		color: #3c3d8b;
		cursor: not-allowed;
	}
`;

interface Props {
	setLoading: (loading: boolean) => void;
	setResults: (results: SearchResponse) => void;
	type: Array<TypeI>;
	setType: (type: Array<TypeI>) => void;
}

export const SearchArea = ({
	setLoading,
	setResults,
	type,
	setType,
}: Props) => {
	const [search, setSearch] = useState("");
	const { setActiveTab } = useTabs();

	const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
	};

	const handleType = (newValue: MultiValue<TypeI>) => {
		setType(newValue as TypeI[]);
	};

	const handleClick = async () => {
		setLoading(true);
		try {
			const { data } = await axios.get("http://localhost:5000/api/search", {
				params: {
					query: search,
					type: type.map((t) => t.value).join(","),
					limit: 10,
				},
			});

			const {
				artists: { items: artists = [] },
				albums: { items: albums = [] },
				tracks: { items: tracks = [] },
			} = data;

			setResults({ artists, albums, tracks });

			const activeTabKey =
				Object.entries({ artists, albums, tracks }).find(
					([_, value]) => Array.isArray(value) && value.length > 0,
				)?.[0] || "";

			setActiveTab(activeTabKey);
		} catch (error) {
			console.error(error);
			setResults(defaultResults);
		}
		setLoading(false);
	};

	const disableSearch = !search || type.length === 0;

	return (
		<Wrapper>
			<h1>New Music Releases</h1>

			<Group justify="flex-start" align="flex-end">
				<Group direction="column" gap="0.2rem" align="flex-start">
					<label htmlFor="search">Search for an artist:</label>
					<TextInput
						id="search"
						type="text"
						placeholder="Search for an artist"
						onChange={handleSearch}
					/>
				</Group>

				<Group direction="column" gap="0.2rem" align="flex-start">
					<label htmlFor="type">Type:</label>
					<Select
						id="type"
						components={animatedComponents}
						options={defaultOptions}
						value={type}
						onChange={handleType}
						closeMenuOnSelect={false}
						isMulti
					/>
				</Group>
				<Button type="button" disabled={disableSearch} onClick={handleClick}>
					Search
				</Button>
			</Group>
		</Wrapper>
	);
};
