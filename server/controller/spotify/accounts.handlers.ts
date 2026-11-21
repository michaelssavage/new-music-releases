import type { AccountsResponse, VerificationInputI } from "@model/accounts";
import type { SpotifyControllerI } from "@server/container/types";
import { HttpException } from "@server/utils/exceptions";
import type { Request, Response } from "express";
import { withBearerJson } from "./http-helpers";

function parseVerificationInput(body: unknown): VerificationInputI {
  const { verified } = (body ?? {}) as Record<string, unknown>;
  if (typeof verified !== "boolean") {
    throw new HttpException(400, "verified must be true or false.");
  }
  return { verified };
}

export function createAccountsHandlers({ spotifyService }: SpotifyControllerI) {
  async function handleGetSession(req: Request, res: Response) {
    await withBearerJson(
      req,
      res,
      "Error retrieving session:",
      "Failed to retrieve session",
      (token) => spotifyService.getSession(token),
    );
  }

  async function handleGetAccounts(req: Request, res: Response) {
    await withBearerJson(
      req,
      res,
      "Error retrieving accounts:",
      "Failed to retrieve accounts",
      async (): Promise<AccountsResponse> => ({
        accounts: await spotifyService.listAccounts(),
      }),
    );
  }

  async function handleSetAccountVerification(req: Request, res: Response) {
    await withBearerJson(
      req,
      res,
      "Error updating account verification:",
      "Failed to update account verification",
      async () => {
        const { verified } = parseVerificationInput(req.body);
        await spotifyService.setAccountVerified(
          req.params.userId as string,
          verified,
        );
        return { status: "OK" };
      },
    );
  }

  return { handleGetSession, handleGetAccounts, handleSetAccountVerification };
}
