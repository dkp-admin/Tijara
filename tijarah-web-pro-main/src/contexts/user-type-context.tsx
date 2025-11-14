import { ReactNode, createContext, useEffect, useState } from "react";
import { LOCALSTORAGE_USER_TYPE_KEY } from "../config";
import { useAuth } from "../hooks/use-auth";
// import PropTypes from 'prop-types';

export type UserType = "app:super-admin" | "app:admin";

interface UserTypeProviderProps {
  children: ReactNode;
}

const defaultValue = {
  userType: "",
  setUserType: (x: any) => {
    console.log(x);
  },
};

type UserTypeContext = {
  userType: UserType | string;
  setUserType: (userType: UserType) => void;
};

export const UserTypeContext = createContext<UserTypeContext>(defaultValue);

export const UserTypeProvider: React.FC<UserTypeProviderProps> = (props) => {
  const { children } = props;
  const appState = useAuth();
  const [userType, setUserType] = useState<UserType>();

  useEffect(() => {
    if (userType) {
      localStorage.setItem(LOCALSTORAGE_USER_TYPE_KEY, userType);
    }
  }, [userType]);

  useEffect(() => {
    const userTypeStored = localStorage.getItem(
      LOCALSTORAGE_USER_TYPE_KEY
    ) as UserType;
    if (userTypeStored) {
      setUserType(userTypeStored);
    }
  }, [appState.isAuthenticated]);

  const contextValue = {
    userType,
    setUserType,
  };

  return (
    <UserTypeContext.Provider value={contextValue}>
      {children}
    </UserTypeContext.Provider>
  );
};

// UserTypeProvider.propTypes = {
//   children: PropTypes.node.isRequired
// };

// export const AuthConsumer = UserTypeContext.Consumer;
