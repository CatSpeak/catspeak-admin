import { axiosClient, getResponseData } from "../../../lib/axios";
import type {
  CreateRoomPayload,
  EditRoomPayload,
  GetRoomsResponse,
  RoomFilters,
  RoomStatisticsDto,
} from "../types";

export const getRoomStats = async (): Promise<RoomStatisticsDto> => {
  return getResponseData(
    axiosClient.get<RoomStatisticsDto>("/admin/rooms/statistics"),
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
    axiosClient.get<GetRoomsResponse>("/admin/rooms", { params }),
  );
};

export const deleteRoom = async (id: number): Promise<void> => {
  await axiosClient.delete(`/admin/rooms/${id}`);
};

export const createRoom = async (data: FormData | CreateRoomPayload): Promise<void> => {
  let formData: FormData;
  if (data instanceof FormData) {
    formData = data;
  } else {
    formData = new FormData();
    formData.append("Name", data.name);
    formData.append("RoomType", data.roomType);
    formData.append("LanguageType", data.languageType);
    if (data.requiredLevel) formData.append("RequiredLevel", data.requiredLevel);
    if (data.topics && data.topics.length > 0) {
      data.topics.forEach((t) => formData.append("Topics", t));
    }
    if (data.description) formData.append("Description", data.description);
    formData.append("Privacy", data.privacy);
    if (data.privacy === "Private" && data.password) {
      formData.append("Password", data.password);
    }
    if (data.thumbnail) {
      formData.append("Thumbnail", data.thumbnail);
    }
  }

  await axiosClient.post("/admin/rooms/persistent", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const editRoom = async (
  id: number,
  data: FormData | EditRoomPayload,
): Promise<void> => {
  let formData: FormData;
  if (data instanceof FormData) {
    formData = data;
  } else {
    formData = new FormData();
    formData.append("Name", data.name);
    formData.append("Privacy", data.privacy);
    if (data.requiredLevel) formData.append("RequiredLevel", data.requiredLevel);
    if (data.description) formData.append("Description", data.description);
    if (data.topics && data.topics.length > 0) {
      data.topics.forEach((t) => formData.append("Topics", t));
    }
    if (data.password) formData.append("Password", data.password);
  }

  await axiosClient.put(`/admin/rooms/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
