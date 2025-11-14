import React, { ComponentType } from "react";
import { Layout as DashboardLayout } from "src/layouts/dashboard";

function withDashboardLayout(Component: React.ElementType) {
  return (props: any) => {
    return (
      <DashboardLayout>
        <Component {...props} />
      </DashboardLayout>
    );
  };
}

export default withDashboardLayout;
