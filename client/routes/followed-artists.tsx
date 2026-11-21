import { ArtistCard } from "@client/components/Card/Artist";
import { CardGrid } from "@client/components/Card/Card.styled";
import { Button } from "@client/components/Button";
import { TextInput } from "@client/components/Form/TextInput";
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
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ChangeEvent, useState } from "react";
import { toast } from "react-hot-toast";

export const Route = createFileRoute("/followed-artists")({
  beforeLoad: async () => await requireAuth(),
  component: FollowedArtistsPage,
});

const SaveAllBanner = styled.div`
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const filterStyles = css`
  width: 100%;
  max-width: 400px;

  input {
    width: 100%;
  }
`;

function FollowedArtistsPage() {
  const { savedArtists, savedArtistsLoaded, refetchArtists } = useAppStore();
  const [filter, setFilter] = useState("");

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

  const handleFilter = (event: ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  if (isPending) {
    return (
      <Layout>
        <Loader />
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

  const visibleArtists = followedArtists.filter(({ name }) =>
    name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <Layout>
      <Panel direction="column" title="Followed artists">
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
          <>
            <TextInput
              id="followed-filter"
              ariaLabel="Filter followed artists"
              placeholder="Filter by name..."
              value={filter}
              onChange={handleFilter}
              styles={filterStyles}
            />
            <CardGrid>
              {visibleArtists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  image={artist.images[0]?.url}
                  artist={artist}
                />
              ))}
            </CardGrid>
          </>
        )}
      </Panel>
    </Layout>
  );
}
