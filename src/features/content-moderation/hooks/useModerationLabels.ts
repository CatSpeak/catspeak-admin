import { useMemo } from "react"
import { useLanguage } from "../../../stores/languageStore"
import type { PlaceKey } from "../utils/moderation"

type Dict = Record<string, string>

const pick = (dict: unknown, key: string | null | undefined, fallback?: string): string => {
  if (!key) return fallback ?? "—"
  return (dict as Dict)[key] ?? fallback ?? key
}

/** Tên hiển thị cho các mã mà API trả về; mã lạ thì hiện nguyên mã. */
export function useModerationLabels() {
  const { t } = useLanguage()
  const m = t.contentModeration

  return useMemo(
    () => ({
      m,
      place: (key: PlaceKey) => m.places[key],
      context: (context: string) => pick(m.contexts, context),
      status: (status: string) => pick(m.statuses, status),
      userAction: (action?: string | null) => pick(m.userActions, action ?? "none"),
      aiAction: (action: string) => pick(m.actions, action),
      kind: (kind: string) => pick(m.kinds, kind),
      label: (label?: string | null) => (label ? `${label} · ${pick(m.labels, label, label)}` : "—"),
      targetType: (type?: string | null) => pick(m.targetTypes, type),
      reelStatus: (status?: string | null) => pick(m.reelStatuses, status),
      accountStatus: (status?: number | null) =>
        status === 3 ? m.accountBlocked : status === 2 ? m.accountInactive : m.accountActive,
    }),
    [m],
  )
}
