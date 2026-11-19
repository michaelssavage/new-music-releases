import { getSeenArtists } from "@client/lib/spotify";
import styled from "@emotion/styled";
import type { SightingI } from "@model/seen-artists";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GenreBarChart } from "./GenreBarChart";
import { Loader } from "./Loader";

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

  li {
    padding: 0.25rem 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    font-size: 0.875rem;
  }

  small {
    margin-left: 0.5rem;
    color: #6b7280;
  }
`;

const LoaderStyled = styled.div`
  margin: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
`;

function describeSightings(sightings: Array<SightingI>) {
  return sightings.map(({ event, year }) => `${event} ${year}`).join(", ");
}

export const SeenArtists = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>();

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
  const visibleArtists = selectedGenre
    ? artists.filter(({ genre }) => genre === selectedGenre)
    : artists;

  return (
    <Card>
      <h2>Artists seen live by genre</h2>
      <p>
        {artists.length} artists · {sightingsCount} sightings
      </p>
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
      <ArtistList>
        {visibleArtists.map(({ name, sightings }) => (
          <li key={name}>
            {name}
            <small>{describeSightings(sightings)}</small>
          </li>
        ))}
      </ArtistList>
    </Card>
  );
};
