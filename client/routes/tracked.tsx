import { AddSeenArtistButton } from "@client/components/AddSeenArtistButton";
import { Anchor } from "@client/components/Anchor";
import { Button } from "@client/components/Button";
import { EmptyState } from "@client/components/EmptyState";
import { Group } from "@client/components/Group";
import { CloseIcon } from "@client/components/Icons/Close";
import { SortIcon } from "@client/components/Icons/Sort";
import { SpotifyIcon } from "@client/components/Icons/Spotify";
import { Layout } from "@client/components/Layout";
import { Loader } from "@client/components/Loader";
import { Panel } from "@client/components/Panel";
import {
  SortableHeader,
  TableContainer,
  TableWrapper,
} from "@client/components/Table/Table.styled";
import {
  getArtist,
  getSavedArtists,
  removeArtist,
  saveArtist,
} from "@client/lib/spotify";
import { useAppStore } from "@client/store/appStore";
import { forTabletOnly } from "@client/styles/abstracts/mixins.styled";
import { requireAuth } from "@client/utils/auth";
import { displayDate } from "@client/utils/dates";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import type { SavedArtistI } from "@model/spotify";
import type { Artist } from "@model/spotify/liked-tracks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

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
  overflow: hidden;

  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;

  ${forTabletOnly(css`
    position: static;
    width: 100%;
    max-width: 100%;

    img {
      max-height: 40vh;
      object-fit: cover;
    }
  `)}

  img {
    width: 100%;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  div[id="image"] {
    position: relative;

    button[id="close"] {
      position: absolute;
      top: 0;
      right: 0;
      color: white;
      background-color: #01010142;
      svg {
        color: white;
        fill: transparent;
      }
    }
  }
`;

const layoutStyling = forTabletOnly(css`
  flex-direction: column;
  align-items: stretch;
`);

const cardBodyStyling = css`
  max-width: 500px;
  border: 1px solid black;
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
  padding: 1rem;
`;

const COLUMN_LABELS: Record<string, string> = {
  name: "Name",
  created_date: "Created",
};

const LoaderStyled = styled.div`
  margin: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const SearchContainer = styled.div`
  margin-bottom: 1rem;

  input {
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    width: 100%;
    font-size: 0.875rem;

    &:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
  }
`;

// Define the filter function for artist names
const fuzzyFilter: FilterFn<SavedArtistI> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId) as string;
  return value.toLowerCase().includes((filterValue as string).toLowerCase());
};

export const Route = createFileRoute("/tracked")({
  beforeLoad: async () => await requireAuth(),
  component: SavedArtistsPage,
});

function SavedArtistsPage() {
  const columnHelper = createColumnHelper<SavedArtistI>();
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "created_date",
      desc: true,
    },
  ]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setColumnFilters(value ? [{ id: "name", value }] : []);
  };

  const [artistId, setArtistId] = useState<string>();
  const artistDetailRef = useRef<HTMLDivElement>(null);
  const [removedArtists, setRemovedArtists] = useState<Array<string>>([]);

  const { savedArtists, savedArtistsLoaded, userId } = useAppStore();

  const { refetch: refetchArtists } = useQuery({
    queryKey: ["artist", userId],
    queryFn: () => getSavedArtists(userId),
    enabled: false,
  });

  useEffect(() => {
    if (savedArtists.length !== 0) {
      setArtistId(savedArtists?.at(-1)?.id);
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

  useEffect(() => {
    if (!artistData) return;
    artistDetailRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [artistData]);

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
  }: {
    isSaved: boolean;
    data: Artist;
  }) => {
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
      id: "name",
      header: ({ column }) => (
        <SortableHeader onClick={column.getToggleSortingHandler()}>
          Name
          <SortIcon direction={column.getIsSorted()} />
        </SortableHeader>
      ),
      cell: (info) => <ArtistName>{info.getValue()}</ArtistName>,
      filterFn: fuzzyFilter,
    }),
    columnHelper.accessor("createdDate", {
      id: "created_date",
      header: ({ column }) => (
        <SortableHeader onClick={column.getToggleSortingHandler()}>
          Created Date
          <SortIcon direction={column.getIsSorted()} />
        </SortableHeader>
      ),
      cell: (info) => (
        <ArtistName>{displayDate(info.getValue().toLocaleString())}</ArtistName>
      ),
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
    getCoreRowModel: getCoreRowModel<SavedArtistI>(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  const renderArtist = () => {
    if (isLoading)
      return (
        <LoaderStyled>
          <Loader />
        </LoaderStyled>
      );

    if (isError) return <div>Couldn't fetch artist details</div>;

    if (artistData) {
      const image = artistData?.images?.[0]?.url;
      const isSaved = !removedArtists.includes(artistData.id);

      return (
        <ArtistDetail ref={artistDetailRef}>
          {image && (
            <div id="image">
              <Button
                id="close"
                onClick={() => setArtistId(undefined)}
                variant="ghost"
                ariaLabel="Close artist"
                text="Close"
                icon={<CloseIcon />}
              />
              <img src={image} alt={artistData.name} />
            </div>
          )}
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

              <AddSeenArtistButton artistName={artistData.name} />

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

  const searchValue =
    (columnFilters.find(({ id }) => id === "name")?.value as string) || "";

  if (savedArtistsLoaded && savedArtists.length === 0) {
    return (
      <Layout>
        <EmptyState
          title="No tracked artists yet"
          description="Start adding artists by searching, or check the artists you follow on Spotify."
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <Panel>
        <Group align="flex-start" wrap="nowrap" styling={layoutStyling}>
          {artistId && renderArtist()}

          <TableContainer>
            <SearchContainer>
              <input
                type="text"
                placeholder="Filter by name..."
                value={searchValue}
                onChange={handleSearchChange}
              />
            </SearchContainer>
            <TableWrapper stackedOnPhone>
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
                    <TR
                      key={row.id}
                      isRemoved={removedArtists.includes(row.original.id)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          data-label={COLUMN_LABELS[cell.column.id]}
                        >
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
      </Panel>
    </Layout>
  );
}
