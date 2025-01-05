import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import {
	type SortingState,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	getArtist,
	getNextTracks,
	getSavedArtists,
	getUserTracks,
} from "client/lib/spotify.ts";
import { useEffect, useState } from "react";
import type { LikedTracksI, ShowItem } from "types/spotify/liked-tracks.ts";
import type { Artist } from "types/spotify/search.ts";
import { displayDate } from "../../utils/dates.ts";
import { Anchor } from "../Anchor.tsx";
import { Button } from "../Button.tsx";
import { ArtistCard } from "../Card/Artist.tsx";
import { Group } from "../Group.tsx";
import { SortIcon } from "../Icons/Sort.tsx";
import { SpotifyIcon } from "../Icons/Spotify.tsx";
import { Loader } from "../Loader.tsx";
import { Modal } from "../Modal.tsx";

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
`;

const TableWrapper = styled.div`
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;

    th {
      padding: 0.5rem 1rem;
      text-align: left;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
    }

    td {
      padding: 0.5rem 1rem;
      border-top: 1px solid #e5e7eb;
    }

    tr:hover {
      background-color: #f9fafb;
    }
  }
`;

const Field = styled.div`
  font-weight: 500;
`;

const ArtistBtn = styled.div`
  flex-wrap: nowrap;
  display: flex;
`;

const SortableHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  &:hover {
    color: #4b5563;
  }
`;

export const TrackTable = () => {
	const columnHelper = createColumnHelper<ShowItem>();
	const [sorting, setSorting] = useState<SortingState>([]);

	const [tracks, setTracks] = useState<ShowItem[]>([]);
	const [nextUrl, setNextUrl] = useState<string | null>(null);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const [isOpen, setIsOpen] = useState(false);
	const [artistId, setArtistId] = useState<string>();

	const handleArtistClick = (id: string) => {
		setIsOpen(true);
		setArtistId(id);
	};

	const {
		data: artistData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["artist", artistId],
		queryFn: () => getArtist(artistId),
		enabled: artistId !== undefined,
		refetchOnWindowFocus: false,
	});

	const { data: artistIds = [], refetch: refetchArtists } = useQuery<
		Array<Artist>
	>({
		queryKey: ["data"],
		queryFn: getSavedArtists,
		enabled: artistId !== undefined,
		refetchOnWindowFocus: false,
	});

	const { data, isPending, isSuccess } = useQuery<LikedTracksI | null>({
		queryKey: ["userTrack"],
		queryFn: getUserTracks,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (isSuccess && data) {
			setTracks(data.items);
			setNextUrl(data.next);
		}
	}, [data, isSuccess]);

	const loadMoreTracks = async () => {
		if (!nextUrl) return;
		setIsLoadingMore(true);
		const data = await getNextTracks(nextUrl);
		setTracks((prevTracks) => [...prevTracks, ...data.items]);
		setNextUrl(data.next);
		setIsLoadingMore(false);
	};

	const columns = [
		columnHelper.accessor((row) => row.track.artists, {
			id: "artists",
			header: ({ column }) => (
				<SortableHeader onClick={() => column.toggleSorting()}>
					Artists
					<SortIcon direction={column.getIsSorted()} />
				</SortableHeader>
			),
			cell: (info) => (
				<Group align="flex-start" gap="0.25rem">
					{info.getValue().map((artist, index) => (
						<ArtistBtn key={`${artist.id}-${index}`}>
							<Button
								onClick={() => handleArtistClick(artist.id)}
								variant="link"
								text={artist.name}
							/>
							{index < info.getValue().length - 1 && <span>, </span>}
						</ArtistBtn>
					))}
				</Group>
			),
		}),
		columnHelper.accessor((row) => row.track.name, {
			id: "trackName",
			header: ({ column }) => (
				<SortableHeader onClick={() => column.toggleSorting()}>
					Track Name
					<SortIcon direction={column.getIsSorted()} />
				</SortableHeader>
			),
			cell: (info) => <Field>{info.getValue()}</Field>,
		}),
		columnHelper.accessor((row) => row.track.album.name, {
			id: "albumName",
			header: ({ column }) => (
				<SortableHeader onClick={() => column.toggleSorting()}>
					Album Name
					<SortIcon direction={column.getIsSorted()} />
				</SortableHeader>
			),
			cell: (info) => <Field>{info.getValue()}</Field>,
		}),
		columnHelper.accessor((row) => row.track.album.release_date, {
			id: "releaseDate",
			header: ({ column }) => (
				<SortableHeader onClick={() => column.toggleSorting()}>
					Release Date
					<SortIcon direction={column.getIsSorted()} />
				</SortableHeader>
			),
			cell: (info) => <Field>{displayDate(info.getValue())}</Field>,
		}),
		columnHelper.accessor((row) => row.track.external_urls.spotify, {
			id: "externalLink",
			header: "Spotify Link",
			cell: (info) => (
				<Anchor
					link={info.getValue()}
					variant="link"
					text="Open"
					icon={<SpotifyIcon />}
					isExternal
				/>
			),
		}),
	];

	const table = useReactTable({
		data: tracks,
		columns,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const renderArtist = () => {
		if (!artistData) return null;
		if (isLoading) return <Loader />;
		if (isError) return <p>Error fetching Artist, please try again</p>;

		return (
			<ArtistCard
				image={artistData.images?.[0].url}
				artist={artistData}
				refetchArtists={refetchArtists}
				isSaved={artistIds.some(({ id }) => id === artistData.id)}
			/>
		);
	};

	if (isPending) {
		return <Loader />;
	}

	return (
		<>
			<TableContainer>
				<TableWrapper>
					<table>
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th key={header.id}>
											{flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody>
							{table.getRowModel().rows.map((row) => (
								<tr key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</TableWrapper>
				{nextUrl && (
					<Button
						onClick={loadMoreTracks}
						text={isLoadingMore ? "Loading..." : "Load More"}
						disabled={isLoadingMore}
					/>
				)}
			</TableContainer>

			<Modal isOpen={isOpen} setIsOpen={setIsOpen}>
				{renderArtist()}
			</Modal>
		</>
	);
};
