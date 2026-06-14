import { Anchor } from "@client/components/Anchor";
import { Button } from "@client/components/Button";
import { Group } from "@client/components/Group";
import { SpotifyIcon } from "@client/components/Icons/Spotify";
import { Info } from "@client/components/InfoToast";
import { Loader } from "@client/components/Loader";
import { Panel } from "@client/components/Panel";
import { LikedSongsTable } from "@client/components/Table/LikedSongs";
import { PlaylistUpdatesTable } from "@client/components/Table/PlaylistUpdates";
import { SavedArtistsTable } from "@client/components/Table/SavedArtists";
import { type Tab, TabPanel } from "@client/components/Tabs";
import { useTabs } from "@client/context/tabs.context";
import {
  getSpotifyPlaylist,
  getUser,
  updateSpotifyPlaylistReleases,
} from "@client/lib/spotify";
import { useAppStore } from "@client/store/appStore";
import { requireAuth } from "@client/utils/auth";
import styled from "@emotion/styled";
import type { SpotifyDataProps } from "@model/spotify";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";

export const Route = createFileRoute("/")({
  beforeLoad: async () => await requireAuth(),
  component: MainComponent,
});

const Content = styled.div`
  padding: 0 0 1rem;
  background-color: #c4cff1;
`;

const LoadingStyled = styled.div`
  margin: 4rem auto;
  width: 100%;
  display: flex;
  justify-content: center;
`;

function MainComponent() {
  const { savedArtists, userId } = useAppStore();
  const { activeTab, setTabs } = useTabs();
  const isPlaylistTabActive = activeTab === "playlist";

  const { data: userData } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    enabled: isPlaylistTabActive,
  });

  const {
    data,
    refetch: refetchPlaylist,
    isLoading,
  } = useQuery<SpotifyDataProps | null>({
    queryKey: ["playlist"],
    queryFn: () => getSpotifyPlaylist(userId),
    refetchOnWindowFocus: false,
    enabled: isPlaylistTabActive,
  });

  const { isPending, mutate } = useMutation({
    mutationFn: updateSpotifyPlaylistReleases,
    onSuccess: (data) => {
      if (!data) {
        toast.custom(<Info text="No data returned" />);
      } else if (Array.isArray(data.tracks) && data.tracks?.length > 0) {
        toast.success("Fetched new playlist releases");
        refetchPlaylist();
      } else {
        toast.custom(<Info text="No new releases found" />);
      }
    },
    onError: (error) => {
      console.error(error?.message);
      toast.error("Failed to fetch new releases");
    },
  });

  const tabs = useMemo<Array<Tab>>(
    () => [
      {
        key: "playlist",
        tab: "Playlist Updates",
        panel: (
          <Panel direction="column">
            <Group justify="center" width="100%">
              {userData?.roles?.includes("admin") && (
                <Button
                  onClick={() => mutate(userId)}
                  text="Fetch new releases"
                  variant="secondary"
                  loading={isPending}
                />
              )}
              {data?.playlist && (
                <Anchor
                  link={data?.playlist.external_urls.spotify}
                  text="Open playlist"
                  variant="secondary"
                  icon={<SpotifyIcon size={20} />}
                  isExternal
                />
              )}
            </Group>
            {data ? (
              <PlaylistUpdatesTable
                tracks={data?.playlistItems?.items}
                userData={userData}
              />
            ) : (
              <p>No tracks found</p>
            )}
          </Panel>
        ),
      },
      {
        key: "artists",
        tab: `Saved Artists (${savedArtists.length})`,
        panel: (
          <Panel>
            <SavedArtistsTable />
          </Panel>
        ),
      },
      {
        key: "liked",
        tab: "Liked Songs",
        panel: (
          <Panel>
            <LikedSongsTable />
          </Panel>
        ),
      },
    ],
    [data, userData, savedArtists.length, isPending, mutate, userId],
  );

  useEffect(() => {
    setTabs(tabs);
    return () => setTabs([]);
  }, [tabs, setTabs]);

  if (isPlaylistTabActive && isLoading) {
    return (
      <LoadingStyled>
        <Loader />
      </LoadingStyled>
    );
  }

  return (
    <Content>
      <TabPanel data={tabs} />
    </Content>
  );
}
