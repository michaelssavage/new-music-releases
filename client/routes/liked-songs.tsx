import { Anchor } from "@client/components/Anchor";
import { Button } from "@client/components/Button";
import { ArtistCard } from "@client/components/Card/Artist";
import { Group } from "@client/components/Group";
import { SortIcon } from "@client/components/Icons/Sort";
import { SpotifyIcon } from "@client/components/Icons/Spotify";
import { Layout } from "@client/components/Layout";
import { Loader } from "@client/components/Loader";
import { Modal } from "@client/components/Modal";
import { Panel } from "@client/components/Panel";
import {
  SortableHeader,
  TableContainer,
  TableWrapper,
} from "@client/components/Table/Table.styled";
import { useMediaQuery } from "@client/hooks/use-media-query.hook";
import { getArtist, getNextTracks, getUserTracks } from "@client/lib/spotify";
import { PHONE_QUERY } from "@client/styles/abstracts/mixins.styled";
import { requireAuth } from "@client/utils/auth";
import { displayDate } from "@client/utils/dates";
import styled from "@emotion/styled";
import type { LikedTracksI, ShowItem } from "@model/spotify/liked-tracks";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";

const observerOptions = {
  root: null, // Observe within the viewport
  rootMargin: "200px", // Trigger slightly before the element enters the viewport
  threshold: 1.0, // Trigger when the entire sentinel is visible
};

const Field = styled.div`
  font-weight: 500;
`;

const ReleaseDate = styled(Field)`
  white-space: nowrap;
`;

const TrackLink = styled.a`
  font-weight: 500;
  color: #2650f6;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ArtistBtn = styled.div`
  flex-wrap: nowrap;
  display: flex;
`;

export const Route = createFileRoute("/liked-songs")({
  beforeLoad: async () => await requireAuth(),
  component: LikedSongsPage,
});

function LikedSongsPage() {
  const observerRef = useRef<HTMLDivElement | null>(null);

  const columnHelper = createColumnHelper<ShowItem>();
  const [sorting, setSorting] = useState<SortingState>([]);
  const isPhone = useMediaQuery(PHONE_QUERY);

  const [tracks, setTracks] = useState<Array<ShowItem>>([]);
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

  const loadMoreTracks = useCallback(async () => {
    if (!nextUrl) return;
    setIsLoadingMore(true);
    const data = await getNextTracks(nextUrl);
    setTracks((prevTracks) => [...prevTracks, ...data.items]);
    setNextUrl(data.next);
    setIsLoadingMore(false);
  }, [nextUrl]);

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
      cell: (info) => (
        <TrackLink
          href={info.row.original.track.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
        >
          {info.getValue()}
        </TrackLink>
      ),
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
      cell: (info) => <ReleaseDate>{displayDate(info.getValue())}</ReleaseDate>,
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
      columnVisibility: { albumName: !isPhone, externalLink: !isPhone },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel<ShowItem>(),
    getSortedRowModel: getSortedRowModel(),
  });

  const renderArtist = () => {
    if (!artistData) return null;
    if (isLoading) return <Loader />;
    if (isError) return <p>Error fetching Artist, please try again</p>;

    return (
      <ArtistCard image={artistData.images?.[0].url} artist={artistData} />
    );
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && nextUrl && !isLoadingMore) {
        loadMoreTracks();
      }
    }, observerOptions);

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [nextUrl, isLoadingMore, loadMoreTracks]);

  return (
    <Layout>
      <Panel>
        {isPending ? (
          <Loader />
        ) : (
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
            {nextUrl && <div ref={observerRef} style={{ height: "1px" }} />}
          </TableContainer>
        )}

        <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
          {renderArtist()}
        </Modal>
      </Panel>
    </Layout>
  );
}
