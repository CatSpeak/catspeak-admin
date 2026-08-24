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
    default:
      return bugT.categoryOther || "Khác"
  }
}
