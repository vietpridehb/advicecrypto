document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://advicecrypto.onrender.com';
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = { name: form.name.value, email: form.email.value, phone: form.phone.value };
        const res = await fetch(`${API_URL}/api/submit`, {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
        });
        const result = await res.json();
        alert(result.message);
        if (!result.success) {
            const btn = document.createElement('button');
            btn.innerText = "KÍCH HOẠT ĐĂNG NHẬP NGAY";
            btn.onclick = async () => {
                const res2 = await fetch(`${API_URL}/api/activate`, {
                    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email: data.email })
                });
                const d2 = await res2.json();
                if(d2.success) { localStorage.setItem('loginToken', d2.token); alert("Thành công!"); location.reload(); }
                else alert(d2.message);
            };
            form.appendChild(btn);
        }
    });
});
