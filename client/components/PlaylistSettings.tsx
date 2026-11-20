import { Anchor } from "@client/components/Anchor";
import { Button } from "@client/components/Button";
import { ConfigCard, ConfigCardHeader } from "@client/components/ConfigCard";
import { TextInput } from "@client/components/Form/TextInput";
import { Loader } from "@client/components/Loader";
import {
  createPlaylist,
  getPlaylistSettings,
  getUserPlaylists,
  renamePlaylist,
  selectPlaylist,
} from "@client/lib/spotify";
import styled from "@emotion/styled";
import {
  PLAYLIST_ROLES,
  type PlaylistRole,
  type PlaylistSummaryI,
} from "@model/playlist-settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";

const ROLE_COPY: Record<
  PlaylistRole,
  { title: string; description: string; empty: string }
> = {
  releases: {
    title: "Updates playlist",
    description: "New releases from your saved artists are added here.",
    empty:
      "None yet. A playlist called Cookie Jar is created on your first sync, or pick one below.",
  },
  tracker: {
    title: "Artist tracker playlist",
    description:
      "Every artist on this playlist is saved, so their new releases are tracked.",
    empty: "None selected. No artists are tracked until you pick one.",
  },
};

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Row = styled.div`
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const Subheading = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
`;

const Description = styled.p`
  margin: 0 0 1rem;
`;

const NativeSelect = styled.select`
  height: 32px;
  min-width: 14rem;
  padding: 0.25rem;
  border-radius: 4px;
  border: 1px solid #cccccc;
  background-color: #ffffff;
`;

const LoaderStyled = styled.div`
  margin: 2rem;
  display: flex;
  justify-content: center;
`;

interface PlaylistCardProps {
  role: PlaylistRole;
  current: PlaylistSummaryI | null;
  playlists: Array<PlaylistSummaryI>;
  busy: boolean;
  onSelect: (playlistId: string) => void;
  onCreate: (name: string) => void;
  onRename: (name: string) => void;
}

const PlaylistCard = ({
  role,
  current,
  playlists,
  busy,
  onSelect,
  onCreate,
  onRename,
}: PlaylistCardProps) => {
  const { title, description, empty } = ROLE_COPY[role];
  const [renameValue, setRenameValue] = useState(current?.name ?? "");
  const currentId = current?.id ?? "";
  const [selectedId, setSelectedId] = useState(currentId);
  const [newName, setNewName] = useState("");

  const trimmedRename = renameValue.trim();

  return (
    <ConfigCard>
      <ConfigCardHeader>
        <h2>{title}</h2>
        {current && (
          <Anchor
            link={current.external_urls.spotify}
            text="Open in Spotify"
            variant="secondary"
            isExternal
          />
        )}
      </ConfigCardHeader>
      <Description>{description}</Description>

      <Stack>
        <div>
          <Subheading>Current playlist</Subheading>
          {current ? (
            <Row>
              <TextInput
                id={`${role}-rename`}
                ariaLabel={`${title} name`}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
              />
              <Button
                text="Rename"
                variant="secondary"
                disabled={
                  busy || !trimmedRename || trimmedRename === current.name
                }
                onClick={() => onRename(trimmedRename)}
              />
            </Row>
          ) : (
            <p>{empty}</p>
          )}
        </div>

        <div>
          <Subheading>Use an existing playlist</Subheading>
          <Row>
            <NativeSelect
              aria-label={`Choose ${title.toLowerCase()}`}
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {!current && <option value="">Choose a playlist…</option>}
              {playlists.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </NativeSelect>
            <Button
              text="Use playlist"
              variant="secondary"
              disabled={busy || !selectedId || selectedId === currentId}
              onClick={() => onSelect(selectedId)}
            />
          </Row>
        </div>

        <div>
          <Subheading>Create a new playlist</Subheading>
          <Row>
            <TextInput
              id={`${role}-create`}
              ariaLabel={`New ${title.toLowerCase()} name`}
              placeholder="Playlist name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button
              text="Create and use"
              variant="secondary"
              disabled={busy || !newName.trim()}
              onClick={() => onCreate(newName.trim())}
            />
          </Row>
        </div>
      </Stack>
    </ConfigCard>
  );
};

export const PlaylistSettings = () => {
  const queryClient = useQueryClient();

  const settings = useQuery({
    queryKey: ["playlist-settings"],
    queryFn: getPlaylistSettings,
    refetchOnWindowFocus: false,
  });
  const playlists = useQuery({
    queryKey: ["user-playlists"],
    queryFn: getUserPlaylists,
    refetchOnWindowFocus: false,
  });

  const mutationOptions = (successMessage: string) => ({
    onSuccess: async () => {
      await Promise.all(
        ["playlist-settings", "user-playlists", "playlist"].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey: [queryKey] }),
        ),
      );
      toast.success(successMessage);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const select = useMutation({
    mutationFn: selectPlaylist,
    ...mutationOptions("Playlist updated"),
  });
  const create = useMutation({
    mutationFn: createPlaylist,
    ...mutationOptions("Playlist created"),
  });
  const rename = useMutation({
    mutationFn: renamePlaylist,
    ...mutationOptions("Playlist renamed"),
  });

  if (settings.isLoading || playlists.isLoading) {
    return (
      <LoaderStyled>
        <Loader />
      </LoaderStyled>
    );
  }

  if (!settings.data || !playlists.data) {
    return <div>Couldn't load your playlists</div>;
  }

  const busy = select.isPending || create.isPending || rename.isPending;

  return (
    <>
      {PLAYLIST_ROLES.map((role) => {
        const current = settings.data[role];
        return (
          <PlaylistCard
            key={`${role}:${current?.id}:${current?.name}`}
            role={role}
            current={current}
            playlists={playlists.data}
            busy={busy}
            onSelect={(playlistId) => select.mutate({ role, playlistId })}
            onCreate={(name) => create.mutate({ role, name })}
            onRename={(name) => rename.mutate({ role, name })}
          />
        );
      })}
    </>
  );
};
