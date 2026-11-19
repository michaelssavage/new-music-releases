import type { SeenArtistInputI } from "@model/seen-artists";
import type { SpotifyControllerI } from "@server/container/types";
import { HttpException } from "@server/utils/exceptions";
import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { withBearerJson } from "./http-helpers";

const FIRST_GIG_YEAR = 1950;
const MAX_NAME_LENGTH = 200;
const MAX_GENRE_LENGTH = 50;
const MAX_GENRES = 10;

function isValidGenre(genre: unknown): genre is string {
  return (
    typeof genre === "string" &&
    genre.trim() !== "" &&
    genre.length <= MAX_GENRE_LENGTH
  );
}

function parseSeenArtistInput(body: unknown): SeenArtistInputI {
  const { name, sightings, genreOverrides } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (typeof name !== "string" || !name.trim()) {
    throw new HttpException(400, "Artist name is required.");
  }
  if (name.length > MAX_NAME_LENGTH) {
    throw new HttpException(400, "Artist name is too long.");
  }
  if (!Array.isArray(sightings) || sightings.length === 0) {
    throw new HttpException(400, "At least one sighting is required.");
  }

  const maxYear = new Date().getFullYear() + 1;
  const parsedSightings = sightings.map((sighting) => {
    const { event, year } = (sighting ?? {}) as Record<string, unknown>;
    if (typeof event !== "string" || !event.trim()) {
      throw new HttpException(400, "Every sighting needs an event.");
    }
    if (
      !Number.isInteger(year) ||
      (year as number) < FIRST_GIG_YEAR ||
      (year as number) > maxYear
    ) {
      throw new HttpException(400, `Invalid year for ${event}.`);
    }
    return { event: event.trim(), year: year as number };
  });

  if (
    genreOverrides !== undefined &&
    (!Array.isArray(genreOverrides) ||
      genreOverrides.length > MAX_GENRES ||
      !genreOverrides.every(isValidGenre))
  ) {
    throw new HttpException(400, "Invalid genres.");
  }

  return {
    name: name.trim(),
    sightings: parsedSightings,
    ...(genreOverrides?.length && {
      genreOverrides: [...new Set(genreOverrides.map((g) => g.trim()))],
    }),
  };
}

function parseId(req: Request) {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) throw new HttpException(400, "Invalid id.");
  return id;
}

export function createSeenArtistsHandlers({
  spotifyService,
}: SpotifyControllerI) {
  async function handleGetSeenArtists(req: Request, res: Response) {
    await withBearerJson(
      req,
      res,
      "Error retrieving seen artists:",
      "Failed to retrieve seen artists",
      () => spotifyService.getSeenArtists(),
    );
  }

  async function handleAddSeenArtist(req: Request, res: Response) {
    await withBearerJson(
      req,
      res,
      "Error adding seen artist:",
      "Failed to add seen artist",
      async () => {
        await spotifyService.addSeenArtist(parseSeenArtistInput(req.body));
        return { status: "OK" };
      },
    );
  }

  async function handleUpdateSeenArtist(req: Request, res: Response) {
    await withBearerJson(
      req,
      res,
      "Error updating seen artist:",
      "Failed to update seen artist",
      async () => {
        await spotifyService.updateSeenArtist(
          parseId(req),
          parseSeenArtistInput(req.body),
        );
        return { status: "OK" };
      },
    );
  }

  async function handleDeleteSeenArtist(req: Request, res: Response) {
    await withBearerJson(
      req,
      res,
      "Error deleting seen artist:",
      "Failed to delete seen artist",
      async () => {
        await spotifyService.deleteSeenArtist(parseId(req));
        return { status: "OK" };
      },
    );
  }

  return {
    handleGetSeenArtists,
    handleAddSeenArtist,
    handleUpdateSeenArtist,
    handleDeleteSeenArtist,
  };
}
