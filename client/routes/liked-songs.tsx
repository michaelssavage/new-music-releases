import { Layout } from "@client/components/Layout";
import { Panel } from "@client/components/Panel";
import { LikedSongsTable } from "@client/components/Table/LikedSongs";
import { requireAuth } from "@client/utils/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/liked-songs")({
  beforeLoad: async () => await requireAuth(),
  component: LikedSongsPage,
});

function LikedSongsPage() {
  return (
    <Layout>
      <Panel>
        <LikedSongsTable />
      </Panel>
    </Layout>
  );
}
