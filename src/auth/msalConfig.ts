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
