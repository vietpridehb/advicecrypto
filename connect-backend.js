document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://advicecrypto.onrender.com';
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = { 
            name: form.querySelector('input[name="name"]').value, 
            email: form.querySelector('input[name="email"]').value, 
            phone: form.querySelector('input[name="phone"]').value 
        };
        
        const res = await fetch(`${API_URL}/api/submit`, {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(data)
        });
        const result = await res.json();
        alert(result.message);
        
        if (!result.success && !document.getElementById('activate-btn')) {
            const btn = document.createElement('button');
            btn.id = 'activate-btn';
            btn.innerText = "KÍCH HOẠT ĐĂNG NHẬP NGAY";
            btn.style.cssText = "margin-top:20px; padding:15px; background:green; color:white; border:none; cursor:pointer; width:100%;";
            btn.onclick = async () => {
                const res2 = await fetch(`${API_URL}/api/activate`, {
                    method: 'POST', 
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify({ email: data.email })
                });
                const d2 = await res2.json();
                if(d2.success) { 
                    localStorage.setItem('loginToken', d2.token); 
                    alert("Đăng nhập thành công!"); 
                    location.reload(); 
                } else alert(d2.message);
            };
            form.appendChild(btn);
        }
    });
});