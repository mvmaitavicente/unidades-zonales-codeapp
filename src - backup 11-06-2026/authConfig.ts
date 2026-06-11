import type { Configuration } from "@azure/msal-browser";

export const getMsalRedirectUri = () => window.location.origin;

export const msalConfig: Configuration = {
  auth: {
    clientId: "f1eb7fb0-a90c-4efb-9a50-f1ddb2c719da",
    authority:
      "https://login.microsoftonline.com/7542cdab-2ecf-4371-956f-41795bcb56f7",
    redirectUri: getMsalRedirectUri(),
    postLogoutRedirectUri: getMsalRedirectUri(),
  },
  cache: {
    cacheLocation: "localStorage",
  },
};

export const loginRequest = {
  scopes: ["User.Read", "Sites.ReadWrite.All"],
};

export const graphRequest = {
  scopes: ["User.Read", "Sites.ReadWrite.All"],
};