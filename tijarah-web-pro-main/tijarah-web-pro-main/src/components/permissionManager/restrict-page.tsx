import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import NotFound from "src/pages/404";

function withPermission(
  WrappedComponent: React.ElementType,
  permission: string
) {
  return (props: any) => {
    const permissionManager = usePermissionManager();

    if (!permission) {
      return <NotFound />;
    }

    const screen = permission.split(":")[0];
    const adminPermission = screen + ":manage";
    if (
      permissionManager(permission as any) ||
      permissionManager(adminPermission as any)
    ) {
      return <WrappedComponent {...props} />;
    } else {
      return <NotFound />;
    }
  };
}

export default withPermission;
