# Quản lý User (React + Vite + mockapi.io)

CRUD đầy đủ trên API mockapi.io.

## Chức năng
- **Xem**: hiển thị 15 user đầu tiên; cuộn xuống cuối danh sách thì hiện "Đang tải thêm..." khoảng 1 giây rồi hiện thêm 15 user tiếp theo (cấu hình trong `src/config.js`).
- **Virtual scroll**: dù đã tải bao nhiêu user, chỉ những card gần vùng nhìn thấy (cộng 5 hàng đệm mỗi phía) mới tồn tại trong DOM. Xem `src/hooks/useVirtualWindow.js` và `src/components/VirtualList/`. Mỗi card phải cao cố định (`ITEM_HEIGHT` trong `config.js`, khớp với `Card.css`).
- **Thêm**: form 10 trường, kiểm tra tên bắt buộc và email hợp lệ.
- **Sửa**: bấm "Sửa" trên card, form được điền sẵn, bấm "Lưu thay đổi" (PUT).
- **Xóa**: "Chế độ xóa" → chọn nhiều user → "Xóa đã chọn". Lỗi từng phần được báo rõ.
- **Tìm kiếm**: theo tên, email, địa chỉ, điện thoại.
- **Sắp xếp**: ID / tên, tăng / giảm.

## Chạy
```bash
npm install
npm run dev
```

Đổi API: copy `.env.example` thành `.env` và sửa `VITE_API_URL`.

## Cấu trúc
```
src/
  api.js          gọi API (GET/POST/PUT/DELETE)
  config.js       API_URL, PAGE_SIZE, LOAD_MORE_DELAY
  reducer.js      state + reducer
  App.jsx         logic chính
  hooks/          useVirtualWindow (tính vùng hàng cần vẽ)
  components/     Card, CardList, VirtualList, Form, ToolBar, Loading, ErrorScreen
```
