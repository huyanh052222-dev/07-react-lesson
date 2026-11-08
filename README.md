# Quản lý User (React + Vite + mockapi.io)

CRUD đầy đủ trên API mockapi.io.

## Chức năng
- **Xem**: tải từng trang 15 user từ server (`?page=N&limit=15`); cuộn xuống cuối danh sách thì gọi API lấy trang kế tiếp (cấu hình `PAGE_SIZE` trong `src/config.js`). Không fetch toàn bộ dữ liệu một lần.
- **Virtual scroll**: dù đã tải bao nhiêu user, chỉ những card gần vùng nhìn thấy (cộng 5 hàng đệm mỗi phía) mới tồn tại trong DOM. Xem `src/hooks/useVirtualWindow.js` và `src/components/VirtualList/`. Mỗi card phải cao cố định (`ITEM_HEIGHT` trong `config.js`, khớp với `Card.css`).
- **Thêm**: form 10 trường, kiểm tra tên bắt buộc và email hợp lệ.
- **Sửa**: bấm "Sửa" trên card, form được điền sẵn, bấm "Lưu thay đổi" (PUT).
- **Xóa**: "Chế độ xóa" → chọn nhiều user → "Xóa đã chọn". Lỗi từng phần được báo rõ.
- **Tìm kiếm**: chạy phía server (`?search=`, debounce 300ms — `SEARCH_DELAY` trong `config.js`).
- **Sắp xếp**: ID / tên, tăng / giảm — chạy phía server (`?sortBy=&order=`).

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
  config.js       API_URL, PAGE_SIZE, SEARCH_DELAY, thông số virtual scroll
  reducer.js      state + reducer
  App.jsx         logic chính
  hooks/          useVirtualWindow (tính vùng hàng cần vẽ)
  components/     Card, CardList, VirtualList, Form, ToolBar, Loading, ErrorScreen
```
