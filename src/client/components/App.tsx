import styled from "@emotion/styled";
import axios from "axios";
import { type ChangeEvent, useState } from "react";
import Select, { type MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import type { SearchResponse } from "src/types/spotify/search.ts";
import { Card } from "./Card.tsx";

interface TypeI {
	value: string;
	label: string;
}

interface GroupI {
	direction?: string;
	justify?: string;
	align?: string;
	gap?: string;
}

const options: Array<TypeI> = [
	{ value: "track", label: "Tracks" },
	{ value: "album", label: "Albums" },
	{ value: "artist", label: "Artists" },
];

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

const Group = styled.div<GroupI>`
	display: flex;
	flex-direction: ${({ direction }) => direction || "row"};
	justify-content: ${({ justify }) => justify || "center"};
	align-items:  ${({ align }) => align || "center"};
	gap:${({ gap }) => gap || "1rem"};
	flex-wrap: wrap;
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

export const App = () => {
	const [search, setSearch] = useState("");
	const [type, setType] = useState(options);

	const [results, setResults] = useState<SearchResponse>({
		artists: [],
		albums: [],
		tracks: [],
	});

	const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
	};

	const handleType = (newValue: MultiValue<TypeI>) => {
		setType(newValue as TypeI[]);
	};

	const handleClick = async () => {
		const { data } = await axios.get("http://localhost:5000/api/search", {
			params: {
				query: search,
				type: type.map((t) => t.value).join(","),
				limit: 10,
			},
		});
		setResults((prevResults) => ({
			artists: data.artists ? [...data.artists.items] : prevResults.artists,
			albums: data.albums ? [...data.albums.items] : prevResults.albums,
			tracks: data.tracks ? [...data.tracks.items] : prevResults.tracks,
		}));
	};

	const disabled = !search || type.length === 0;

	console.log(results);

	return (
		<div>
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
						options={options}
						value={type}
						onChange={handleType}
						closeMenuOnSelect={false}
						isMulti
					/>
				</Group>
				<Button type="button" disabled={disabled} onClick={handleClick}>
					Search
				</Button>
			</Group>
			<div>
				{results.artists.length > 0 && (
					<Group direction="column">
						<h1>Artists</h1>
						<Group align="flex-start" justify="flex-start">
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
						</Group>
					</Group>
				)}
				{results.tracks.length > 0 && (
					<Group direction="column">
						<h1>Tracks</h1>
						<Group>
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
						</Group>
					</Group>
				)}
				{results.albums.length > 0 && (
					<Group direction="column">
						<h1>Albums</h1>
						<Group>
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
						</Group>
					</Group>
				)}
			</div>
		</div>
	);
};
