import React from "react";
import { UserPermissions } from "../permissionManager/permission-manager";
import { AuthType } from "../types/auth-types";

const initialState = {
  user: {},
  login: () => {},
  logout: () => {},
  permission: {} as UserPermissions,
};

const AuthContext = React.createContext<AuthType>(initialState);

export default AuthContext;
