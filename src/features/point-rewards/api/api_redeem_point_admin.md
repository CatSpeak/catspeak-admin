# ĐẶC TẢ API QUẢN LÝ ĐỔI ĐIỂM (POINT REDEMPTION) - DÀNH CHO FRONTEND

> **Phiên bản API**: v1.0  
> **Base URL**: `https://<api-domain>/api/admin/point-redemptions`  
> **Authentication**: Bearer Token (JWT Header)  
> **Yêu cầu Quyền (Roles)**: `Admin`, `SuperAdmin`  

---

## I. TỔNG QUAN HỆ THỐNG & CÁC LƯU Ý CHO FE

### 1. Headers chung
Tất cả các request API (ngoại trừ API xuất Excel/PDF) đều cần gửi các Header sau:
```http
Authorization: Bearer <token_admin>
Content-Type: application/json
```

### 2. Định dạng ngày tháng
- Tất cả các trường thời gian (`DateTime`) nhận vào và trả về đều theo chuẩn ISO-8601: `YYYY-MM-DDTHH:mm:ssZ` (UTC).
- FE tự chuyển đổi hiển thị theo múi giờ địa phương của User (GMT+7).

### 3. Cấu trúc Phân trang chung (`PagedResult<T>`)
Đối với các API lấy danh sách có phân trang, cấu trúc Response trả về như sau:
```json
{
  "total_records": 45,
  "page": 1,
  "pageSize": 10,
  "data": [ ... ],
  "additionalData": {
    "currentPage": 1,
    "pageSize": 10,
    "totalCount": 45,
    "totalPages": 5,
    "summary": null
  }
}
```

### 4. Danh sách Enums & Trạng thái

#### Trạng thái Mục Đổi Điểm (`PointRedemptionItemDto.Status`)
| Giá trị | Ý nghĩa | Gợi ý UI Badge |
| :--- | :--- | :--- |
| `Active` | Đang hoạt động, khả dụng để đổi | Badge Xanh lá (Success) |
| `Paused` | Đã bị Admin tạm dừng | Badge Vàng/Xám (Warning) |
| `Expired` | Đã hết hạn (`ValidTo < Now`) | Badge Đỏ/Xám (Danger) |
| `Exhausted` | Đã hết số lượng (`RedeemedCount >= TotalQuantity`) | Badge Đỏ/Xám (Danger) |
| `Pending` | Chưa đến ngày hiệu lực (`ValidFrom > Now`) | Badge Trắng/Lam (Info) |

#### Trạng thái Giao dịch (`PointRedemptionHistoryDto.Status`)
| Giá trị | Ý nghĩa | Gợi ý UI Badge |
| :--- | :--- | :--- |
| `Success` | Đổi điểm thành công | Badge Xanh lá |
| `Failed` | Đổi điểm thất bại (có lý do kèm theo) | Badge Đỏ |

---

## II. DANH SÁCH ENDPOINTS CHI TIẾT

---

### 1. Thẻ Thống kê Tab Danh mục
*Lấy tổng quan 4 chỉ số hiển thị phía trên Bảng danh mục mục đổi điểm.*

- **Endpoint**: `GET /api/admin/point-redemptions/summary`
- **Request Body**: Không có
- **Response `200 OK`**:
```json
{
  "totalItems": 12,
  "activeItems": 8,
  "pausedItems": 2,
  "totalPointsRedeemed": 15000
}
```
- **Mô tả các trường**:
  - `totalItems`: Tổng số mục đổi điểm chưa bị xóa.
  - `activeItems`: Số mục đang hoạt động (`Active`).
  - `pausedItems`: Số mục đang tạm dừng (`Paused`).
  - `totalPointsRedeemed`: Tổng điểm đã đổi thành công.

---

### 2. Danh sách Voucher Hợp lệ (Cho Dropdown Tạo mới)
*Lấy danh sách các Voucher do CatSpeak tài trợ chưa gắn với mục đổi điểm active nào để hiển thị trong Dropdown khi Tạo mục đổi điểm.*

- **Endpoint**: `GET /api/admin/point-redemptions/eligible-vouchers`
- **Request Body**: Không có
- **Response `200 OK`**:
```json
[
  {
    "id": 5,
    "name": "Voucher Giảm 20% Khóa Tiếng Anh Giao Tiếp",
    "applicableCourses": [
      {
        "courseId": 101,
        "courseName": "Tiếng Anh Giao Tiếp Cơ Bản"
      },
      {
        "courseId": 102,
        "courseName": "Tiếng Anh Giao Tiếp Nâng Cao"
      }
    ]
  }
]
```
- **Lưu ý cho FE**:
  - Khi người dùng chọn Voucher trong Dropdown modal "Tạo Mục Đổi Điểm", FE kiểm tra mảng `applicableCourses`:
    - Nếu `applicableCourses` có nhiều khóa học, cho phép chọn 1 khóa học cụ thể (`courseId`) hoặc để trống (Áp dụng tất cả khóa học của voucher).
    - Nếu `applicableCourses` rỗng, khóa học `courseId` sẽ gửi `null`.

---

### 3. Tạo Mục Đổi Điểm Mới
*Tạo mới 1 phần thưởng đổi điểm từ Voucher hợp lệ.*

- **Endpoint**: `POST /api/admin/point-redemptions`
- **Request Body**:
```json
{
  "voucherId": 5,
  "courseId": 101,
  "pointsRequired": 500,
  "totalQuantity": 100,
  "limitPerUser": 1,
  "validFrom": "2026-10-01T00:00:00Z",
  "validTo": "2026-12-31T23:59:59Z"
}
```
- **Quy tắc Validation (FE & BE)**:
  - `voucherId` (bắt buộc, `int > 0`): ID của Voucher được cấp từ API eligible-vouchers.
  - `courseId` (tùy chọn, `int?`): Khóa học áp dụng.
  - `pointsRequired` (bắt buộc, `int > 0`): Số điểm cần để đổi.
  - `totalQuantity` (tùy chọn, `int? >= 1` hoặc `null` nếu không giới hạn).
  - `limitPerUser` (bắt buộc, `int >= 1`, mặc định `1`).
  - `validFrom` (bắt buộc, UTC DateTime string).
  - `validTo` (tùy chọn, nếu có phải lớn hơn `validFrom`).
- **Response `200 OK`**: `PointRedemptionItemDto` (Xem cấu trúc ở API 7).
- **Lỗi phổ biến**:
  - `400 Bad Request`: "Voucher must be sponsored by CatSpeak" (Voucher không phải CatSpeak tài trợ).
  - `400 Bad Request`: "Voucher is already linked to an active point redemption item" (Voucher đã được liên kết).

---

### 4. Cập nhật Mục Đổi Điểm
*Sửa thông tin mục đổi điểm (VoucherId không được thay đổi).*

- **Endpoint**: `PUT /api/admin/point-redemptions/{id}`
- **Path Parameter**: `id` (`int`) - ID mục đổi điểm.
- **Request Body**:
```json
{
  "courseId": 101,
  "pointsRequired": 600,
  "totalQuantity": 150,
  "limitPerUser": 2,
  "validFrom": "2026-10-01T00:00:00Z",
  "validTo": "2026-12-31T23:59:59Z"
}
```
- **Validation**: `totalQuantity` (nếu có) không được nhỏ hơn số lượng đã đổi (`redeemedCount`).
- **Response `200 OK`**: `PointRedemptionItemDto`.

---

### 5. Tạm dừng Mục Đổi Điểm
*Chuyển trạng thái sang Tạm dừng (`IsPaused = true`).*

- **Endpoint**: `PATCH /api/admin/point-redemptions/{id}/pause`
- **Path Parameter**: `id` (`int`)
- **Request Body**: Không có
- **Response `200 OK`**: `PointRedemptionItemDto` (Với `isPaused = true`, `status = "Paused"`).

---

### 6. Kích hoạt lại Mục Đổi Điểm
*Bỏ tạm dừng, khôi phục trạng thái hoạt động (`IsPaused = false`).*

- **Endpoint**: `PATCH /api/admin/point-redemptions/{id}/activate`
- **Path Parameter**: `id` (`int`)
- **Request Body**: Không có
- **Response `200 OK`**: `PointRedemptionItemDto` (Với `isPaused = false`).

---

### 7. Danh sách Các Mục Đổi Điểm (Tab Danh mục)
*Lấy danh sách phân trang các mục đổi điểm với bộ lọc.*

- **Endpoint**: `GET /api/admin/point-redemptions`
- **Query Parameters**:
  - `keyword` (`string?`): Tìm kiếm theo tên Voucher.
  - `status` (`string?`): Bộ lọc trạng thái (`Active`, `Paused`, `Expired`, `Exhausted`, `All`). Mặc định `All`.
  - `page` (`int`): Trang hiện tại (mặc định `1`).
  - `pageSize` (`int`): Số mục trên trang (mặc định `10`).
- **Response `200 OK`**:
```json
{
  "total_records": 1,
  "page": 1,
  "pageSize": 10,
  "data": [
    {
      "id": 1,
      "voucherName": "Voucher Giảm 20% Khóa Tiếng Anh",
      "courseId": 101,
      "pointsRequired": 500,
      "totalQuantity": 100,
      "redeemedCount": 25,
      "limitPerUser": 1,
      "validFrom": "2026-10-01T00:00:00Z",
      "validTo": "2026-12-31T23:59:59Z",
      "isPaused": false,
      "status": "Active"
    }
  ],
  "additionalData": {
    "currentPage": 1,
    "pageSize": 10,
    "totalCount": 1,
    "totalPages": 1,
    "summary": null
  }
}
```

---

### 8. Danh sách Lịch sử Giao dịch (Tab Lịch sử)
*Lấy danh sách các giao dịch đổi điểm của học viên.*

- **Endpoint**: `GET /api/admin/point-redemptions/history`
- **Query Parameters**:
  - `keyword` (`string?`): Tìm kiếm theo tên học viên, email học viên, hoặc Mã giao dịch (`TXN-YYYYMMDD-XXX`).
  - `itemId` (`int?`): Lọc theo ID mục đổi điểm cụ thể.
  - `fromDate` (`string?` ISO Date): Từ ngày.
  - `toDate` (`string?` ISO Date): Đến ngày.
  - `page` (`int`): Mặc định `1`.
  - `pageSize` (`int`): Mặc định `10`.
- **Response `200 OK`**:
```json
{
  "total_records": 1,
  "page": 1,
  "pageSize": 10,
  "data": [
    {
      "id": 10,
      "transactionCode": "TXN-20260929-001",
      "studentName": "Nguyen Van A",
      "studentEmail": "nguyenvana@gmail.com",
      "studentAvatar": "https://cdn.catspeak.com/avatars/user10.png",
      "voucherName": "Voucher Giảm 20% Khóa Tiếng Anh",
      "pointsDeducted": 500,
      "resultCode": "CAT-ABC12345",
      "status": "Success",
      "createdAt": "2026-09-29T08:30:00Z",
      "completedAt": "2026-09-29T08:30:05Z",
      "failedReason": null
    }
  ],
  "additionalData": {
    "currentPage": 1,
    "pageSize": 10,
    "totalCount": 1,
    "totalPages": 1,
    "summary": null
  }
}
```

---

### 9. Chi tiết Giao dịch Đổi điểm (Drawer / Modal Detail)
*Xem thông tin chi tiết của 1 giao dịch đổi điểm.*

- **Endpoint**: `GET /api/admin/point-redemptions/history/{id}`
- **Path Parameter**: `id` (`int`) - ID giao dịch.
- **Response `200 OK`**:
```json
{
  "id": 10,
  "transactionCode": "TXN-20260929-001",
  "studentName": "Nguyen Van A",
  "studentEmail": "nguyenvana@gmail.com",
  "studentAvatar": "https://cdn.catspeak.com/avatars/user10.png",
  "voucherName": "Voucher Giảm 20% Khóa Tiếng Anh",
  "pointsLabel": "Điểm giao dịch",
  "pointsDeducted": 500,
  "resultCode": "CAT-ABC12345",
  "status": "Success",
  "createdAt": "2026-09-29T08:30:00Z",
  "completedAt": "2026-09-29T08:30:05Z",
  "failedReason": null
}
```
- **Lưu ý giao diện cho FE (BR-DD-14)**:
  - Nếu `status == "Success"`:
    - `pointsLabel`: "Điểm giao dịch"
    - `resultCode`: Hiển thị mã Voucher phát hành (`CAT-XXXXX`).
    - Khối "Lý do thất bại" (`failedReason`): **Ẩn**.
  - Nếu `status == "Failed"`:
    - `pointsLabel`: "Điểm dự kiến"
    - `resultCode`: N/A hoặc thông tin báo lỗi ngắn.
    - Khối "Lý do thất bại": **Hiện** nội dung `failedReason`.

---

### 10. Báo cáo & Thống kê Hiệu quả (Tab Báo cáo)
*Lấy dữ liệu các thẻ chỉ số KPI, biểu đồ xu hướng, biểu đồ độ ưa chuộng và bảng chi tiết phần thưởng.*

- **Endpoint**: `GET /api/admin/point-redemptions/reports`
- **Query Parameter**:
  - `period` (`string`): Khung thời gian thống kê. Các giá trị hợp lệ:
    - `ThisWeek`: Tuần này (So sánh với tuần trước).
    - `ThisMonth`: Tháng này (Mặc định - So sánh với tháng trước).
    - `LastMonth`: Tháng trước (So sánh với tháng trước đó nữa).
    - `Custom`: Tùy chỉnh (So sánh với khoảng thời gian tương đương phía trước).
- **Response `200 OK`**:
```json
{
  "totalRedemptions": 120,
  "totalRedemptionsChangePercent": 15.4,
  "totalPointsSpent": 60000,
  "totalPointsSpentChangePercent": -2.5,
  "uniqueUsersCount": 85,
  "remainingInventory": 450,
  "lowStockItemsCount": 3,
  "redemptionsOverTime": [
    { "label": "Tuần 1", "value": 20 },
    { "label": "Tuần 2", "value": 35 },
    { "label": "Tuần 3", "value": 40 },
    { "label": "Tuần 4", "value": 25 }
  ],
  "popularRewards": [
    { "label": "Voucher Giảm 20%", "value": 50 },
    { "label": "Voucher Giảm 50k", "value": 30 }
  ],
  "rewardDetails": [
    {
      "itemId": 1,
      "voucherName": "Voucher Giảm 20% Khóa Tiếng Anh",
      "pointsRequired": 500,
      "redemptionsThisPeriod": 50,
      "redemptionsPrevPeriod": 40,
      "totalPointsSpent": 25000,
      "remainingInventory": 50,
      "trend": "Tăng"
    }
  ]
}
```
- **Lưu ý giao diện cho FE**:
  - `totalRedemptionsChangePercent` & `totalPointsSpentChangePercent`: Nếu giá trị `> 0` hiển thị icon Tăng màu xanh, nếu `< 0` hiển thị icon Giảm màu đỏ.
  - `lowStockItemsCount`: Hiển thị cảnh báo số lượng phần thưởng sắp hết hàng (< 10%).

---

### 11. Xuất Excel Lịch sử Giao dịch
*Tải xuống file Excel chứa danh sách lịch sử giao dịch.*

- **Endpoint**: `GET /api/admin/point-redemptions/history/export-excel`
- **Query Parameters**: Cùng các tham số filter với API 8 (`keyword`, `itemId`, `fromDate`, `toDate`).
- **Response**: File nhị phân Excel (`Blob`)
  - **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - **Filename mặc định**: `History.xlsx`
- **Cách FE xử lý download**:
```javascript
const response = await fetch('/api/admin/point-redemptions/history/export-excel?...', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'LichSuDoiDiem.xlsx';
a.click();
```

---

### 12. Xuất PDF Báo cáo Thống kê
*Tải xuống bản in PDF báo cáo hiệu quả đổi điểm.*

- **Endpoint**: `GET /api/admin/point-redemptions/reports/export-pdf`
- **Query Parameter**: `period` (`ThisWeek`, `ThisMonth`, `LastMonth`, `Custom`)
- **Response**: File nhị phân PDF (`Blob`)
  - **Content-Type**: `application/pdf`
  - **Filename mặc định**: `Report.pdf`
- **Cách FE xử lý download**: Tương tự như xuất file Excel ở trên.

---

## III. TỔNG HỢP MÃ LỖI (HTTP STATUS CODES)

| Code | Ý nghĩa | Xử lý khuyến nghị trên FE |
| :--- | :--- | :--- |
| `200 OK` | Thành công | Hiển thị dữ liệu / Báo thành công (Toast notification) |
| `400 Bad Request` | Dữ liệu gửi lên sai định dạng hoặc vi phạm quy tắc nghiệp vụ | Hiển thị thông báo lỗi từ message trả về của BE |
| `401 Unauthorized` | Chuyện hết hạn Token hoặc chưa đăng nhập | Redirect về trang Login |
| `403 Forbidden` | Tài khoản không có quyền Admin/SuperAdmin | Hiển thị trang 403 No Permission |
| `404 Not Found` | Không tìm thấy ID mục đổi điểm hoặc giao dịch | Báo lỗi Không tìm thấy bản ghi |
| `500 Internal Server Error` | Lỗi server hệ thống | Thông báo "Có lỗi xảy ra, vui lòng thử lại sau" |
