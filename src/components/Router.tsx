import { useEffect, useState } from "react";

type Route = "main" | "toolbar" | "chat";

function getRouteFromHash(): Route {
  const hash = window.location.hash.replace("#/", "");
  if (hash === "toolbar") return "toolbar";
  if (hash === "chat") return "chat";
  return "main";
}

interface RouterProps {
  main: React.ReactNode;
  toolbar: React.ReactNode;
  chat: React.ReactNode;
}

export function Router({ main, toolbar, chat }: RouterProps) {
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
    default:
      return <>{main}</>;
  }
}
