import { Button } from "@client/components/Button";
import { Group } from "@client/components/Group";
import { useSession } from "@client/hooks/use-session.hook";
import { useAppStore } from "@client/store/appStore";
import styled from "@emotion/styled";
import { useNavigate } from "@tanstack/react-router";

const Page = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #c4cff1;
`;

const Message = styled.section`
  max-width: 28rem;
  padding: 2rem;
  border-radius: 8px;
  background: white;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h1 {
    margin-top: 0;
  }
`;

export const AwaitingVerification = () => {
  const navigate = useNavigate();
  const { logout } = useAppStore();
  const { refetch, isFetching } = useSession();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <Page>
      <Message>
        <h1>Waiting for verification</h1>
        <p>
          Your Spotify account is signed in, but it needs to be verified before
          you can use Cookie Jar. Ask the owner to verify it, then check again.
        </p>
        <Group>
          <Button
            text="Check again"
            onClick={() => refetch()}
            loading={isFetching}
          />
          <Button text="Log out" variant="secondary" onClick={handleLogout} />
        </Group>
      </Message>
    </Page>
  );
};
