import { useMutation } from "react-query";
import serviceCaller from "src/api/serviceCaller";

export function usePreferredLanguage() {
  const updateMutation = useMutation<any, any, any>(
    "preferred-language",
    async (data: any) => {
      return serviceCaller("/user/:id/preferred-language", {
        method: "PATCH",
        body: { ...data.body },
        params: { ...data.params },
      });
    }
  );

  function updateLanguage(payload: any) {
    return updateMutation.mutateAsync({ ...payload });
  }

  return {
    updateLanguage,
  };
}
