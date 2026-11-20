import { Navbar } from "@client/components/Navbar";
import { Sidebar } from "@client/components/Sidebar";
import styled from "@emotion/styled";
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

export const Layout = ({ children }: { children?: ReactNode }) => (
  <Container>
    <Sidebar />
    <Main>
      <Navbar />
      <Content>{children}</Content>
    </Main>
  </Container>
);
