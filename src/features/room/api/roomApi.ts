import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetRoomsResponse, RoomFilters } from "../types";

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
    axiosClient.get<GetRoomsResponse>("/rooms", { params }),
  );
};

export const deleteRoom = async (id: number): Promise<void> => {
  await axiosClient.delete(`/rooms/${id}`);
};

export const createRoom = async (formData: FormData): Promise<void> => {
  await axiosClient.post("/rooms/persistent", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
