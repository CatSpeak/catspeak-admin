import { axiosClient, getResponseData } from "../../../lib/axios"
import type {
  BulkConfirmResponse,
  DecisionRequest,
  DecisionResponse,
  ModerationLogDetail,
  ModerationLogItem,
  ModerationLogPage,
  ModerationLogQuery,
  ModerationStats,
  ModerationUserHistory,
} from "../types"

const BASE = "/content-moderation"

export const getModerationLogs = (query: ModerationLogQuery) =>
  getResponseData<ModerationLogPage>(
    axiosClient.get(`${BASE}/logs`, {
      params: {
        ...query,
        q: query.q?.trim() || undefined,
        context: query.context?.length ? query.context : undefined,
      },
    }),
  )

export const getModerationLog = (id: number) =>
  getResponseData<ModerationLogDetail>(axiosClient.get(`${BASE}/logs/${id}`))

/** Nguyên văn một ca riêng tư. Mỗi lần gọi đều được ghi lại phía server. */
export const revealModerationLog = (id: number, reason?: string) =>
  getResponseData<ModerationLogItem>(
    axiosClient.post(`${BASE}/logs/${id}/reveal`, { reason: reason?.trim() || null }),
  )

export const decideModerationLog = (id: number, body: DecisionRequest) =>
  getResponseData<DecisionResponse>(axiosClient.post(`${BASE}/logs/${id}/decision`, body))

export const bulkConfirmModerationLogs = (ids: number[], note?: string) =>
  getResponseData<BulkConfirmResponse>(
    axiosClient.post(`${BASE}/logs/bulk-confirm`, { ids, note: note?.trim() || null }),
  )

export const getModerationStats = (days = 7) =>
  getResponseData<ModerationStats>(axiosClient.get(`${BASE}/stats`, { params: { days } }))

export const getModerationUserHistory = (accountId: number, limit = 10) =>
  getResponseData<ModerationUserHistory>(
    axiosClient.get(`${BASE}/users/${accountId}/history`, { params: { limit } }),
  )
