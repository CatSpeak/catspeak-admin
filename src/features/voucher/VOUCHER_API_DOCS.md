# API Documentation - Phân hệ Quản lý Voucher (Voucher Management System)

## 1. Tổng quan hệ thống

- **Base Route**: `/api/vouchers`
- **Authentication**: Bắt buộc gắn Header `Authorization: Bearer <token>` vào tất cả các request.
- **Phân quyền (RBAC)**:
  - **Admin**: Quản lý toàn bộ voucher trong hệ thống, bao gồm voucher do CatSpeak phát hành (nguồn `CatSpeak`) và voucher do Giảng viên phát hành (nguồn `Instructor` / Chủ lớp). Có quyền cấu hình voucher toàn sàn hoặc gán cho các khóa học/lớp học cụ thể.
  - **Instructor (Giảng viên)**: Chỉ xem và quản lý các voucher do chính mình tạo ra hoặc được chỉ định quản lý. Khi tạo mới voucher, nguồn tài trợ mặc định là `Instructor` (Giáo viên chịu 100% chi phí giảm giá và đặt cọc), và phạm vi áp dụng chỉ được chọn từ danh sách khóa học/lớp học thuộc quyền sở hữu của giảng viên đó.

---

## 2. Danh mục Enums (Data Types)

Hệ thống hỗ trợ serialize dạng String hoặc Number tương ứng:

### 2.1. DiscountType (Loại giảm giá)

| Giá trị (String) | Giá trị (Int) | Mô tả                               |
| :--------------- | :------------ | :---------------------------------- |
| `Percentage`     | `1`           | Giảm giá theo phần trăm (%)         |
| `FixedAmount`    | `2`           | Giảm giá theo số tiền cố định (VNĐ) |

### 2.2. VoucherSponsorType (Nguồn tài trợ)

| Giá trị (String) | Giá trị (Int) | Mô tả                                                                              |
| :--------------- | :------------ | :--------------------------------------------------------------------------------- |
| `CatSpeak`       | `1`           | Voucher do hệ thống / Sàn CatSpeak phát hành (sàn tài trợ 100%)                    |
| `Instructor`     | `2`           | Voucher do Giảng viên / Chủ lớp phát hành (giáo viên chịu 100% chi phí và nạp cọc) |

### 2.3. VoucherScopeType (Phạm vi áp dụng)

| Giá trị (String)  | Giá trị (Int) | Mô tả                                        |
| :---------------- | :------------ | :------------------------------------------- |
| `All`             | `1`           | Áp dụng cho tất cả khóa học và lớp học       |
| `SpecificCourses` | `2`           | Chỉ áp dụng cho danh sách khóa học được chọn |
| `SpecificClasses` | `3`           | Chỉ áp dụng cho danh sách lớp học được chọn  |

### 2.4. VoucherStatus (Trạng thái voucher)

| Giá trị (String)  | Giá trị (Int) | Mô tả                                                                                    |
| :---------------- | :------------ | :--------------------------------------------------------------------------------------- |
| `Draft`           | `1`           | Bản nháp (chưa kích hoạt, cho phép chỉnh sửa cấu hình)                                   |
| `Active`          | `2`           | Đang hoạt động (trong thời hạn và còn lượt dùng)                                         |
| `Disabled`        | `3`           | Đã vô hiệu hóa (tắt thủ công bởi Admin/Giảng viên)                                       |
| `Expired`         | `4`           | Đã hết hạn (quá thời gian `validTo`)                                                     |
| `Exhausted`       | `5`           | Đã hết lượt sử dụng (`usedCount >= totalUsageLimit`)                                     |
| `PendingDeposit`  | `6`           | Chờ nạp cọc (GV đã lưu cấu hình nhưng chưa hoàn tất chuyển khoản cọc / phiên QR hết hạn) |
| `PendingApproval` | `7`           | Chờ duyệt cọc (GV đã nộp cọc và xác nhận chuyển khoản, chờ Admin xác nhận trong 24h)     |
| `Rejected`        | `8`           | Bị từ chối / Đã hủy (Admin từ chối cọc hoặc nội dung vi phạm quy định)                   |
| `Stopped`         | `9`           | Đã dừng (GV chủ động dừng sớm trước thời hạn)                                            |

### 2.5. VoucherUsageStatus (Trạng thái đơn hàng sử dụng voucher)

| Giá trị (String) | Giá trị (Int) | Mô tả                                             |
| :--------------- | :------------ | :------------------------------------------------ |
| `Pending`        | `1`           | Đang trong tiến trình thanh toán                  |
| `Success`        | `2`           | Đơn hàng áp dụng voucher và thanh toán thành công |
| `Cancelled`      | `3`           | Đơn hàng bị hủy hoặc hoàn tiền                    |

---

## 3. Chi tiết 7 Endpoints API

### 3.1. GET `/api/vouchers/stats`

Lấy số lượng thống kê voucher theo trạng thái để hiển thị lên các thẻ Dashboard (hỗ trợ cả 4 thẻ KPI của Admin và 5 thẻ của GV).

- **Headers**: `Authorization: Bearer <token>`
- **Response 200 OK**:

```json
{
  "total": 25,
  "active": 12,
  "expired": 5,
  "disabled": 3,
  "draft": 5,
  "pendingApproval": 2,
  "pendingDeposit": 1,
  "rejected": 1,
  "stopped": 0,
  "inactive": 8
}
```

---

### 3.2. GET `/api/vouchers`

Lấy danh sách voucher hỗ trợ tìm kiếm, lọc theo nhiều tiêu chí và phân trang.

- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (int, default: 1): Trang hiện tại.
  - `pageSize` (int, default: 10): Số phần tử trên mỗi trang (10, 20, 50, 100).
  - `search` (string, optional): Tìm kiếm theo mã voucher (`code`) hoặc tiêu đề (`title`).
  - `status` (string, optional): Lọc theo trạng thái (`Draft`, `Active`, `Disabled`, `Expired`, `Exhausted`, `PendingDeposit`, `PendingApproval`, `Rejected`, `Stopped`).
  - `discountType` (string, optional): Lọc theo loại giảm giá (`Percentage`, `FixedAmount`).
  - `sponsorType` (string, optional): Lọc theo nguồn tài trợ (`CatSpeak`, `Instructor`).
- **Response 200 OK**:

```json
{
  "data": [
    {
      "id": 1,
      "code": "GV-A3K9X2",
      "title": "Giảm 20% Lớp Tiếng Anh Giao Tiếp",
      "description": "Ưu đãi chào đón học viên mới",
      "discountType": "Percentage",
      "discountValue": 20.0,
      "maxDiscountAmount": 200000.0,
      "minOrderAmount": 300000.0,
      "sponsorType": "Instructor",
      "scopeType": "SpecificClasses",
      "validFrom": "2026-08-01T00:00:00Z",
      "validTo": "2026-08-31T23:59:59Z",
      "isNeverExpired": false,
      "usedCount": 5,
      "totalUsageLimit": 50,
      "isUnlimitedUsage": false,
      "status": "Active",
      "depositRequired": 10000000.0,
      "depositAmount": 10000000.0,
      "maxBudget": null,
      "rejectionReason": null,
      "createdAt": "2026-08-01T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 25
  }
}
```

---

### 3.3. GET `/api/vouchers/{id}`

Lấy chi tiết cấu hình voucher, thông tin cọc/đối soát (Deposit & Escrow) và thống kê hiệu suất nhanh.

- **Headers**: `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id` (int, required): ID của voucher.
- **Response 200 OK**:

```json
{
  "id": 1,
  "code": "GV-A3K9X2",
  "title": "Giảm 20% Lớp Tiếng Anh Giao Tiếp",
  "description": "Ưu đãi chào đón học viên mới",
  "discountType": "Percentage",
  "discountValue": 20.0,
  "maxDiscountAmount": 200000.0,
  "minOrderAmount": 300000.0,
  "minLearners": 1,
  "validFrom": "2026-08-01T00:00:00Z",
  "validTo": "2026-08-31T23:59:59Z",
  "isNeverExpired": false,
  "sponsorType": "Instructor",
  "scopeType": "SpecificClasses",
  "isOnlyNewUser": true,
  "isNotCombineOther": true,
  "totalUsageLimit": 50,
  "isUnlimitedUsage": false,
  "perUserLimit": 1,
  "dailyLimit": 10,
  "status": "Active",
  "createdAt": "2026-08-01T08:00:00Z",
  "createdBy": 12,
  "depositRequired": 10000000.0,
  "depositAmount": 10000000.0,
  "depositConfirmedAt": "2026-08-01T09:00:00Z",
  "depositConfirmedBy": 1,
  "depositTransactionContent": "GV-A3K9X2",
  "rejectedAt": null,
  "rejectedBy": null,
  "rejectionReason": null,
  "rejectionNote": null,
  "maxBudget": null,
  "stoppedAt": null,
  "stoppedBy": null,
  "instructors": [
    {
      "id": 12,
      "name": "Thầy CatSpeak",
      "image": "https://avatar.example.com/12.jpg",
      "subtitle": "giangvien@catspeak.com"
    }
  ],
  "courses": [],
  "classes": [
    {
      "id": 45,
      "name": "Lớp Giao Tiếp K12",
      "image": "https://thumbnail.example.com/45.jpg",
      "subtitle": "1.000.000 đ"
    }
  ],
  "usedCount": 5,
  "usagePercentage": 10.0,
  "totalDiscountAmount": 1000000.0,
  "successfulOrdersCount": 5,
  "depositPaid": 10000000.0,
  "depositUsed": 1000000.0,
  "depositRemaining": 9000000.0,
  "estimatedRefund": 9000000.0
}
```

- **Response 404 Not Found**: Khi không tìm thấy voucher hoặc không có quyền truy cập.

---

### 3.4. GET `/api/vouchers/{id}/usages`

Lấy danh sách lịch sử học viên đã sử dụng voucher.

- **Headers**: `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id` (int, required): ID của voucher.
- **Query Parameters**:
  - `page` (int, default: 1): Trang hiện tại.
  - `pageSize` (int, default: 10): Số bản ghi trên mỗi trang.
  - `search` (string, optional): Tìm kiếm theo Tên (`Nickname`/`Username`) hoặc Email của học viên.
  - `status` (string, optional): Lọc theo trạng thái đơn (`Success`, `Pending`, `Cancelled`).
- **Response 200 OK**:

```json
{
  "data": [
    {
      "id": 1001,
      "userId": 502,
      "userName": "Nguyễn Văn A",
      "userEmail": "nguyenvana@gmail.com",
      "userAvatar": "https://avatar.example.com/502.jpg",
      "orderId": 8091,
      "classId": 45,
      "className": "Lớp Tiếng Anh Giao Tiếp Buổi Tối K12",
      "classThumbnail": "https://thumbnail.example.com/45.jpg",
      "discountAmount": 200000.0,
      "usedAt": "2026-08-15T14:30:00Z",
      "status": "Success"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 5
  }
}
```

---

### 3.5. POST `/api/vouchers`

Tạo mới voucher hoặc lưu dưới dạng bản nháp. Tự động tính `DepositRequired` đối với voucher Giảng viên theo công thức:
$$\text{DepositRequired} = \min(\text{Giảm tối đa mỗi lượt} \times \text{Tổng lượt}, \text{Ngân sách tối đa})$$

- **Headers**: `Authorization: Bearer <token>`
- **Request Body (JSON)**:

```json
{
  "isDraft": false,
  "code": "GV-A3K9X2",
  "title": "Voucher Giảm 20% Lớp Giao Tiếp",
  "description": "Áp dụng cho học viên đăng ký lớp K12",
  "discountType": 1,
  "discountValue": 20,
  "maxDiscountAmount": 200000,
  "minOrderAmount": 300000,
  "minLearners": 1,
  "validFrom": "2026-09-01T00:00:00Z",
  "validTo": "2026-09-30T23:59:59Z",
  "isNeverExpired": false,
  "sponsorType": 2,
  "scopeType": 3,
  "isOnlyNewUser": false,
  "isNotCombineOther": true,
  "isUnlimitedUsage": false,
  "totalUsageLimit": 50,
  "perUserLimit": 1,
  "dailyLimit": 10,
  "maxBudget": null,
  "instructorIds": [],
  "courseIds": [],
  "classIds": [45]
}
```

- **Response 201 Created**: Trả về dữ liệu chi tiết của voucher vừa tạo (`VoucherDetailDto`).
- **Response 400 Bad Request**: Dữ liệu vi phạm quy tắc validation nghiệp vụ.
- **Response 409 Conflict**: Mã voucher (`code`) đã tồn tại trong hệ thống.

---

### 3.6. GET `/api/vouchers/generate-code`

Tự động sinh mã voucher ngẫu nhiên duy nhất theo Role:

- Admin $\rightarrow$ Prefix `CS-` (vd: `CS-A3K9X2`).
- Giáo viên $\rightarrow$ Prefix `GV-` (vd: `GV-X7M2P9`).
- 6 ký tự an toàn loại trừ ký tự dễ nhầm `O, 0, I, 1`. Tổng 9 ký tự viết hoa.

- **Headers**: `Authorization: Bearer <token>`
- **Response 200 OK**:

```json
{
  "code": "GV-A3K9X2"
}
```

---

### 3.7. PUT `/api/vouchers/{id}`

Cập nhật cấu hình voucher. Theo quy tắc nghiệp vụ BR-VC-18 / BR-VC-19, API này chỉ cho phép cập nhật khi voucher đang ở trạng thái `Draft` (Bản nháp).

- **Headers**: `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id` (int, required): ID của voucher cần cập nhật.
- **Request Body (JSON)**: Cấu trúc tương tự API tạo mới (`UpdateVoucherRequest`).
- **Response 200 OK**: Trả về thông tin chi tiết voucher sau khi cập nhật (`VoucherDetailDto`).
- **Response 400 Bad Request**: Báo lỗi khi voucher không ở trạng thái `Draft` hoặc dữ liệu cập nhật không hợp lệ.

### 3.8 POST `/api/vouchers/{id}/approve-deposit`

Admin bấm [Xác nhận đã nhận cọc] $\rightarrow$ Ghi nhận tiền cọc, chuyển trạng thái sang Active ngay lập tức.

### 3.9 POST `/api/vouchers/{id}/reject`

Admin bấm [Từ chối & Hủy voucher] $\rightarrow$ Lưu lý do từ chối, chuyển trạng thái sang Rejected, thông báo cho GV.

### 3.10 POST `/api/vouchers/{id}/activate`

Kích hoạt lại voucher (từ Disabled, Draft, Expired).

### 3.11 POST `/api/vouchers/{id}/disable`

Tạm dừng / Vô hiệu hóa voucher đang Active.

### 3.12 POST `/api/vouchers/{id}/extend`

Gia hạn ngày hết hạn mới cho voucher CatSpeak.

### 3.13 POST `/api/vouchers/{id}/increase-limit`

Tăng tổng lượt sử dụng khi voucher hết lượt.

### 3.14 DELETE ` /api/vouchers/{id}`

Xóa voucher.

---

## 4. Bảng tổng hợp Quy tắc nghiệp vụ (Business Rules)

| Mã quy tắc                 | Tên quy tắc           | Quy chuẩn xử lý trên Giao diện (Client-side)                                                                                                                                 |
| :------------------------- | :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BR-VC-02 / BR-VC-GV-02** | Mã Voucher            | Độ dài từ 4 đến 20 ký tự, viết hoa. Prefix `CS-` (Admin) hoặc `GV-` (Giáo viên). Tự động gọi `.toUpperCase()` khi người dùng nhập.                                           |
| **BR-VC-GV-03 / BR-VC-30** | Chặn từ khóa nhạy cảm | Tên chương trình và Mô tả của Giáo viên không được chứa từ khóa nền tảng (`CATSPEAK`, `ADMIN`, `PLATFORM`, `CHÍNH THỨC`...).                                                 |
| **BR-VC-04 / BR-VC-GV-05** | Giảm giá theo %       | - **Admin**: Từ `1` đến `100%`.<br>- **Giáo viên**: Giới hạn từ `1` đến `50%` và **bắt buộc nhập Mức giảm tối đa (VNĐ)**.                                                    |
| **BR-VC-05 / BR-VC-GV-06** | Giảm giá Khóa học     | Đối với Giáo viên, phạm vi áp dụng `Khóa học cụ thể` **bắt buộc chọn Số tiền cố định (FixedAmount)** và **bắt buộc nhập Ngân sách tối đa (MaxBudget)**.                      |
| **BR-VC-08 / BR-VC-GV-10** | Thời hạn hiệu lực     | `validFrom` phải lớn hơn hoặc bằng hôm nay. `validTo` phải lớn hơn `validFrom`. Nếu chọn `isNeverExpired = true` thì vô hiệu hóa trường chọn `validTo`.                      |
| **BR-VC-11 / BR-VC-GV-08** | Phạm vi áp dụng       | - `SpecificCourses`: Chọn tối thiểu 1 khóa học.<br>- `SpecificClasses`: Chọn tối thiểu 1 lớp học.                                                                            |
| **BR-VC-15 / BR-VC-GV-11** | Giới hạn lượt dùng    | - **Admin**: Cho phép tích chọn `Không giới hạn`.<br>- **Giáo viên**: **Bắt buộc nhập TotalUsageLimit $> 0$** (không có tùy chọn không giới hạn) để làm cơ sở tính tiền Cọc. |
| **BR-VC-GV-12**            | Công thức tính Cọc    | $\text{Cọc bắt buộc} = \min(\text{Giảm tối đa mỗi lượt} \times \text{Tổng lượt}, \text{Ngân sách tối đa})$.                                                                  |
| **BR-VC-18 / BR-VC-19**    | Quyền chỉnh sửa       | Nút "Chỉnh sửa" trên giao diện chỉ cho phép click khi voucher có trạng thái `Draft`. Các trạng thái khác chỉ xem chi tiết.                                                   |

---

## 5. Cấu trúc phản hồi lỗi chuẩn (Error Response)

Khi xảy ra lỗi validation hoặc vi phạm quy tắc nghiệp vụ, Backend trả về response format:

```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "Voucher Giáo viên bắt buộc phải nhập Tổng lượt sử dụng cụ thể (không được để trống hoặc chọn Không giới hạn).",
  "statusCode": 400
}
```
