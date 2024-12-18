import axios, { type AxiosResponse } from "axios";
import { getAccessToken } from "./getAccessToken";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import type { ArtistAlbumsI, NewReleasesI } from "../types/spotify";

dotenv.config();

const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const { MONGO_URI } = process.env;

const getNewReleasesForArtist = async (artistId: string, accessToken: string) => {
  const { data }: AxiosResponse<ArtistAlbumsI> = await axios.get(`${SPOTIFY_API_URL}/artists/${artistId}/albums`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { include_groups: "single,album", limit: 10 },
  });

  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
  return data.items.filter(({ release_date }) => release_date === today);
};

const fetchNewReleases = async (accessToken: string) => {
  const client = new MongoClient(MONGO_URI as string);
  const newReleases: Array<NewReleasesI> = [];

  try {
    await client.connect();
    const db = client.db("spotify");
    const artists = await db.collection("saved_artists").find({}).toArray();

    console.log(`${artists.length} Artists retrieved from MongoDB.`);

    for (const artist of artists) {
      const releases = await getNewReleasesForArtist(artist.id, accessToken);
      for (const release of releases) {
        newReleases.push({ artist: artist.name, ...release });
      }
    }

    return newReleases;
  } finally {
    await client.close();
  }
};

(async () => {
  const accessToken = await getAccessToken();
  const newReleases = await fetchNewReleases(accessToken);
  console.log("New Releases:", newReleases);
})();