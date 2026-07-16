import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetRoomsResponse, RoomFilters, RoomStatisticsDto } from "../types";

export const getRoomStats = async (): Promise<RoomStatisticsDto> => {
  return getResponseData(
    axiosClient.get<RoomStatisticsDto>("/api/Admin/rooms/statistics"),
  );
};

export const getRooms = async (
  page: number = 1,
  pageSize: number = 10,
  filters?: Partial<RoomFilters>,
): Promise<GetRoomsResponse> => {
  const params: Record<string, unknown> = { page, pageSize };

  if (filters?.roomTypes?.length) params.roomTypes = filters.roomTypes;
  if (filters?.languageTypes?.length) params.languageTypes = filters.languageTypes;
  if (filters?.requiredLevels?.length) params.requiredLevels = filters.requiredLevels;
  if (filters?.categories?.length) params.categories = filters.categories;
  if (filters?.topics?.length) params.topics = filters.topics;
  if (filters?.roomName) params.roomName = filters.roomName;

  return getResponseData(
    axiosClient.get<GetRoomsResponse>("/api/rooms/rooms", { params }),
  );
};

export const deleteRoom = async (id: number): Promise<void> => {
  await axiosClient.delete(`/api/rooms/${id}`);
};

export const createRoom = async (formData: FormData): Promise<void> => {
  await axiosClient.post("/api/rooms/persistent", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const editRoom = async (id: number, formData: FormData): Promise<void> => {
  await axiosClient.put(`/api/rooms/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
