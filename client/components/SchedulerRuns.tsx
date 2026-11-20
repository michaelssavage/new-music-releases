import { getSchedulerRuns } from "@client/lib/spotify";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import { Anchor } from "./Anchor";
import { Loader } from "./Loader";

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem 1.5rem;
  width: 100%;
  max-width: 900px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
    font-size: 1rem;
  }
`;

const RunList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    justify-content: space-between;
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
    <Card>
      <Header>
        <h2>Recent runs</h2>
        <Anchor
          link="https://dashboard.render.com"
          text="Render dashboard"
          variant="secondary"
          isExternal
        />
      </Header>
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
    </Card>
  );
};
