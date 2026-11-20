import { Anchor } from "@client/components/Anchor";
import { Button } from "@client/components/Button";
import { Group } from "@client/components/Group";
import { SpotifyIcon } from "@client/components/Icons/Spotify";
import { Info } from "@client/components/InfoToast";
import { Layout } from "@client/components/Layout";
import { Loader } from "@client/components/Loader";
import { LoadMore } from "@client/components/LoadMore";
import { Panel } from "@client/components/Panel";
import { PlaylistUpdatesTable } from "@client/components/Table/PlaylistUpdates";
import { usePlaylistUpdates } from "@client/hooks/use-playlist-updates.hook";
import { getUser, updateSpotifyPlaylistReleases } from "@client/lib/spotify";
import { useAppStore } from "@client/store/appStore";
import { requireAuth } from "@client/utils/auth";
import styled from "@emotion/styled";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "react-hot-toast";

export const Route = createFileRoute("/updates")({
  beforeLoad: async () => await requireAuth(),
  component: UpdatesPage,
});

const LoadingStyled = styled.div`
  margin: 4rem auto;
  width: 100%;
  display: flex;
  justify-content: center;
`;

function UpdatesPage() {
  const { userId } = useAppStore();

  const { data: userData } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    enabled: !!userId,
  });

  const {
    data,
    refetch: refetchPlaylist,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = usePlaylistUpdates(userId, !!userId);

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

  if (isLoading) {
    return (
      <Layout>
        <LoadingStyled>
          <Loader />
        </LoadingStyled>
      </Layout>
    );
  }

  return (
    <Layout>
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
              link={data.playlist.external_urls.spotify}
              text="Open playlist"
              variant="secondary"
              icon={<SpotifyIcon size={20} />}
              isExternal
            />
          )}
        </Group>
        {data ? (
          <PlaylistUpdatesTable
            tracks={data.tracks}
            userData={userData}
            loadMore={
              <LoadMore
                loadedCount={data.tracks.length}
                totalCount={data.total}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                isFetchNextPageError={isFetchNextPageError}
                onLoadMore={fetchNextPage}
              />
            }
          />
        ) : (
          <p>No tracks found</p>
        )}
      </Panel>
    </Layout>
  );
}
