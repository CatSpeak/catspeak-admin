import { axiosClient, getResponseData } from "../../../lib/axios";
import type { StaffDetail } from "../types";

export const getStaffDetail = async (staffId: number): Promise<StaffDetail> => {
    return getResponseData(axiosClient.get<StaffDetail>(`/admin/staff/${staffId}`));
};
