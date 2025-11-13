import { useContext } from "react";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import { useAuth } from "./use-auth";

export function useGlobalProduct() {
  const { user } = useAuth();

  async function isAlreadyImported(id: any) {
    return serviceCaller(endpoint.isAlreadyImported.path, {
      method: endpoint.isAlreadyImported.method,
      query: {
        _id: id,
        companyRef: user.company?._id,
      },
    });
  }

  return {
    isAlreadyImported,
  };
}
