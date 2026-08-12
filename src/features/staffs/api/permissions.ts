import { axiosClient } from "../../../lib/axios";

export interface ResourceDomain {
  code: string;
  name: string;
  description: string;
}

export interface StaffPermissions {
  accountId: number;
  email: string;
  username: string;
  roleId: number;
  roleName: string;
  permissions: string[];
}

export const getAllAvailablePermissions = async (): Promise<ResourceDomain[]> => {
  const res = await axiosClient.get<ResourceDomain[]>("/v1/permissions");
  return res.data;
};

export const getStaffPermissions = async (staffId: number): Promise<StaffPermissions> => {
  const res = await axiosClient.get<StaffPermissions>(`/v1/staffs/${staffId}/permissions`);
  return res.data;
};

export const updateStaffPermissions = async (
  staffId: number,
  permissions: string[]
): Promise<StaffPermissions> => {
  const res = await axiosClient.put<StaffPermissions>(`/v1/staffs/${staffId}/permissions`, {
    permissions,
  });
  return res.data;
};

export const promoteUserToStaff = async (userId: number): Promise<{ message: string }> => {
  const res = await axiosClient.post<{ message: string }>(`/v1/users/${userId}/promote-to-staff`);
  return res.data;
};

export const demoteStaffToUser = async (staffId: number): Promise<{ message: string }> => {
  const res = await axiosClient.post<{ message: string }>(`/v1/staffs/${staffId}/demote-to-user`);
  return res.data;
};
