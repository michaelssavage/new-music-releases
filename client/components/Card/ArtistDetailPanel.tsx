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
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

const PANEL_WIDTH = "400px";

const ImageFrame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  flex-shrink: 0;
  background-color: #e5e7eb;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  button[id="close"] {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 1;
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

  ${forTabletOnly(css`
    aspect-ratio: auto;
    height: 16rem;
  `)}
`;

const Wrapper = styled.div`
  width: ${PANEL_WIDTH};
  flex: 0 0 ${PANEL_WIDTH};
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
    flex-basis: auto;
  `)}
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
  height: 13rem;
  padding: 1rem;
  border: 1px solid black;
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

const LoaderStyled = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FooterButtons = styled.div`
  width: 100%;
  display: flex;
  gap: 0.25rem;
  margin-top: auto;

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
    isPending,
    isError,
  } = useQuery({
    queryKey: ["artist", artistId],
    queryFn: () => getArtist(artistId),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

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

  const image = artist?.images?.[0]?.url;
  const isSaved = artist
    ? savedArtists.some(({ id }) => id === artist.id)
    : false;

  const handleAction = () => {
    if (!artist) return;
    if (isSaved) mutateRemove({ userId, id: artist.id, name: artist.name });
    else mutateSave({ userId, data: artist });
  };

  return (
    <Wrapper ref={ref}>
      <ImageFrame>
        <Button
          id="close"
          onClick={onClose}
          variant="ghost"
          ariaLabel="Close artist"
          text="Close"
        />
        {image && <img src={image} alt={artist?.name ?? ""} />}
      </ImageFrame>
      <Body>
        {!artist && isPending ? (
          <LoaderStyled>
            <Loader />
          </LoaderStyled>
        ) : isError || !artist ? (
          <p>Couldn't fetch artist details</p>
        ) : (
          <>
            <Details>
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
            </Details>
            <FooterButtons>
              <AddSeenArtistButton artistName={artist.name} />
              <Button
                onClick={handleAction}
                text={isSaved ? "Untrack" : "Track"}
                variant={isSaved ? "remove" : undefined}
                loading={loadingSave || loadingRemove}
              />
            </FooterButtons>
          </>
        )}
      </Body>
    </Wrapper>
  );
};
