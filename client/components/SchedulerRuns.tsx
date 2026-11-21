import { getSchedulerRuns } from "@client/lib/spotify";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import { Anchor } from "./Anchor";
import { ConfigCard, ConfigCardHeader } from "./ConfigCard";
import { Loader } from "./Loader";

const RunList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    padding: 0.5rem 0;
    border-top: 1px solid #e5e7eb;
  }
`;

const Status = styled.span<{ status: "SUCCESS" | "FAILED" }>`
  font-weight: bold;
  color: ${({ status }) => (status === "SUCCESS" ? "#15803d" : "#b91c1c")};
`;

const LoaderStyled = styled.div`
  margin: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const formatRunTime = (executionTime: string) =>
  new Date(executionTime).toLocaleString();

export const SchedulerRuns = () => {
  const {
    data: runs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["scheduler-runs"],
    queryFn: getSchedulerRuns,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <LoaderStyled>
        <Loader />
      </LoaderStyled>
    );
  }

  if (isError || !runs) return <div>Couldn't fetch recent runs</div>;

  return (
    <ConfigCard>
      <ConfigCardHeader>
        <h2>Recent runs</h2>
        <Anchor
          link="https://dashboard.render.com"
          text="Render dashboard"
          variant="secondary"
          isExternal
        />
      </ConfigCardHeader>
      {runs.length === 0 ? (
        <p>No runs yet</p>
      ) : (
        <RunList>
          {runs.map(({ id, executionTime, status }) => (
            <li key={id}>
              <time dateTime={executionTime}>
                {formatRunTime(executionTime)}
              </time>
              <Status status={status}>{status}</Status>
            </li>
          ))}
        </RunList>
      )}
    </ConfigCard>
  );
};
