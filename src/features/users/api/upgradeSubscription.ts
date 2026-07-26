import { axiosClient, getResponseData } from "../../../lib/axios";

export interface AccountSubscriptionUpdateDto {
  subscriptionId: number;
}

export const upgradeSubscription = async (
  id: number,
  dto: AccountSubscriptionUpdateDto,
): Promise<unknown> => {
  return getResponseData(
    axiosClient.put(`/Account/${id}/subscription/upgrade`, dto),
  );
};
