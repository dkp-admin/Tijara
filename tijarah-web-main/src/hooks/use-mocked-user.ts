import { useAuth } from "./use-auth";

export const useMockedUser = (): any => {
  // To get the user from the authContext, you can use
  const { user } = useAuth();
  // return {
  //   id: "5e86809283e28b96d2d38537",
  //   avatar: "/assets/avatars/avatar-anika-visser.png",
  //   name: "Tijarah Admin",
  //   email: "anika.visser@devias.io",
  // };
};
