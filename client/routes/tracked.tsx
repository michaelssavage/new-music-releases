import { ArtistExplorer } from "@client/components/ArtistExplorer";
import { EmptyState } from "@client/components/EmptyState";
import { Layout } from "@client/components/Layout";
import { Panel } from "@client/components/Panel";
import { useAppStore } from "@client/store/appStore";
import { requireAuth } from "@client/utils/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tracked")({
  beforeLoad: async () => await requireAuth(),
  component: SavedArtistsPage,
});

function SavedArtistsPage() {
  const { savedArtists, savedArtistsLoaded } = useAppStore();

  if (savedArtistsLoaded && savedArtists.length === 0) {
    return (
      <Layout>
        <EmptyState
          title="No tracked artists yet"
          description="Start adding artists by searching, or check the artists you follow on Spotify."
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <Panel
        title="Tracked artists"
        subtitle="The artists you'll get daily updates for in your Cookie Jar."
      >
        <ArtistExplorer
          artists={savedArtists}
          showCreatedDate
          autoOpenArtistId={savedArtists.at(-1)?.id}
        />
      </Panel>
    </Layout>
  );
}
