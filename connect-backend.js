document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://advicecrypto.onrender.com';
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.querySelector('input[name="email"]').value;
        const name = form.querySelector('input[name="name"]').value;
        const phone = form.querySelector('input[name="phone"]').value;

        try {
            const res = await fetch(`${API_URL}/api/submit`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ name, email, phone })
            });
            const data = await res.json();
            alert(data.message);
            
            // Hiện nút Kích Hoạt nếu chưa duyệt
            if (!data.success && !document.getElementById('activate-btn')) {
                const btn = document.createElement('button');
                btn.id = 'activate-btn';
                btn.innerText = "KÍCH HOẠT ĐĂNG NHẬP NGAY";
                btn.style.cssText = "margin-top:20px; padding:15px; background:green; color:white; border:none; cursor:pointer; width:100%;";
                btn.onclick = async () => {
                    const res2 = await fetch(`${API_URL}/api/activate`, {
                        method: 'POST', headers: {'Content-Type': 'application/json'}, 
                        body: JSON.stringify({ email: email })
                    });
                    const data2 = await res2.json();
                    if(data2.success) {
                        localStorage.setItem('loginToken', data2.token);
                        alert("Đăng nhập thành công!");
                        location.reload();
                    } else alert(data2.message);
                };
                form.appendChild(btn);
            }
        } catch (err) { alert("Lỗi kết nối!"); }
    });
});
