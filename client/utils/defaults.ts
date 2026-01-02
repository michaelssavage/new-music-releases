export const defaultResults = {
  artists: [],
  albums: [],
  tracks: [],
};

export interface TypeI {
  value: string;
  label: string;
}

export const defaultOptions: Array<TypeI> = [
  { value: "artist", label: "Artists" },
  { value: "album", label: "Albums" },
  { value: "track", label: "Tracks" },
];
