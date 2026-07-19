Mình đã đọc toàn bộ `Table.tsx`. Component này được thiết kế khá bài bản, mục tiêu là đóng gói gần như toàn bộ chức năng của **TanStack Table** thành một reusable package, chỉ cần truyền `headers` và `fetcher` là có:

- Sorting
- Global search
- Column filter
- Pagination (client hoặc server)
- Loading / Empty / Error
- Row actions
- Row click
- Custom cell render
- Custom TanStack options

Điểm hay nhất là **nó tự quyết định dùng client-side hay server-side pagination dựa vào số lượng tham số của fetcher**.

---

# Workflow tổng thể

```
Parent Component
       │
       │ headers + fetcher
       ▼
<Table />
       │
       │
       ├── xác định pagination mode
       │
       ├── fetch data
       │
       ├── build columns
       │
       ├── useReactTable()
       │
       ├── render toolbar
       │
       ├── render filters
       │
       ├── render table
       │
       └── render pagination
```

---

# 1. Props

```ts
interface TableProps<T>
```

là API mà package expose.

---

## headers

```ts
headers: TableHeader < T > [];
```

Định nghĩa các cột.

Ví dụ

```ts
headers={[
   {
      name:"Name",
      accessorKey:"name"
   },
   {
      name:"Age",
      accessorKey:"age"
   }
]}
```

Sau đó component sẽ convert thành

```
ColumnDef[]
```

để TanStack hiểu.

---

## fetcher

Đây là phần quan trọng nhất.

```ts
fetcher: TableFetcher<T>;
```

Có thể có 2 kiểu.

### Client side

```ts
const fetcher = async () => {
  return {
    data,
    total: data.length,
  };
};
```

↓

Table gọi đúng **1 lần**

```
fetcher()
```

↓

Toàn bộ data nằm trong browser.

Pagination

Sorting

Filter

đều chạy ở client.

---

### Server side

Nếu khai báo

```ts
const fetcher = async (page, pageSize) => {};
```

thì

```
fetcher.length == 2
```

↓

Table tự hiểu

```
Server pagination
```

↓

Mỗi lần đổi page

```
fetcher(page,pageSize)
```

---

Đây là đoạn quyết định

```ts
const usesServerPagination = fetcher.length >= 2;
```

Khá thông minh.

---

# onClickRow

```ts
(row) => {};
```

Nếu truyền

```
row sẽ clickable
```

Nếu không truyền

```
row chỉ hiển thị
```

---

# actions

```
...
```

Mỗi row sẽ có

```
⋮
```

Ví dụ

```
Edit

Delete

Disable
```

được render từ

```
ActionsMenu
```

---

# loading

Cho phép parent ép loading.

```
loading=true
```

↓

Hiện skeleton.

---

# loadingMessage

Accessibility

```
Loading...
```

---

# emptyMessage

```
No data
```

---

# configErrorMessage

Nếu quên truyền fetcher

```
Table requires fetcher
```

---

# pageSizeOptions

```
[10,20,50]
```

↓

Dropdown

```
Rows per page
```

---

# defaultPageSize

Khởi tạo

```ts
pagination = {
  pageSize: 10,
};
```

---

# stickyHeader

```
true
```

↓

thead

```
sticky top-0
```

---

# className

Class ngoài cùng.

---

# showGlobalSearch

Ẩn hiện

```
Search...
```

---

# showPagination

Ẩn pagination.

---

# keyExtractor

Mặc định

TanStack dùng index.

Nếu truyền

```ts
keyExtractor={(row)=>row.id}
```

↓

```
getRowId
```

sẽ dùng id.

---

# entityName

Đổi text

Ví dụ

```
Total 100 Accounts
```

hay

```
Total 20 Users
```

---

# tableOptions

Đây là escape hatch.

```ts
...tableOptions
```

được merge vào

```ts
useReactTable();
```

Nghĩa là package không expose hết API TanStack nhưng vẫn cho phép override khi cần.

Ví dụ

```ts
tableOptions = {
  enableMultiSort: false,
};
```

---

# 2. Header

Một column gồm

```ts
interface TableHeader
```

---

## name

Tên cột.

---

## accessorKey

Lấy dữ liệu

```ts
row.name;
```

---

## accessorFn

Nếu dữ liệu phải tính toán

Ví dụ

```ts
accessorFn: (row) => row.first + " " + row.last;
```

---

## mapTo

Đây là điểm khá thú vị.

Ví dụ

Server trả

```
statusCode=1
statusName="Active"
```

Bạn muốn

Sort theo

```
statusCode
```

nhưng hiển thị

```
statusName
```

thì

```
accessorKey=statusCode

mapTo=statusName
```

---

## cell

Custom render.

Ví dụ

```tsx
cell: (value, row) => <Badge>{value}</Badge>;
```

---

## render

Khác cell.

cell

↓

Render hoàn toàn.

render

↓

Chỉ bọc value.

Ví dụ

```
value

↓

<strong>value</strong>
```

---

## values

Nếu truyền

```
values
```

↓

Filter sẽ đổi thành

Checkbox

không còn textbox.

Ví dụ

```
Role

☑ Admin

☑ User

☑ Guest
```

---

## allowSort

Bật tắt sorting.

---

## showFilter

Ẩn filter cột.

---

## width

Width cột.

---

## headerClassName

Custom TH.

---

## cellClassName

Custom TD.

---

# 3. Workflow fetch data

Ban đầu

```
useEffect
```

↓

Kiểm tra

```
Server?
```

Nếu

Server

↓

```
fetcher(page,pageSize)
```

Nếu

Client

↓

```
fetcher()
```

↓

```
setFetchedData()

setFetchedTotal()
```

↓

```
useReactTable(data)
```

---

# 4. Build columns

Từ

```
TableHeader
```

↓

Convert

```
ColumnDef
```

↓

Đưa vào

```
useReactTable()
```

---

# 5. TanStack

```ts
useReactTable({
    data,
    columns,
    state,
    ...
})
```

Đây là "engine" của toàn bộ table.

Nó quản lý:

- sorting
- filtering
- pagination
- row model
- header model
- page model

---

# 6. Search

Global search

↓

```
globalContainsFilter
```

↓

Mỗi cell

↓

```
approximateIncludes()
```

↓

Có fuzzy search.

Ví dụ

```
Jhon
```

vẫn match

```
John
```

---

# 7. Column Filter

Nếu

```
values
```

↓

Checkbox.

Nếu không

↓

Textbox.

---

# 8. Pagination

Nếu

Client

↓

TanStack

```
getPaginationRowModel()
```

chia page.

Nếu

Server

↓

Server chia page.

TanStack chỉ hiển thị.

---

# 9. Actions

Nếu

```
actions
```

↓

Render

```
⋮
```

↓

Click

↓

Menu

↓

handler(row)

---

# 10. Các state chính

| State         | Ý nghĩa                          |
| ------------- | -------------------------------- |
| sorting       | Trạng thái sắp xếp               |
| columnFilters | Filter từng cột                  |
| globalFilter  | Ô search toàn cục                |
| pagination    | pageIndex, pageSize              |
| filtersOpen   | Mở/đóng panel filter             |
| openRowId     | Menu actions của row nào đang mở |
| fetchedData   | Dữ liệu hiện tại                 |
| fetchedTotal  | Tổng số bản ghi                  |
| fetchLoading  | Loading khi gọi fetcher          |
| fetchError    | Lỗi khi fetch                    |

## Đánh giá thiết kế

### Ưu điểm

- **API đơn giản:** chỉ cần `headers` + `fetcher` là có một bảng đầy đủ chức năng.
- **Tự động chọn client/server pagination** dựa trên chữ ký của `fetcher`, giúp component dễ dùng.
- **Phân tách tốt** giữa cấu hình (`headers`) và dữ liệu (`fetcher`).
- **Khả năng mở rộng cao:** `cell`, `render`, `tableOptions`, `actions`, `keyExtractor` cho phép tùy biến mà không phải sửa component.
- **Tích hợp nhiều tính năng sẵn có:** sorting, filtering, global search, pagination, loading, error, empty state.

### Hạn chế đáng lưu ý

- **Phát hiện server pagination bằng `fetcher.length` khá "ma thuật" (magic behavior):** nếu `fetcher` được bọc bởi một wrapper hoặc dùng rest parameters, `length` có thể không phản ánh đúng ý định.
- **Server-side sorting và filtering chưa được hỗ trợ:** trong chế độ server, sorting/filtering vẫn chạy trên dữ liệu của **trang hiện tại**, nên kết quả không đúng nếu tổng dữ liệu lớn. Muốn hỗ trợ đầy đủ, `sorting` và `columnFilters` nên được truyền vào `fetcher` để API xử lý.
- **`fetcher` hiện chỉ nhận `(page, pageSize)`:** nếu sau này cần server-side search, sort hoặc filter, kiểu `TableFetcher` sẽ cần mở rộng (ví dụ nhận thêm một object chứa `sorting`, `filters`, `globalFilter`).

Nhìn chung, đây là một thiết kế sạch và phù hợp cho khoảng **80–90%** các bảng dữ liệu thông thường. Nếu mục tiêu là xây dựng một package dùng chung cho nhiều dự án và làm việc với API lớn, bước nâng cấp tiếp theo nên là hỗ trợ **server-side sorting, filtering và search** thay vì chỉ có server-side pagination.
