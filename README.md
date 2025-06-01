# Ứng dụng Ôn luyện Kinh tế Chính trị

Ứng dụng này được tạo ra để giúp sinh viên ôn luyện các câu hỏi trắc nghiệm môn Kinh tế Chính trị.

## Tính năng

- Ôn luyện theo chương: Chọn 1 trong 6 chương để ôn tập
- Ôn luyện ngẫu nhiên: Tạo đề thi gồm 40 câu hỏi ngẫu nhiên
- Hiển thị đáp án ngay sau khi chọn câu trả lời
- Câu hỏi sai sẽ được lặp lại 2 lần để ôn tập:
  - Lần 1: Ngay sau khi trả lời sai
  - Lần 2: Sau khi làm thêm 2 câu hỏi tiếp theo
- Xem kết quả chi tiết sau khi làm bài
- Xem lại câu trả lời và đáp án đúng

## Cách sử dụng

1. Mở file `index.html` trên trình duyệt web
2. Chọn chế độ ôn tập (theo chương hoặc ngẫu nhiên)
3. Làm bài và nộp bài khi hoàn thành
4. Xem kết quả và xem lại các câu trả lời

### Sử dụng máy chủ web

Để có trải nghiệm tốt nhất, bạn nên chạy ứng dụng trên máy chủ web:

1. Chạy file `start-server.bat` để khởi động máy chủ
2. Truy cập `http://localhost:3000` (hoặc cổng khác nếu 3000 đã được sử dụng)
3. Nếu gặp lỗi "address already in use", chạy file `free-port.bat` để giải phóng cổng 3000

## Cấu trúc thư mục

- `index.html`: Giao diện người dùng
- `styles.css`: Định dạng giao diện
- `script.js`: Xử lý logic ứng dụng
- `ktct.txt`: Dữ liệu câu hỏi và đáp án
- `server.js`: Máy chủ web đơn giản
- `start-server.bat`: Script khởi động máy chủ
- `free-port.bat`: Script giải phóng cổng 3000

## Lưu ý

- Để ứng dụng hoạt động tốt nhất, nên chạy trên máy chủ web hoặc sử dụng Live Server trong VS Code
- Dữ liệu câu hỏi được đọc từ file `ktct.txt`
- Định dạng câu hỏi trong file cần tuân theo cấu trúc:
  - Chương được đánh dấu bằng "CHƯƠNG X"
  - Câu hỏi bắt đầu bằng "Câu X: "
  - Các phương án A, B, C, D
  - Đáp án đúng bắt đầu bằng dấu "•"
