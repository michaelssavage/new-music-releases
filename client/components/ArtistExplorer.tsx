import { forTabletOnly } from "@client/styles/abstracts/mixins.styled";
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { ArtistDetailPanel } from "./Card/ArtistDetailPanel";
import { Group } from "./Group";
import { type ArtistRow, ArtistTable } from "./Table/ArtistTable";

const layoutStyling = forTabletOnly(css`
  flex-direction: column;
  align-items: stretch;
`);

interface ArtistExplorerI {
  artists: Array<ArtistRow>;
  showCreatedDate?: boolean;
  autoOpenArtistId?: string;
}

export const ArtistExplorer = ({
  artists,
  showCreatedDate,
  autoOpenArtistId,
}: ArtistExplorerI) => {
  const [artistId, setArtistId] = useState(autoOpenArtistId);

  useEffect(() => {
    setArtistId(autoOpenArtistId);
  }, [autoOpenArtistId]);

  return (
    <Group align="flex-start" wrap="nowrap" styling={layoutStyling}>
      {artistId && (
        <ArtistDetailPanel
          artistId={artistId}
          onClose={() => setArtistId(undefined)}
        />
      )}
      <ArtistTable
        artists={artists}
        showCreatedDate={showCreatedDate}
        onSelect={setArtistId}
      />
    </Group>
  );
};
