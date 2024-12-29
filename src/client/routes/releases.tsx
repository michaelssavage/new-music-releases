import { Anchor } from "@client/components/Anchor.tsx"
import { Button } from "@client/components/Button.tsx"
import { Group } from "@client/components/Group.tsx"
import { Info } from "@client/components/InfoToast.tsx"
import { Panel } from "@client/components/Panel.tsx"
import { ArtistTable } from "@client/components/Table/Artist.tsx"
import { PlaylistTable } from "@client/components/Table/Playlist.tsx"
import { type Tab, Tabs } from "@client/components/Tabs.tsx"
import { getSavedArtists } from "@client/lib/Spotify/artist.ts"
import {
  getSpotifyPlaylist,
  updateSpotifyPlaylistReleases,
} from "@client/lib/Spotify/playlist.ts"
import styled from "@emotion/styled"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "react-hot-toast"
import type { SpotifyDataProps } from "src/types/spotify.ts"

export const Route = createFileRoute("/releases")({
  component: Releases,
})

const Wrapper = styled.div`
  padding: 3rem 2rem;
  background-color: #8090c0;
`

const Content = styled.div`
  padding: 2rem;
`

function Releases() {
  const { data: artistIds = [], refetch: refetchSavedArtists } = useQuery({
    queryKey: ["savedArtists"],
    queryFn: getSavedArtists,
    refetchOnWindowFocus: false,
  })

  const { data: spotifyPlaylist, refetch } = useQuery<SpotifyDataProps | null>({
    queryKey: ["playlist"],
    queryFn: getSpotifyPlaylist,
    refetchOnWindowFocus: false,
  })

  const { isPending, mutate } = useMutation({
    mutationFn: updateSpotifyPlaylistReleases,
    onSuccess: ({ tracks }) => {
      if (tracks.length > 0) {
        toast.success("Fetched new playlist releases")
        refetch()
      } else {
        toast.custom(<Info text="No new releases found" />)
      }
    },
    onError: (error) => {
      console.error(error)
      toast.error("Failed to fetch new releases")
    },
  })

  const data: Array<Tab> = [
    {
      key: "artists",
      tab: "Saved Artists",
      panel: (
        <Panel show>
          <ArtistTable
            data={artistIds}
            refetchSavedArtists={refetchSavedArtists}
          />
        </Panel>
      ),
    },
    {
      key: "playlist",
      tab: "Saved Playlist",
      panel: (
        <Panel title="Saved Playlist" show>
          {spotifyPlaylist ? (
            <PlaylistTable tracks={spotifyPlaylist?.playlistItems.items} />
          ) : (
            <p>No tracks found</p>
          )}
        </Panel>
      ),
    },
  ]

  return (
    <div>
      <Wrapper>
        <h1>New Releases</h1>

        <Group justify="flex-start">
          <Button
            onClick={mutate}
            text="Fetch new releases"
            variant="secondary"
            loading={isPending}
          />

          {spotifyPlaylist?.playlist && (
            <Anchor
              link={spotifyPlaylist?.playlist.external_urls.spotify}
              text="Open playlist"
              variant="secondary"
              isExternal
            />
          )}
        </Group>
      </Wrapper>

      <Content>
        <Tabs data={data} />
      </Content>
    </div>
  )
}
