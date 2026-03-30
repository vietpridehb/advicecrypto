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

        try {
            const res = await fetch(`${API_URL}/api/submit`, {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            const result = await res.json();
            alert(result.message);
        } catch (err) { alert("Lỗi kết nối!"); }
    });
});
