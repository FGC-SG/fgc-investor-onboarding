import { PublicClientApplication, Configuration } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "65a796d5-bad4-4bc0-a688-156501ff12a7",
    authority: "https://login.microsoftonline.com/8296a8b6-8602-4002-b7bc-d1a9319ff8f0",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read"],
};

export const msalInstance = new PublicClientApplication(msalConfig);

/**
 * Acquire a fresh access token for the signed-in account.
 *
 * Used to authenticate calls to our own /api routes. Tokens are short-lived, so
 * this is called per request rather than cached; MSAL serves from its own cache
 * and refreshes only when needed.
 */
export async function getAccessToken(): Promise<string | null> {
  const account = msalInstance.getAllAccounts()[0];
  if (!account) return null;
  try {
    const res = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
    return res.accessToken;
  } catch {
    return null;
  }
}
