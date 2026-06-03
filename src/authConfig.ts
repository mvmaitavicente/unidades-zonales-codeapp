import type { Configuration } from "@azure/msal-browser";

export const getMsalRedirectUri = () => {
  return `${window.location.origin}/auth-redirect.html`;
};

export const msalConfig: Configuration = {
  auth: {
    clientId: "f1eb7fb0-a90c-4efb-9a50-f1ddb2c719da",
    authority:
      "https://login.microsoftonline.com/7542cdab-2ecf-4371-956f-41795bcb56f7",
    redirectUri: getMsalRedirectUri(),
    postLogoutRedirectUri: window.location.origin,
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