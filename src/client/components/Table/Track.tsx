import { getArtist, getSavedArtists } from "@client/lib/Spotify/artist.ts";
import { getNextTracks, getUserTracks } from "@client/lib/Spotify/tracks.ts";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import type { LikedTracksI, ShowItem } from "src/types/spotify/liked-tracks.ts";
import type { Artist } from "src/types/spotify/search.ts";
import { Button } from "../Button.tsx";
import { ArtistCard } from "../Card/Artist.tsx";
import { Group } from "../Group.tsx";
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

const LoadMoreButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #4338ca;
  }
`;

const ArtistBtn = styled.div`
  flex-wrap: nowrap;
  display: flex;
`;

export const TrackTable = () => {
	const columnHelper = createColumnHelper<ShowItem>();

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
		columnHelper.accessor((row) => row.track.name, {
			id: "trackName",
			header: "Track Name",
			cell: (info) => <Field>{info.getValue()}</Field>,
		}),
		columnHelper.accessor((row) => row.track.artists, {
			id: "artists",
			header: "Artists",
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
		columnHelper.accessor((row) => row.track.album.name, {
			id: "albumName",
			header: "Album Name",
			cell: (info) => <Field>{info.getValue()}</Field>,
		}),
	];

	const table = useReactTable({
		data: tracks,
		columns,
		getCoreRowModel: getCoreRowModel(),
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
					<LoadMoreButton onClick={loadMoreTracks} disabled={isLoadingMore}>
						{isLoadingMore ? "Loading..." : "Load More"}
					</LoadMoreButton>
				)}
			</TableContainer>

			<Modal isOpen={isOpen} setIsOpen={setIsOpen}>
				{renderArtist()}
			</Modal>
		</>
	);
};
