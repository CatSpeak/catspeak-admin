import { axiosClient, getResponseData } from "../../../lib/axios";
import type {
  EventCountsResponse,
  EventsByDateResponse,
  EventDetail,
} from "../types";

const V1 = "/v1/events";

/** GET /api/v1/events/counts?startDate=&endDate= */
export const getEventCounts = (
  startDate: string,
  endDate: string,
): Promise<EventCountsResponse> =>
  getResponseData(
    axiosClient.get<EventCountsResponse>(`${V1}/counts`, {
      params: { startDate, endDate },
    }),
  );

/** GET /api/v1/events/by-date?date= */
export const getEventsByDate = (date: string): Promise<EventsByDateResponse> =>
  getResponseData(
    axiosClient.get<EventsByDateResponse>(`${V1}/by-date`, {
      params: { date },
    }),
  );

/** GET /api/v1/events/{eventId} */
export const getEventDetail = (eventId: number): Promise<EventDetail> =>
  getResponseData(axiosClient.get<EventDetail>(`${V1}/${eventId}`));

/** DELETE /api/v1/events/{eventId} */
export const deleteEvent = (eventId: number): Promise<void> =>
  axiosClient.delete(`${V1}/${eventId}`).then(() => undefined);
