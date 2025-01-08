import { displayDate } from "@client/utils/dates";
import styled from "@emotion/styled";
import type { ShowItem } from "@model/spotify/tracks";
import {
	type SortingFn,
	type SortingState,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Anchor } from "../Anchor";
import { SortIcon } from "../Icons/Sort";
import { SpotifyIcon } from "../Icons/Spotify";

interface PlaylistTableProps {
	tracks: Array<ShowItem>;
}

const TableContainer = styled.div`
	background: white;
	border-radius: 8px;
	box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.3);
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

const SortableHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	cursor: pointer;

&:hover {
	color: #4b5563;
}
`;

const sortDateFn: SortingFn<ShowItem> = (rowA, rowB) => {
	const dateA = new Date(rowA.original.added_at).getTime();
	const dateB = new Date(rowB.original.added_at).getTime();
	return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
};

export const PlaylistTable = ({ tracks }: PlaylistTableProps) => {
	const columnHelper = createColumnHelper<ShowItem>();
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "added_at",
			desc: true,
		},
	]);

	const columns = [
		columnHelper.accessor(
			(row) => row.track.artists.map((artist) => artist.name).join(", "),
			{
				id: "artist_names",
				header: "Artists",
				cell: (info) => <span>{info.getValue()}</span>,
			},
		),
		columnHelper.accessor((row) => row.track.name, {
			id: "track_name",
			header: "Track Name",
			cell: (info) => <span>{info.getValue()}</span>,
		}),
		columnHelper.accessor((row) => row.added_at, {
			id: "added_at",
			header: ({ column }) => (
				<SortableHeader onClick={column.getToggleSortingHandler()}>
					Date Added
					<SortIcon direction={column.getIsSorted()} />
				</SortableHeader>
			),
			cell: (info) => <span>{displayDate(info.getValue())}</span>,
			sortingFn: sortDateFn,
		}),
		columnHelper.display({
			id: "external_link",
			header: "Link",
			cell: (info) => (
				<Anchor
					link={info.row.original.track.external_urls.spotify}
					text="Open"
					variant="link"
					icon={<SpotifyIcon />}
					isExternal
				/>
			),
		}),
	];

	const table = useReactTable({
		data: tracks,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
		},
	});

	return (
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
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</TableWrapper>
		</TableContainer>
	);
};
