export async function getClientInfo(user: any) {
  let publicIp = "";

  try {
    const response = await fetch(
      "https://api.ipify.org?format=json"
    );

    const data = await response.json();

    publicIp = data.ip;
  } catch (error) {
    console.error("Error obteniendo IP pública:", error);
  }

  const userAgent = navigator.userAgent;

  let browser = "Desconocido";

  if (userAgent.includes("Edg")) {
    browser = "Microsoft Edge";
  } else if (userAgent.includes("Chrome")) {
    browser = "Google Chrome";
  } else if (userAgent.includes("Firefox")) {
    browser = "Mozilla Firefox";
  } else if (userAgent.includes("Safari")) {
    browser = "Safari";
  }

  let operatingSystem = "Desconocido";

  if (userAgent.includes("Windows")) {
    operatingSystem = "Windows";
  } else if (userAgent.includes("Mac")) {
    operatingSystem = "MacOS";
  } else if (userAgent.includes("Linux")) {
    operatingSystem = "Linux";
  } else if (userAgent.includes("Android")) {
    operatingSystem = "Android";
  } else if (userAgent.includes("iPhone")) {
    operatingSystem = "iOS";
  }

  return {
    CorreoUsuario: user?.username || "",

    NombreUsuario: user?.name || "",

    IPPublica: publicIp,

    Navegador: browser,

    SistemaOperativo: operatingSystem,
  };
}