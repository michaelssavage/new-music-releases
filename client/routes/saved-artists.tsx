import { Layout } from "@client/components/Layout";
import { Panel } from "@client/components/Panel";
import { SavedArtistsTable } from "@client/components/Table/SavedArtists";
import { requireAuth } from "@client/utils/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/saved-artists")({
  beforeLoad: async () => await requireAuth(),
  component: SavedArtistsPage,
});

function SavedArtistsPage() {
  return (
    <Layout>
      <Panel>
        <SavedArtistsTable />
      </Panel>
    </Layout>
  );
}
