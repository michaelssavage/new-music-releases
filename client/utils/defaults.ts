export const defaultResults = {
  artists: [],
  albums: [],
  tracks: [],
};

export const searchTypeOptions = [
  { value: "artist", label: "Artists" },
  { value: "album", label: "Albums" },
  { value: "track", label: "Tracks" },
];

export const defaultSearchTypes = searchTypeOptions.map(({ value }) => value);
