import { useMutation, useQueryClient } from "react-query";
import serviceCaller from "../api";

export function useMarkNotification() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation(
    `mark-notification`,
    async (data: any) => {
      return serviceCaller(`/notification/mark-read`, {
        method: "PUT",
        body: data,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("find-notification");
      },
    }
  );

  function markNotification(payload: any) {
    return updateMutation.mutateAsync({ ...payload });
  }

  return {
    markNotification,
  };
}
