import { useMutation, useQueryClient } from "react-query";
import serviceCaller from "src/api/serviceCaller";

export function useMarkNotification() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation<any, any, any>(
    `mark-notification`,
    async (data) => {
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
