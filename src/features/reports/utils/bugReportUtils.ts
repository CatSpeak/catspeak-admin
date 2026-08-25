/**
 * Helper utility to map bug report category code to localized label
 */
export const getCategoryLabel = (
  category: string | undefined,
  bugT: any = {}
): string => {
  switch (category?.toLowerCase()) {
    case "ui_issue":
      return bugT.categoryUi || "Giao diện / Hiển thị"
    case "api_error":
      return bugT.categoryApi || "Lỗi kết nối / Tải dữ liệu"
    case "video_audio":
      return bugT.categoryVideo || "Video Call / Âm thanh"
    case "payment":
      return bugT.categoryPayment || "Thanh toán / Giao dịch"
    case "course_exam":
      return bugT.categoryCourse || "Khóa học / Bài tập"
    case "system_auto":
      return bugT.categorySystemAuto || "Hệ thống tự động phát hiện"
    default:
      return bugT.categoryOther || "Khác"
  }
}

/**
 * Get distinct styling class for category badges
 */
export const getCategoryBadgeClass = (category: string | undefined): string => {
  switch (category?.toLowerCase()) {
    case "system_auto":
      return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/50"
    case "api_error":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50"
    case "payment":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50"
    case "video_audio":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50"
    case "ui_issue":
      return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700/50"
    case "course_exam":
      return "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700/50"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
  }
}

/**
 * Get display name for reporter.
 * If report category is system_auto and no username, display 'Hệ thống' (System).
 */
export const getReporterName = (
  report: { username?: string | null; category?: string | null },
  bugT: any = {}
): string => {
  if (report?.category === "system_auto") {
    return report.username || bugT.systemReporter || "Hệ thống"
  }
  return report?.username || bugT.anonymousUser || "Khách vãng lai"
}
