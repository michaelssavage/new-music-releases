import { getSeenArtists } from "@client/lib/spotify";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import {
  OTHER_GENRE,
  type SeenArtistWithGenreI,
  type SightingI,
} from "@model/seen-artists";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GenreBarChart } from "./GenreBarChart";
import { Button } from "./Button";
import { TextInput } from "./Form/TextInput";
import { Loader } from "./Loader";
import { SeenArtistDialog } from "./SeenArtistDialog";

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem 1.5rem;
  width: 100%;
  max-width: 900px;

  h2 {
    margin: 0;
    font-size: 1rem;
  }

  p {
    margin: 0.25rem 0 1rem;
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const ArtistList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;

  button {
    padding: 0.25rem 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    background: transparent;
    font-size: 0.875rem;
    cursor: pointer;

    &:hover {
      border-color: #4e6db0;
      background-color: #f5f7fc;
    }

    &[data-no-genre="true"] {
      border-color: #d97706;
      background-color: #fffbeb;
    }
  }

  small {
    margin-left: 0.5rem;
    color: #6b7280;
  }
`;

const SearchStyles = css`
  margin-bottom: 1rem;

  input {
    width: 100%;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const LoaderStyled = styled.div`
  margin: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
`;

function hasNoGenre({ genre, genreOverride }: SeenArtistWithGenreI) {
  return genre === OTHER_GENRE && !genreOverride;
}

function matchesSearch({ name }: SeenArtistWithGenreI, search: string) {
  return name.toLowerCase().includes(search.trim().toLowerCase());
}

function describeSightings(sightings: Array<SightingI>) {
  return sightings.map(({ event, year }) => `${event} ${year}`).join(", ");
}

export const SeenArtists = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>();
  const [editingArtist, setEditingArtist] = useState<SeenArtistWithGenreI>();
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["seen-artists"],
    queryFn: getSeenArtists,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <LoaderStyled>
        <Loader />
      </LoaderStyled>
    );
  }

  if (isError || !data) return <div>Couldn't fetch seen artists</div>;

  const { artists, genres } = data;
  const sightingsCount = artists.reduce(
    (total, { sightings }) => total + sightings.length,
    0,
  );
  const visibleArtists = artists.filter(
    (artist) =>
      (!selectedGenre || artist.genre === selectedGenre) &&
      matchesSearch(artist, search),
  );
  const hasVisibleArtistWithoutGenre = visibleArtists.some(hasNoGenre);

  return (
    <Card>
      <Header>
        <div>
          <h2>Artists seen live by genre</h2>
          <p>
            {artists.length} artists · {sightingsCount} sightings
          </p>
        </div>
        <Button
          variant="secondary"
          text="Add artist"
          onClick={() => setIsAdding(true)}
        />
      </Header>
      <GenreBarChart
        genres={genres}
        totalArtists={artists.length}
        onSelectGenre={setSelectedGenre}
      />
      <p>
        {selectedGenre
          ? `${selectedGenre} · click the white space to clear`
          : "Click a bar to filter"}
      </p>
      <TextInput
        id="seen-artists-search"
        ariaLabel="Search seen artists"
        placeholder="Search artists..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        styles={SearchStyles}
      />
      {hasVisibleArtistWithoutGenre && (
        <p>Highlighted artists have no genre. Open one to pick it.</p>
      )}
      {visibleArtists.length === 0 && <p>No artists found</p>}
      <ArtistList>
        {visibleArtists.map((artist) => (
          <li key={artist.id}>
            <button
              type="button"
              data-no-genre={hasNoGenre(artist)}
              onClick={() => setEditingArtist(artist)}
            >
              {artist.name}
              <small>{describeSightings(artist.sightings)}</small>
            </button>
          </li>
        ))}
      </ArtistList>
      <SeenArtistDialog isOpen={isAdding} setIsOpen={setIsAdding} />
      <SeenArtistDialog
        isOpen={editingArtist !== undefined}
        setIsOpen={() => setEditingArtist(undefined)}
        artist={editingArtist}
      />
    </Card>
  );
};
