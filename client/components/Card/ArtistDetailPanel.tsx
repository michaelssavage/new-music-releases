import { AddSeenArtistButton } from "@client/components/AddSeenArtistButton";
import { Button } from "@client/components/Button";
import { Group } from "@client/components/Group";
import { SpotifyIcon } from "@client/components/Icons/Spotify";
import { Loader } from "@client/components/Loader";
import { getArtist, removeArtist, saveArtist } from "@client/lib/spotify";
import { useAppStore } from "@client/store/appStore";
import { forTabletOnly } from "@client/styles/abstracts/mixins.styled";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

const Wrapper = styled.div`
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
      top: 4px;
      right: 4px;
      color: white;
      background-color: #01010142;

      &:hover {
        background-color: #010101;
        text-decoration: none;
      }
      svg {
        color: white;
        fill: transparent;
      }
    }
  }
`;

const LoaderStyled = styled.div`
  margin: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const cardBodyStyling = css`
  max-width: 500px;
  border: 1px solid black;
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
  padding: 1rem;
`;

const FooterButtons = styled.div`
  width: 100%;
  display: flex;
  gap: 0.25rem;

  button {
    flex: 1;
  }
`;

interface ArtistDetailPanelI {
  artistId: string;
  onClose: () => void;
}

export const ArtistDetailPanel = ({
  artistId,
  onClose,
}: ArtistDetailPanelI) => {
  const ref = useRef<HTMLDivElement>(null);
  const { savedArtists, userId, refetchArtists } = useAppStore();

  const {
    data: artist,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["artist", artistId],
    queryFn: () => getArtist(artistId),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!artist) return;
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [artist]);

  const { isPending: loadingSave, mutate: mutateSave } = useMutation({
    mutationFn: saveArtist,
    onSuccess: () => {
      toast.success("Artist saved!");
      refetchArtists?.();
    },
  });

  const { isPending: loadingRemove, mutate: mutateRemove } = useMutation({
    mutationFn: removeArtist,
    onSuccess: () => {
      toast.success("Artist removed!");
      refetchArtists?.();
    },
    onError: () => toast.error("Couldn't remove artist"),
  });

  if (isLoading) {
    return (
      <LoaderStyled>
        <Loader />
      </LoaderStyled>
    );
  }

  if (isError || !artist) return <div>Couldn't fetch artist details</div>;

  const image = artist.images?.[0]?.url;
  const isSaved = savedArtists.some(({ id }) => id === artist.id);

  const handleAction = () => {
    if (isSaved) mutateRemove({ userId, id: artist.id, name: artist.name });
    else mutateSave({ userId, data: artist });
  };

  return (
    <Wrapper ref={ref}>
      {image && (
        <div id="image">
          <Button
            id="close"
            onClick={onClose}
            variant="ghost"
            ariaLabel="Close artist"
            text="Close"
          />
          <img src={image} alt={artist.name} />
        </div>
      )}
      <Group
        direction="column"
        gap="0.5rem"
        align="flex-start"
        styling={cardBodyStyling}
      >
        <Group
          align="center"
          justify="space-between"
          width="100%"
          wrap="nowrap"
        >
          <h2>{artist.name}</h2>

          <a
            href={artist.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SpotifyIcon strokeWidth={1.5} />
          </a>
        </Group>
        <p>{artist.followers.total.toLocaleString()} Followers</p>
        <p>Genres: {artist.genres.join(", ")}</p>
        <FooterButtons>
          <AddSeenArtistButton artistName={artist.name} />

          <Button
            onClick={handleAction}
            text={isSaved ? "Untrack" : "Track"}
            variant={isSaved ? "remove" : undefined}
            loading={loadingSave || loadingRemove}
          />
        </FooterButtons>
      </Group>
    </Wrapper>
  );
};
