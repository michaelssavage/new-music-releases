import { Layout } from "@client/components/Layout";
import { Panel } from "@client/components/Panel";
import { SchedulerRuns } from "@client/components/SchedulerRuns";
import { requireAuth } from "@client/utils/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/configuration")({
  beforeLoad: async () => await requireAuth(),
  component: ConfigurationPage,
});

function ConfigurationPage() {
  return (
    <Layout>
      <Panel>
        <SchedulerRuns />
      </Panel>
    </Layout>
  );
}
