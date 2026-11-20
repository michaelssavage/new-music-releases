import styled from "@emotion/styled";
import type { ReactNode } from "react";

const AlertStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  max-width: 40rem;
  margin: 0 auto 1rem;
  padding: 1rem 1.5rem;
  color: #78350f;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;

  p {
    margin: 0;
  }
`;

export const AlertCard = ({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) => (
  <AlertStyled role="alert">
    <p>{children}</p>
    {action}
  </AlertStyled>
);
