import { Layout } from "@client/components/Layout";
import { PlaylistSettings } from "@client/components/PlaylistSettings";
import { SchedulerRuns } from "@client/components/SchedulerRuns";
import { useSession } from "@client/hooks/use-session.hook";
import { requireAuth } from "@client/utils/auth";
import styled from "@emotion/styled";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/configuration")({
  beforeLoad: async () => await requireAuth(),
  component: ConfigurationPage,
});

const Sections = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
`;

function ConfigurationPage() {
  const { data: session } = useSession();

  return (
    <Layout>
      <Sections>
        <PlaylistSettings />
        {session?.isAdmin && <SchedulerRuns />}
      </Sections>
    </Layout>
  );
}
