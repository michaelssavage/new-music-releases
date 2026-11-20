import { Layout } from "@client/components/Layout";
import { Panel } from "@client/components/Panel";
import { SeenArtists } from "@client/components/SeenArtists";
import { requireAuth } from "@client/utils/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/seen-live")({
  beforeLoad: async () => await requireAuth(),
  component: SeenLivePage,
});

function SeenLivePage() {
  return (
    <Layout>
      <Panel>
        <SeenArtists />
      </Panel>
    </Layout>
  );
}
