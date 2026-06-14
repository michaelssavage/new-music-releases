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
import toast from "react-hot-toast";
import { Anchor } from "../Anchor";
import { Button } from "../Button";
import { Group } from "../Group";
import { FolderCheckIcon } from "../Icons/FolderCheck";
import { PlusIcon } from "../Icons/Plus";
import { SpotifyIcon } from "../Icons/Spotify";
import { Info } from "../InfoToast";

interface PlaylistTableProps {
  tracks: Array<ShowItem>;
  userData: User;
}

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 0 0.5rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AlbumArt = styled.img`
  width: 80px;
  height: 80px;
  border-top-left-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
`;

const TrackName = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackInfo = styled.a`
  display: flex;
  flex-direction: column;
  padding: 0.25rem;
  min-width: 0;
  text-decoration: none;
  transition: transform 0.2s ease;

  &:hover {
    ${TrackName} {
      transform: scale(1.04);
    }
  }
`;

const ArtistName = styled.span`
  font-size: 0.8125rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
`;

const DateAdded = styled.span`
  font-size: 0.8125rem;
  color: #9ca3af;
`;

const plusStyles = css`
  color: #353232;

  &&:hover {
    color: #2e1313;
  }

  svg {
    color: #353232;
  }

  &:disabled {
    background-color: transparent;
  }
`;

export const PlaylistUpdatesTable = ({
  tracks,
  userData,
}: PlaylistTableProps) => {
  const { isTrackInListenLater, refetchListenLater } = useListenLater(
    userData.listen_later_playlist,
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
        <Info text="Track already exists in Listen Later playlist" />,
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

  return (
    <GridContainer>
      {tracks.map((item) => {
        const { track, added_at } = item;
        const albumArt = track.album?.images?.[0]?.url;
        const artists = track.artists.map((a) => a.name).join(", ");

        return (
          <Card key={track.id}>
            <CardHeader>
              {albumArt && (
                <AlbumArt src={albumArt} alt={`${track.album.name} cover`} />
              )}
              <TrackInfo
                href={track.external_urls.spotify}
                rel="noopener noreferrer"
                target="_blank"
              >
                <TrackName title={track.name}>{track.name}</TrackName>
                <ArtistName title={artists}>{artists}</ArtistName>
              </TrackInfo>
            </CardHeader>

            <CardFooter>
              <DateAdded>Date added:{displayDate(added_at)}</DateAdded>
              <Group>
                {userData?.listen_later_playlist && (
                  <Button
                    onClick={() => saveForLater(track)}
                    text="Listen later"
                    variant="link"
                    icon={renderListenLaterIcon(track.id)}
                    disabled={disableListenLater(track.id)}
                    styles={plusStyles}
                  />
                )}
                <Anchor
                  link={track.external_urls.spotify}
                  text="Open"
                  variant="link"
                  icon={<SpotifyIcon />}
                  isExternal
                />
              </Group>
            </CardFooter>
          </Card>
        );
      })}
    </GridContainer>
  );
};
