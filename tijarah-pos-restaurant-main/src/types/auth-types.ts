import { UserPermissions } from "../permissionManager/permission-manager";

export type AuthType = {
  user: any;
  login: any;
  logout: any;
  permission: UserPermissions;
};
