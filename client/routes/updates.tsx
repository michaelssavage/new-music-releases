import { Group } from "@client/components/Group";
import { Layout } from "@client/components/Layout";
import { Loader } from "@client/components/Loader";
import { LoadMore } from "@client/components/LoadMore";
import { Panel } from "@client/components/Panel";
import { PlaylistUpdatesTable } from "@client/components/Table/PlaylistUpdates";
import { usePlaylistUpdates } from "@client/hooks/use-playlist-updates.hook";
import { getUser } from "@client/lib/spotify";
import { useAppStore } from "@client/store/appStore";
import { requireAuth } from "@client/utils/auth";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

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
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = usePlaylistUpdates(userId, !!userId);

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
          {data && (
            <p>{`${data.total.toLocaleString()} ${data.total === 1 ? "track" : "tracks"} in playlist`}</p>
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
