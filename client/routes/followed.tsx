import { ArtistExplorer } from "@client/components/ArtistExplorer";
import { Button } from "@client/components/Button";
import { Group } from "@client/components/Group";
import { Layout } from "@client/components/Layout";
import { Loader } from "@client/components/Loader";
import { Panel } from "@client/components/Panel";
import {
  getFollowedArtists,
  saveAllFollowedArtists,
} from "@client/lib/spotify";
import { useAppStore } from "@client/store/appStore";
import { requireAuth } from "@client/utils/auth";
import styled from "@emotion/styled";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "react-hot-toast";

export const Route = createFileRoute("/followed")({
  beforeLoad: async () => await requireAuth(),
  component: FollowedArtistsPage,
});

const LoaderStyled = styled.div`
  margin: 4rem auto;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const SaveAllBanner = styled.div`
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

function FollowedArtistsPage() {
  const { savedArtists, savedArtistsLoaded, refetchArtists } = useAppStore();

  const {
    data: followedArtists,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["followed-artists"],
    queryFn: getFollowedArtists,
    refetchOnWindowFocus: false,
  });

  const { isPending: isSavingAll, mutate: saveAll } = useMutation({
    mutationFn: saveAllFollowedArtists,
    onSuccess: () => {
      toast.success("Followed artists saved!");
      refetchArtists?.();
    },
    onError: (error) => toast.error(error.message),
  });

  if (isPending) {
    return (
      <Layout>
        <LoaderStyled>
          <Loader />
        </LoaderStyled>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <Panel direction="column">
          <p>Couldn't load your followed artists</p>
        </Panel>
      </Layout>
    );
  }

  const canSaveAll =
    savedArtistsLoaded &&
    savedArtists.length === 0 &&
    followedArtists.length > 0;

  return (
    <Layout>
      <Panel
        direction="column"
        title="Followed artists"
        subtitle="The artists you follow on Spotify. Track them!"
      >
        {canSaveAll && (
          <SaveAllBanner>
            <Group direction="column" gap="0.75rem">
              <p>
                Do you want to track all {followedArtists.length} artists you
                follow on Spotify?
              </p>
              <Button
                onClick={() => saveAll()}
                text="Save all followed artists"
                loading={isSavingAll}
              />
            </Group>
          </SaveAllBanner>
        )}

        {followedArtists.length === 0 ? (
          <p>You don't follow any artists on Spotify yet.</p>
        ) : (
          <ArtistExplorer
            artists={followedArtists}
            autoOpenArtistId={followedArtists[0]?.id}
          />
        )}
      </Panel>
    </Layout>
  );
}
