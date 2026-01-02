import type { Request, Response } from "express";

export function getAuthorizationUrl(
  REDIRECT_URI: string,
  SPOTIFY_CLIENT_ID: string
) {
  const scopes = [
    "user-follow-read",
    "user-library-read",
    "user-read-playback-state",
    "user-modify-playback-state",
    "playlist-read-private",
    "playlist-modify-public",
    "playlist-modify-private",
  ];
  if (!REDIRECT_URI) {
    throw new Error("REDIRECT_URI is not defined.");
  }
  const url = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes.join(","))}`;
  return url;
}

export function requireSpotifyToken(
  req: Request,
  res: Response
): string | null {
  const token = req.headers.spotify_access_token as string;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return token;
}
