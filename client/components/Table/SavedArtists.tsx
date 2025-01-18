import {
	getArtist,
	getSavedArtists,
	removeArtist,
	saveArtist,
} from "@client/lib/spotify";
import { useAppStore } from "@client/store/appStore";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import type { Artist } from "@model/spotify/search";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Anchor } from "../Anchor";
import { Button } from "../Button";
import { Group } from "../Group";
import { CloseIcon } from "../Icons/Close";
import { SpotifyIcon } from "../Icons/Spotify";
import { Loader } from "../Loader";

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

const TR = styled.tr<{ isRemoved: boolean }>`
  opacity: ${({ isRemoved }) => (isRemoved ? 0.5 : 1)};
  
  &:hover {
    background-color: #f9fafb;
  }
`;

const ArtistName = styled.div`
  font-weight: 500;
`;

const ArtistDetail = styled.div`
	max-width: 400px;
	position: sticky;
	top: 5rem;
	border-radius: 4px;
	gap: 0.25rem;

	display: flex;
	flex-direction: column;

	img {
		width: 100%;
		border-radius: inherit;
	}
`;

const cardBodyStyling = css`
	max-width: 500px;
	border: 1px solid black;
	border-radius: inherit;
	padding: 1rem;
`;

export const SavedArtistsTable = () => {
	const columnHelper = createColumnHelper<Artist>();
	const [artistId, setArtistId] = useState<string>();
	const [removedArtists, setRemovedArtists] = useState<string[]>([]);

	const { savedArtists, userId } = useAppStore();

	const { refetch: refetchArtists } = useQuery({
		queryKey: ["artist", userId],
		queryFn: () => getSavedArtists(userId),
		enabled: false,
	});

	useEffect(() => {
		if (savedArtists.length !== 0) {
			setArtistId(savedArtists[0]?.id);
		}
	}, [savedArtists]);

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

	const { isPending: loadingSave, mutate: mutateSave } = useMutation({
		mutationFn: saveArtist,
		onSuccess: () => {
			toast.success("Artist saved!");
			refetchArtists();
		},
	});

	const { isPending: loadingRemove, mutate: mutateRemove } = useMutation({
		mutationFn: removeArtist,
		onSuccess: () => {
			toast.success("Artist removed!");
			refetchArtists();
		},
		onError: () => {
			toast.error("Couldn't remove artist");
		},
	});

	const handleAction = ({
		isSaved,
		data,
	}: { isSaved: boolean; data: Artist }) => {
		if (isSaved) {
			setRemovedArtists((prev) => [...prev, data.id]);
			mutateRemove({
				userId,
				id: data.id,
				name: data.name,
			});
		} else {
			setRemovedArtists((prev) => prev.filter((id) => id !== data.id));
			mutateSave({
				userId,
				data,
			});
		}
	};

	const columns = [
		columnHelper.accessor("name", {
			header: "Name",
			cell: (info) => <ArtistName>{info.getValue()}</ArtistName>,
		}),
		columnHelper.display({
			id: "actions",
			header: "Actions",
			cell: (info) => {
				return (
					<Button
						onClick={() => setArtistId(info.row.original.id)}
						text="View Artist"
					/>
				);
			},
		}),
	];

	const table = useReactTable({
		data: savedArtists,
		columns,
		getCoreRowModel: getCoreRowModel<Artist>(),
	});

	const renderArtist = () => {
		if (isLoading) return <Loader />;

		if (isError) return <div>Couldn't fetch artist details</div>;

		if (artistData) {
			const image = artistData?.images?.[0]?.url;

			const isSaved = !removedArtists.includes(artistData.id);

			console.log(artistData);

			return (
				<ArtistDetail>
					{image && <img src={image} alt={artistData.name} />}
					<Group
						direction="column"
						gap="0.5rem"
						align="flex-start"
						styling={cardBodyStyling}
					>
						<Group
							align="flex-start"
							justify="space-between"
							width="100%"
							wrap="nowrap"
						>
							<h2>{artistData.name}</h2>
							<Button
								onClick={() => setArtistId(undefined)}
								variant="ghost"
								aria-label="Close Modal"
								text="Close"
								icon={<CloseIcon />}
							/>
						</Group>
						<p>{artistData.followers.total.toLocaleString()} Followers</p>
						<p>Genres: {artistData.genres.join(", ")}</p>
						<Group width="100%">
							<Anchor
								link={artistData.external_urls.spotify}
								text="Open"
								icon={<SpotifyIcon />}
								isExternal
							/>

							<Button
								onClick={() => handleAction({ isSaved, data: artistData })}
								text={`${isSaved ? "Remove" : "Save"}`}
								variant={isSaved ? "remove" : undefined}
								loading={isSaved && (loadingSave || loadingRemove)}
							/>
						</Group>
					</Group>
				</ArtistDetail>
			);
		}
	};

	return (
		<Group align="flex-start" wrap="nowrap">
			{artistId && renderArtist()}

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
								<TR key={row.id} isRemoved={removedArtists.includes(row.id)}>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</TR>
							))}
						</tbody>
					</table>
				</TableWrapper>
			</TableContainer>
		</Group>
	);
};
