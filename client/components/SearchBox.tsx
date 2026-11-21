import { fetchSearchResults } from "@client/lib/spotify";
import {
  forPhoneOnly,
  forTabletOnly,
} from "@client/styles/abstracts/mixins.styled";
import { getActiveTabKey } from "@client/utils/activeKeys";
import {
  type TypeI,
  defaultOptions,
  defaultResults,
} from "@client/utils/defaults";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
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

const searchFieldStyles = css`
  height: 40px;
  width: 400px;
  max-width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid transparent;
  border-radius: 4px;
  background-color: #ffffff;
  box-shadow: #c4cff1 1px 6px 4px;
  color: #040c2f91;
  transition: border-color 0.2s ease-in-out;

  &:hover,
  &:focus-within {
    border-color: #040c2f;
  }

  ${forTabletOnly(css`
    width: 240px;
  `)}

  ${forPhoneOnly(css`
    width: 40px;
    padding: 0;
    justify-content: center;
    box-shadow: none;
    background-color: transparent;
  `)}
`;

const ModalControls = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0 8px;
  align-items: flex-end;
  margin: 0 0 1rem 0;

  > :first-child {
    width: 100%;
  }

  ${forPhoneOnly(css`
    flex-direction: column;
    align-items: stretch;

    button {
      margin-top: 12px;
    }

    > * {
      width: 100%;
    }
  `)}
`;

const stretchOnPhone = forPhoneOnly(css`
  align-items: stretch;
`);

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background-color: transparent;
  color: #040c2f;

  ${forPhoneOnly("display: none;")}
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

  const disableSearch = !search || type.length === 0 || isPending;

  const handleClick = () => {
    mutate({ search, type: type.map((t) => t.value) });
  };

  const openSearch = () => {
    setIsOpen(true);
    if (!disableSearch) handleClick();
  };

  const handleEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleClick();
  };

  const handleFieldEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") openSearch();
  };

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
    <Group align="center">
      <Group
        justify="space-between"
        wrap="nowrap"
        gap="0.5rem"
        styling={searchFieldStyles}
      >
        <SearchInput
          aria-label="Search"
          placeholder="Search..."
          value={search}
          onChange={handleSearch}
          onKeyDown={handleFieldEnter}
        />
        <Button
          variant="ghost"
          ariaLabel="Open search"
          icon={<SearchIcon />}
          onClick={openSearch}
        />
      </Group>

      <Modal isOpen={isOpen} setIsOpen={setIsOpen} width="70%">
        <ModalControls>
          <TextInput
            id="search"
            placeholder="type here..."
            value={search}
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
            styles={stretchOnPhone}
          />

          <Button
            disabled={disableSearch}
            onClick={handleClick}
            text={isPending ? "Searching..." : "Search"}
          />
        </ModalControls>

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
