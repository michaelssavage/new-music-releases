import { useListenLater } from "@client/hooks/use-listen-later.hook";
import { saveSongToPlaylist } from "@client/lib/spotify";
import { displayDate } from "@client/utils/dates";
import { logger } from "@client/utils/logger";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import type { Track } from "@model/spotify/liked-tracks";
import type { SaveSongRequestI } from "@model/spotify/playlist";
import type { ShowItem } from "@model/spotify/tracks";
import type { User } from "@model/spotify/user";
import { useMutation } from "@tanstack/react-query";
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
import toast from "react-hot-toast";
import { Anchor } from "../Anchor";
import { Button } from "../Button";
import { Group } from "../Group";
import { FolderCheckIcon } from "../Icons/FolderCheck";
import { PlusIcon } from "../Icons/Plus";
import { SortIcon } from "../Icons/Sort";
import { SpotifyIcon } from "../Icons/Spotify";
import { Info } from "../InfoToast";

interface PlaylistTableProps {
  tracks: Array<ShowItem>;
  userData: User;
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

const plusStyles = css`
  svg {
    color: #353232;
  }

  &:disabled {
    background-color: transparent;
  }
`;

const sortDateFn: SortingFn<ShowItem> = (rowA, rowB) => {
  const dateA = new Date(rowA.original.added_at).getTime();
  const dateB = new Date(rowB.original.added_at).getTime();
  return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
};

export const PlaylistUpdatesTable = ({
  tracks,
  userData,
}: PlaylistTableProps) => {
  const columnHelper = createColumnHelper<ShowItem>();
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "added_at",
      desc: true,
    },
  ]);

  const { isTrackInListenLater, refetchListenLater } = useListenLater(
    userData.listen_later_playlist
  );

  const saveSongMutation = useMutation({
    mutationFn: (props: SaveSongRequestI) => saveSongToPlaylist(props),
    onSuccess: (data) => {
      logger.info("Song saved successfully!", data);
      toast.success("Song saved to Listen Later playlist!");
      refetchListenLater();
    },
    onError: (error) => {
      logger.error("Error saving song:", error);
    },
  });

  const saveForLater = (track: Track) => {
    if (isTrackInListenLater(track.id)) {
      logger.info("Track already exists in Listen Later playlist");
      toast.custom(
        <Info text="Track already exists in Listen Later playlist" />
      );
      return;
    }

    saveSongMutation.mutate({
      userId: userData.userId,
      trackId: track.id,
      playlistId: userData.listen_later_playlist,
    });
  };

  const renderListenLaterIcon = (trackId: string) => {
    if (isTrackInListenLater(trackId)) {
      return <FolderCheckIcon />;
    }
    return <PlusIcon />;
  };

  const disableListenLater = (trackId: string): boolean => {
    if (!userData.listen_later_playlist) return true;
    return isTrackInListenLater(trackId) || saveSongMutation.isPending;
  };

  const columns = [
    columnHelper.accessor(
      (row) => row.track.artists.map((artist) => artist.name).join(", "),
      {
        id: "artist_names",
        header: "Artists",
        cell: (info) => <span>{info.getValue()}</span>,
      }
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
      header: "Actions",
      cell: (info) => (
        <Group>
          {userData?.listen_later_playlist && (
            <Button
              onClick={() => saveForLater(info.row.original.track)}
              variant="link"
              icon={renderListenLaterIcon(info.row.original.track.id)}
              disabled={disableListenLater(info.row.original.track.id)}
              styles={plusStyles}
            />
          )}
          <Anchor
            link={info.row.original.track.external_urls.spotify}
            text="Open"
            variant="link"
            icon={<SpotifyIcon />}
            isExternal
          />
        </Group>
      ),
    }),
  ];

  const table = useReactTable({
    data: tracks,
    columns,
    getCoreRowModel: getCoreRowModel<ShowItem>(),
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
                      header.getContext()
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
