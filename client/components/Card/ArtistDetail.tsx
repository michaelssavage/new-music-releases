import { getArtist } from "@client/lib/spotify";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "../Loader";
import { ArtistCard } from "./Artist";

export const ArtistDetail = ({ artistId }: { artistId?: string }) => {
  const {
    data: artist,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["artist", artistId],
    queryFn: () => getArtist(artistId),
    enabled: artistId !== undefined,
    refetchOnWindowFocus: false,
  });

  if (artistId === undefined) return null;
  if (isLoading) return <Loader />;
  if (isError || !artist) {
    return <p>Error fetching Artist, please try again</p>;
  }

  return <ArtistCard image={artist.images?.[0]?.url} artist={artist} />;
};
