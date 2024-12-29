import styled from "@emotion/styled";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { PlaylistTracksI } from "src/types/spotify/tracks.ts";
import { Anchor } from "../Anchor.tsx";

interface PlaylistTableProps {
	tracks: PlaylistTracksI["items"];
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

export const PlaylistTable = ({ tracks }: PlaylistTableProps) => {
	const columnHelper = createColumnHelper<PlaylistTracksI["items"][number]>();

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
			header: "Added At",
			cell: (info) => (
				<span>{new Date(info.getValue()).toLocaleDateString()}</span>
			),
		}),
		columnHelper.display({
			id: "external_link",
			header: "Link",
			cell: (info) => (
				<Anchor
					link={info.row.original.track.external_urls.spotify}
					text="Open in Spotify"
					variant="link"
					isExternal
				/>
			),
		}),
	];

	const table = useReactTable({
		data: tracks,
		columns,
		getCoreRowModel: getCoreRowModel(),
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
