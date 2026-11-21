import {
  floatAnimation,
  slideInAnimation,
} from "@client/styles/abstracts/animations.styled";
import { useAppStore } from "@client/store/appStore";
import styled from "@emotion/styled";
import { Link } from "@tanstack/react-router";
import { Button } from "./Button";
import { ArtistsIcon } from "./Icons/NavIcons";

interface Props {
  title: string;
  description: string;
}

const Card = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  max-width: 40rem;
  margin: 0 auto 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  ${slideInAnimation("16px", "vertical", "0.4s", "backwards")}

  h2 {
    font-size: 1.25rem;
  }
`;

const IconWrapper = styled.span`
  display: flex;
  color: #4e6db0;
  ${floatAnimation}

  svg {
    width: 3rem;
    height: 3rem;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
`;

const FollowedLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 2px 12px;
  border: 1px solid #ebedf5;
  border-radius: 4px;
  color: #000000;
  text-decoration: none;
  background-color: #f9f5f5;

  &:hover {
    background-color: #ebedf5;
  }
`;

export const EmptyState = ({ title, description }: Props) => {
  const setSearchOpen = useAppStore((state) => state.setSearchOpen);

  return (
    <Card>
      <IconWrapper>
        <ArtistsIcon />
      </IconWrapper>
      <h2>{title}</h2>
      <p>{description}</p>
      <Actions>
        <Button onClick={() => setSearchOpen(true)} text="Search for artists" />
        <FollowedLink to="/followed-artists">
          View followed artists
        </FollowedLink>
      </Actions>
    </Card>
  );
};
