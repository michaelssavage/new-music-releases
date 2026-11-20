import { Loader } from "@client/components/Loader";
import { Navbar } from "@client/components/Navbar";
import { Sidebar } from "@client/components/Sidebar";
import { useSession } from "@client/hooks/use-session.hook";
import styled from "@emotion/styled";
import { Navigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

const Container = styled.div`
  flex: 1;
  display: flex;
  background-color: #c4cff1;
`;

const Main = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const Content = styled.main`
  flex: 1;
  padding: 1.5rem 1rem 1rem;
`;

const LoadingStyled = styled(Container)`
  align-items: center;
  justify-content: center;
`;

export const Layout = ({ children }: { children?: ReactNode }) => {
  const { data: session, isLoading } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (isLoading) {
    return (
      <LoadingStyled>
        <Loader />
      </LoadingStyled>
    );
  }

  if (session && !session.verified && pathname !== "/") {
    return <Navigate to="/" replace />;
  }

  return (
    <Container>
      <Sidebar />
      <Main>
        <Navbar />
        <Content>{children}</Content>
      </Main>
    </Container>
  );
};
