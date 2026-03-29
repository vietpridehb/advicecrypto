const API_URL = 'https://advicecrypto.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // 1. Tự động Login lần sau nếu đã kích hoạt
    const loginToken = localStorage.getItem('loginToken');
    const isApproved = localStorage.getItem('isApproved');
    if (loginToken && isApproved === 'true') {
        verifyAutoLogin(loginToken);
    }

    // 2. Xử lý Submit Form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = form.querySelector('input[name="name"]').value;
        const email = form.querySelector('input[name="email"]').value;
        const phone = form.querySelector('input[name="phone"]').value;

        try {
            const res = await fetch(`${API_URL}/api/submit`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ name, email, phone })
            });
            const data = await res.json();
            alert(data.message);
            
            // Lưu email để dùng cho nút Kích hoạt
            localStorage.setItem('userEmail', email);
            
            // Hiện nút KÍCH HOẠT ĐĂNG NHẬP NGAY
            if (!document.getElementById('activate-btn')) {
                const btn = document.createElement('button');
                btn.id = 'activate-btn';
                btn.innerText = "KÍCH HOẠT ĐĂNG NHẬP NGAY";
                btn.style.cssText = "margin-top:20px; padding:15px; background:green; color:white; border:none; cursor:pointer; width:100%;";
                btn.onclick = async () => {
                    const emailToActivate = localStorage.getItem('userEmail');
                    const res2 = await fetch(`${API_URL}/api/activate`, {
                        method: 'POST', headers: {'Content-Type': 'application/json'}, 
                        body: JSON.stringify({ email: emailToActivate })
                    });
                    const data2 = await res2.json();
                    if(data2.success) {
                        localStorage.setItem('loginToken', data2.token);
                        localStorage.setItem('isApproved', 'true');
                        alert("Đăng nhập thành công!");
                        location.reload();
                    } else {
                        alert(data2.message || "Admin chưa duyệt!");
                    }
                };
                form.parentNode.insertBefore(btn, form.nextSibling);
            }
        } catch (err) { alert("Lỗi kết nối server!"); }
    });
});

// Hàm verify auto-login
function verifyAutoLogin(token) {
    fetch(`${API_URL}/api/verify`, { 
        method: 'POST', headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ token }) 
    })
    .then(res => res.json()).then(data => { 
        if(data.success) console.log("Auto-login thành công cho:", data.name);
    });
}
