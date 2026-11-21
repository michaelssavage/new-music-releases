export interface SessionI {
  userId: string;
  verified: boolean;
  isAdmin: boolean;
}

export interface AccountI {
  userId: string;
  displayName: string;
  verified: boolean;
  isAdmin: boolean;
}

export interface AccountsResponse {
  accounts: Array<AccountI>;
}

export interface VerificationInputI {
  verified: boolean;
}
