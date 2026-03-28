const API_URL = 'https://advicecrypto.onrender.com'; // <--- THAY LINK RENDER CỦA BẠN VÀO ĐÂY

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Kiểm tra xem đã đăng nhập chưa
    const saved = localStorage.getItem('isApproved');
    if (saved === 'true') {
        // Nếu đã được duyệt, bạn có thể viết thêm lệnh ẩn form ở đây
        console.log("Người dùng này đã được phê duyệt.");
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Lấy dữ liệu từ các ô input (Dựa trên thuộc tính name của code bạn)
        const name = form.querySelector('input[name="name"]').value;
        const email = form.querySelector('input[name="email"]').value;
        const phone = form.querySelector('input[name="phone"]').value;

        try {
            const response = await fetch(`${API_URL}/api/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('isApproved', 'true');
                alert("Đăng nhập thành công!");
                location.reload();
            } else {
                alert(data.message); // Hiện thông báo "Đang chờ duyệt"
            }
        } catch (error) {
            alert("Lỗi kết nối server rồi!");
        }
    });
});
