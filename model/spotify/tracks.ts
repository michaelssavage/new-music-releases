import type { Track } from "./liked-tracks";

export interface PlaylistTracksI {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: Array<ShowItem>;
}

export interface ShowItem {
  added_at: string;
  added_by: {
    external_urls: {
      spotify: string;
    };
    followers: {
      href: string | null;
      total: number;
    };
    href: string;
    id: string;
    type: string;
    uri: string;
  };
  is_local: boolean;
  track: Track;
}
