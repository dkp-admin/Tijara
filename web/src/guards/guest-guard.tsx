import PropTypes from "prop-types";
import type { FC, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "src/hooks/use-auth";
import { useRouter } from "src/hooks/use-router";
import { useSubscription } from "src/hooks/use-subscription";
import { tijarahPaths } from "src/paths";
import { isSubscriptionValid } from "src/utils/isSubscriptionValid";

interface GuestGuardProps {
  children: ReactNode;
}

export const GuestGuard: FC<GuestGuardProps> = (props) => {
  const { children } = props;
  const { isAuthenticated }: any = useAuth();
  const subscription = useSubscription();

  const router = useRouter();
  const [checked, setChecked] = useState<boolean>(false);

  const check = useCallback(() => {
    if (isAuthenticated) {
      router.replace(
        subscription && isSubscriptionValid(subscription?.subscriptionEndDate)
          ? tijarahPaths.dashboard.salesDashboard
          : tijarahPaths?.authentication?.logout
      );
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, router]);

  // Only check on mount, this allows us to redirect the user manually when auth state changes
  useEffect(
    () => {
      check();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (!checked) {
    return null;
  }

  // If got here, it means that the redirect did not occur, and that tells us that the user is
  // not authenticated / authorized.

  return <>{children}</>;
};

GuestGuard.propTypes = {
  children: PropTypes.node,
};
