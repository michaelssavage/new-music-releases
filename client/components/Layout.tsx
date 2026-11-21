import { Navbar } from "@client/components/Navbar";
import { Sidebar } from "@client/components/Sidebar";
import { forPhoneOnly } from "@client/styles/abstracts/mixins.styled";
import { css } from "@emotion/react";
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

  ${forPhoneOnly(css`
    padding: 1rem 0.75rem;
  `)}
`;

export const Layout = ({ children }: { children?: ReactNode }) => {
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
