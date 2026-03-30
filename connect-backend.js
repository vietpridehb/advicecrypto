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

    const button = form.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi...`;

    try {
      const res = await fetch(`${API_URL}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        // Lưu email để activate
        window.lastSubmittedEmail = data.email;
        // Hiển thị modal đẹp (có thông tin thanh toán)
        document.getElementById('successModal').classList.remove('hidden');
      } else {
        alert(result.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối server. Vui lòng thử lại.');
    } finally {
      button.disabled = false;
      button.innerHTML = originalText;
    }
  });
});