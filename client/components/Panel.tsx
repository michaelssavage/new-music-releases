import styled from "@emotion/styled";
import type { ReactNode } from "react";
import { Group } from "./Group";

const Subtitle = styled.p`
  margin: 0;
  text-align: center;
  color: #4b5563;
  margin-top: -2rem;
`;

const Title = styled.h1`
  margin: 0;
  text-align: center;
`;

interface Props {
  title?: string;
  subtitle?: string;
  show?: boolean;
  direction?: "row" | "column";
  children: ReactNode;
}

export const Panel = ({
  show = true,
  title,
  subtitle,
  children,
  direction = "row",
}: Props) => {
  if (!show) return `No ${title} found`;

  return (
    <Group direction="column" align="center" width="100%" gap="2rem">
      {title && <Title>{title}</Title>}
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      <Group align="flex-start" justify="center" direction={direction}>
        {children}
      </Group>
    </Group>
  );
};
