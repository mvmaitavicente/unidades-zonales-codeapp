import type {
  AccountInfo,
  IPublicClientApplication,
} from "@azure/msal-browser";

export type MedioCoordinacion = {
  id: string;
  IdMedio: string;
  DescripcionMedio: string;
};

async function fetchGraph(url: string, accessToken: string) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const text = await response.text();

  console.log("=================================");
  console.log("URL:", url);
  console.log("STATUS:", response.status);
  console.log("RESPONSE:", text);
  console.log("=================================");

  if (!response.ok) {
    throw new Error(`Graph error ${response.status}: ${text}`);
  }

  return JSON.parse(text);
}

export async function getMediosCoordinacion(
  instance: IPublicClientApplication,
  account: AccountInfo
): Promise<MedioCoordinacion[]> {
  const token = await instance.acquireTokenSilent({
    account,
    scopes: ["User.Read", "Sites.Read.All"],
  });

  console.log("ACCESS TOKEN:", token.accessToken);

  const hostname = "proniedoti.sharepoint.com";
  const sitePath = "sites/OTI_PUBLICACION";
  const listName = "UZ_MedioCoordinacion";

  const site = await fetchGraph(
    `https://graph.microsoft.com/v1.0/sites/${hostname}:/${sitePath}`,
    token.accessToken
  );

  console.log("SITE:", site);

  const data = await fetchGraph(
    `https://graph.microsoft.com/v1.0/sites/${site.id}/lists/${listName}/items?$expand=fields&$top=500`,
    token.accessToken
  );

  console.log("DATA VALUE:", data.value);
  console.log("FIRST FIELDS:", data.value?.[0]?.fields);

  return data.value.map((item: any) => ({
    id: String(item.id ?? ""),
    IdMedio: String(item.fields.IdMedio ?? ""),
    DescripcionMedio: String(item.fields.DescripcionMedio ?? ""),
  }));
}