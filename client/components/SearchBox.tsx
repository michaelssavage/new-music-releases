import { fetchSearchResults } from "@client/lib/spotify";
import { getActiveTabKey } from "@client/utils/activeKeys";
import {
  type TypeI,
  defaultOptions,
  defaultResults,
} from "@client/utils/defaults";
import { css } from "@emotion/react";
import type { SearchResponse } from "@model/spotify/search";
import { useMutation } from "@tanstack/react-query";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import type { MultiValue } from "react-select";
import { Button } from "./Button";
import { AlbumCard } from "./Card/Album";
import { ArtistCard } from "./Card/Artist";
import { CardGrid } from "./Card/Card.styled";
import { TrackCard } from "./Card/Track";
import { Select } from "./Form/Select";
import { TextInput } from "./Form/TextInput";
import { Group } from "./Group";
import { SearchIcon } from "./Icons/Search";
import { Modal } from "./Modal";
import { type Tab, TabList, TabPanel } from "./Tabs";

const customButtonStyles = css`
  padding: 0.25rem;
  height: 40px;
  width: 300px;
`;

const searchBoxStyling = css`
  margin: 0 auto;
  order: 2;

  @media screen and (max-width: 600px) {
    margin: unset;
    order: 3;
  }
`;

interface ResultsProps {
  title: string;
  show: boolean;
  children: ReactNode;
}

const Results = ({ title, show, children }: ResultsProps) => {
  if (!show) return `No ${title} found`;

  return (
    <Group direction="column" align="center" width="100%">
      <h1>{title}</h1>
      <CardGrid>{children}</CardGrid>
    </Group>
  );
};

export const SearchBox = () => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResponse>(defaultResults);
  const [type, setType] = useState(defaultOptions);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("artists");

  const handleSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  }, []);

  const handleType = (newValue: MultiValue<TypeI>) => {
    setType(newValue as Array<TypeI>);
  };

  const { isPending, mutate } = useMutation({
    mutationFn: fetchSearchResults,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      const {
        artists: { items: artists = [] },
        albums: { items: albums = [] },
        tracks: { items: tracks = [] },
      } = data;

      setResults({ artists, albums, tracks });
      const firstTabWithResults = getActiveTabKey({ artists, albums, tracks });
      if (firstTabWithResults) setActiveTab(firstTabWithResults);
      setLoading(false);
    },
    onError: (error) => {
      console.error(error);
      setResults(defaultResults);
      setLoading(false);
    },
  });

  const handleEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleClick();
  };

  const handleClick = () => {
    mutate({ search, type: type.map((t) => t.value) });
  };

  const disableSearch = !search || type.length === 0 || isPending;

  const data: Array<Tab> = [
    {
      key: "artists",
      tab: "Artists",
      visible: type.some(({ value }) => value === "artist"),
      panel: (
        <Results title="Artists" show={results.artists?.length > 0}>
          {results.artists
            .filter((artist) => artist.images.length)
            .map((artist) => (
              <ArtistCard
                key={artist.id}
                image={artist?.images?.[0]?.url}
                artist={artist}
              />
            ))}
        </Results>
      ),
    },
    {
      key: "albums",
      tab: "Albums",
      visible: type.some(({ value }) => value === "album"),
      panel: (
        <Results title="Albums" show={results.albums?.length > 0}>
          {results.albums
            .filter((album) => album.images.length)
            .map((album) => (
              <AlbumCard
                key={album.id}
                image={album?.images?.[0]?.url}
                name={album.name}
                type={album.album_type}
                artists={album.artists}
              />
            ))}
        </Results>
      ),
    },
    {
      key: "tracks",
      tab: "Tracks",
      visible: type.some(({ value }) => value === "track"),
      panel: (
        <Results title="Tracks" show={results.tracks?.length > 0}>
          {results.tracks
            .filter((track) => track.album.images.length)
            .map((track) => (
              <TrackCard
                key={track.id}
                image={track?.album?.images?.[0]?.url}
                name={track.name}
                artists={track.artists}
                track={track}
              />
            ))}
        </Results>
      ),
    },
  ];

  return (
    <Group align="center" styling={searchBoxStyling}>
      <Button
        icon={<SearchIcon />}
        variant="input"
        text="Search..."
        onClick={() => setIsOpen(true)}
        styles={customButtonStyles}
      />

      <Modal isOpen={isOpen} setIsOpen={setIsOpen} width="70%">
        <Group
          justify="space-between"
          align="flex-end"
          width="100%"
          gap="1rem"
          styling={css`
            margin: 0 0 1rem 0;
          `}
        >
          <TextInput
            id="search"
            placeholder="type here..."
            onChange={handleSearch}
            onKeyDown={handleEnter}
            styles={css`
              flex: 1;
              input {
                width: 100%;
              }
            `}
          />

          <Select
            id="type"
            options={defaultOptions}
            value={type}
            onChange={handleType}
          />

          <Button
            disabled={disableSearch}
            onClick={handleClick}
            text={isPending ? "Searching..." : "Search"}
          />
        </Group>

        <TabList
          data={data.filter(({ visible }) => visible)}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        <TabPanel
          data={data.filter(({ visible }) => visible)}
          activeTab={activeTab}
          loading={loading}
        />
      </Modal>
    </Group>
  );
};
