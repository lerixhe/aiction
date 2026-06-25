import { useEffect, useState } from "react";

type Route = "main" | "toolbar" | "chat" | "settings";

function getRouteFromHash(): Route {
  const hash = window.location.hash.replace("#/", "");
  if (hash === "toolbar") return "toolbar";
  if (hash === "chat") return "chat";
  if (hash === "settings") return "settings";
  return "main";
}

interface RouterProps {
  main: React.ReactNode;
  toolbar: React.ReactNode;
  chat: React.ReactNode;
  settings?: React.ReactNode;
}

export function Router({ main, toolbar, chat, settings }: RouterProps) {
  const [route, setRoute] = useState<Route>(getRouteFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  switch (route) {
    case "toolbar":
      return <>{toolbar}</>;
    case "chat":
      return <>{chat}</>;
    case "settings":
      return settings ? <>{settings}</> : <>{main}</>;
    default:
      return <>{main}</>;
  }
}
