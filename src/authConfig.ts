export const msalConfig = {
  auth: {
    clientId: "ef61716f-5d46-439d-94ef-97e9f5d427d8",
    authority:
      "https://login.microsoftonline.com/7542cdab-2ecf-4371-956f-41795bcb56f7",
    redirectUri: "http://localhost:5173",
  },
};

export const loginRequest = {
  scopes: ["User.Read", "Sites.Read.All"],
};