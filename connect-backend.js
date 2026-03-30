document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://advicecrypto.onrender.com';
    const form = document.getElementById('contactForm');
    
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Lấy dữ liệu từ form gốc
        const name = form.querySelector('input[name="name"]').value;
        const email = form.querySelector('input[name="email"]').value;
        const phone = form.querySelector('input[name="phone"]').value;
        
        const data = { name, email, phone };

        try {
            // Gửi dữ liệu về backend của Chủ Nhân
            const res = await fetch(`${API_URL}/api/submit`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            // Hiển thị thông báo kết quả
            alert(result.message);
        } catch (err) {
            alert("Lỗi kết nối server!");
        }
    });
});
