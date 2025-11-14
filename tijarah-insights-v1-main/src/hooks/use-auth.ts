import { useContext } from "react";
import { AuthContext } from "../context/jwt-context";

export const useAuth = () => useContext(AuthContext);
