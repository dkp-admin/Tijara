import { useCallback, useEffect } from "react";
import type { AuthContextType } from "src/contexts/auth/auth0-context";
import { GuestGuard } from "src/guards/guest-guard";
import { IssuerGuard } from "src/guards/issuer-guard";
import { useAuth } from "src/hooks/use-auth";
import { paths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import { Issuer } from "src/utils/auth";

const Page: PageType = () => {
  // const { loginWithRedirect } = useAuth<AuthContextType>();

  const handle = useCallback(async () => {
    // const searchParams = new URLSearchParams(window.location.search);
    // const returnTo = searchParams.get('returnTo');
    // await loginWithRedirect({
    //   returnTo: returnTo || paths.dashboard.index
    // });
  }, []);

  useEffect(
    () => {
      handle();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return null;
};

Page.getLayout = (page) => (
  <IssuerGuard issuer={Issuer.Auth0}>
    <GuestGuard>{page}</GuestGuard>
  </IssuerGuard>
);

export default Page;
