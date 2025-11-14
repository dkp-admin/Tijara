import { createContext } from "react";

type PermissionContextType = {
  permissions: any;
  tabChange: any;
};

const initialState = {
  permissions: {},
  tabChange: () => {},
};

export const PermissionContext =
  createContext<PermissionContextType>(initialState);
