import { AlertCard } from "@client/components/AlertCard";
import { Button } from "@client/components/Button";
import { HeartIcon } from "@client/components/Icons/Heart";
import {
  ArtistsIcon,
  PlaylistIcon,
  TicketIcon,
} from "@client/components/Icons/NavIcons";
import { Layout } from "@client/components/Layout";
import { usePlaylistUpdates } from "@client/hooks/use-playlist-updates.hook";
import { useSession } from "@client/hooks/use-session.hook";
import { getSeenArtists, getUserTracks } from "@client/lib/spotify";
import { useAppStore } from "@client/store/appStore";
import { forTabletOnly } from "@client/styles/abstracts/mixins.styled";
import { requireAuth } from "@client/utils/auth";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import type { LikedTracksI } from "@model/spotify/liked-tracks";
import { useQuery } from "@tanstack/react-query";
import { Link, type LinkProps, createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const Route = createFileRoute("/")({
  beforeLoad: async () => await requireAuth(),
  component: HomePage,
});

interface StatCardProps {
  to: LinkProps["to"];
  label: string;
  icon: ReactNode;
  count: number | undefined;
  disabled: boolean;
}

const Header = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  margin: 2rem 1rem 1rem;
`;

const Subheader = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1;
  text-align: center;
  margin: 0 1rem 3rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 40rem;
  margin: 0 auto;

  ${forTabletOnly(css`
    grid-template-columns: 1fr;
  `)}
`;

const Card = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  text-decoration: none;
  color: #171717;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #f5f7fc;
  }

  &:focus-visible {
    outline: 1px solid #1e1e1e;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.75);
  }

  &[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: white;
  }
`;

const IconWrapper = styled.span`
  display: flex;
  flex-shrink: 0;
  color: #4e6db0;

  svg {
    width: 2.5rem;
    height: 2.5rem;
  }
`;

const Details = styled.span`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Count = styled.span`
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
`;

const Label = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const StatCard = ({ to, label, icon, count, disabled }: StatCardProps) => (
  <Card to={to} disabled={disabled}>
    <IconWrapper>{icon}</IconWrapper>
    <Details>
      <Count>{disabled ? "–" : (count ?? "–")}</Count>
      <Label>{label}</Label>
    </Details>
  </Card>
);

function HomePage() {
  const { userId, savedArtists } = useAppStore();

  const {
    data: session,
    refetch: checkVerification,
    isFetching: isCheckingVerification,
  } = useSession();
  const verified = session?.verified === true;

  const { data: playlist } = usePlaylistUpdates(userId, !!userId && verified);

  const { data: likedTracks } = useQuery<LikedTracksI | null>({
    queryKey: ["userTrack"],
    queryFn: getUserTracks,
    refetchOnWindowFocus: false,
    enabled: verified,
  });

  const { data: seenArtists } = useQuery({
    queryKey: ["seen-artists"],
    queryFn: getSeenArtists,
    refetchOnWindowFocus: false,
    enabled: verified,
  });

  return (
    <Layout>
      <Header>New music releases</Header>
      <Subheader>
        Straight to your Spotify playlist. A full cookie jar.
      </Subheader>

      {session && !verified && (
        <AlertCard
          action={
            <Button
              text="Check again"
              variant="secondary"
              onClick={() => checkVerification()}
              loading={isCheckingVerification}
            />
          }
        >
          Your account needs to be verified before you can use Cookie Jar. Ask
          the owner to verify it, then check again.
        </AlertCard>
      )}
      <Grid>
        <StatCard
          to="/updates"
          label="Updates"
          icon={<PlaylistIcon />}
          count={playlist?.total}
          disabled={!verified}
        />
        <StatCard
          to="/saved-artists"
          label="Saved Artists"
          icon={<ArtistsIcon />}
          count={savedArtists.length}
          disabled={!verified}
        />
        <StatCard
          to="/liked-songs"
          label="Liked Songs"
          icon={<HeartIcon size="20" />}
          count={likedTracks?.total}
          disabled={!verified}
        />
        <StatCard
          to="/seen-live"
          label="Seen Live"
          icon={<TicketIcon />}
          count={seenArtists?.artists.length}
          disabled={!verified}
        />
      </Grid>
    </Layout>
  );
}
