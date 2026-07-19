import { axiosClient, getResponseData } from "../../../lib/axios";
import type {
  GetRoomsResponse,
  RoomFilters,
  RoomStatisticsDto,
} from "../types";

export const getRoomStats = async (): Promise<RoomStatisticsDto> => {
  return getResponseData(
    axiosClient.get<RoomStatisticsDto>("/Admin/rooms/statistics"),
  );
};

export const getRooms = async (
  page: number = 1,
  pageSize: number = 10,
  filters?: Partial<RoomFilters>,
): Promise<GetRoomsResponse> => {
  const params: Record<string, unknown> = { Page: page, PageSize: pageSize };

  if (filters?.roomName) params.RoomName = filters.roomName;
  if (filters?.hostName) params.HostName = filters.hostName;
  if (filters?.roomTypes?.length) params.RoomTypes = filters.roomTypes;
  if (filters?.statuses?.length) params.Statuses = filters.statuses;
  if (filters?.createdFrom) params.CreatedFrom = filters.createdFrom;
  if (filters?.createdTo) params.CreatedTo = filters.createdTo;
  if (filters?.sortBy) params.SortBy = filters.sortBy;
  if (filters?.sortOrder) params.SortOrder = filters.sortOrder;

  return getResponseData(
    axiosClient.get<GetRoomsResponse>("/Admin/rooms", { params }),
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

export const editRoom = async (
  id: number,
  formData: FormData,
): Promise<void> => {
  await axiosClient.put(`/rooms/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
