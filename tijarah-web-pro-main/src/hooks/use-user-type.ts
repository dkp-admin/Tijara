import { useContext } from "react";
import { UserTypeContext } from "../contexts/user-type-context";

export const useUserType = () => useContext(UserTypeContext);
