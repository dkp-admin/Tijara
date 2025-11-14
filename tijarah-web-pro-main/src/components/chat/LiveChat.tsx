import React from "react";
import { useEffect } from "react";
import injectTawk from "./injectTawk";

function shouldHideWidgets(route: string) {
  return route === "/";
}

export const LiveChat = ({
  name,
  email,
  route,
}: {
  name: string;
  email: string;
  route: string;
}) => {
  useEffect(() => {
    injectTawk(
      { name, email: `${email}@customers.rol.mv` },
      "https://embed.tawk.to/65730c5607843602b8ffb428/1hh4mgd0c"
    );
  }, []);

  useEffect(() => {
    if (shouldHideWidgets(route)) {
      // @ts-ignore
      window.Tawk_API?.hideWidget?.();
    } else {
      // @ts-ignore
      window.Tawk_API?.showWidget?.();
    }
  }, [route]);

  return <></>;
};
