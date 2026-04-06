const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  isApproved: { type: Boolean, default: false },
  loginToken: String
});

const User = mongoose.model('User', UserSchema);

// ==================== BREVO API (thay vì Gmail SMTP) ====================
async function sendAdminEmail(user) {
  const approveLink = `${process.env.BASE_URL || 'https://advicecrypto.onrender.com'}/api/approve/${user._id}`;

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'CryptoAdvisor',
        email: process.env.BREVO_SENDER_EMAIL
      },
      to: [{ email: 'vietpridehb@gmail.com' }],
      subject: `Đăng ký mới - Cần duyệt: ${user.name} (${user.email})`,
      htmlContent: `
        <h1 style="color:#10b981">Có đăng ký mới!</h1>
        <p><strong>Họ tên:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phone}</p>
        <br>
        <a href="${approveLink}" 
           style="background:#10b981;color:white;padding:15px 25px;border-radius:8px;text-decoration:none;font-weight:bold;">
          ✅ CLICK ĐỂ DUYỆT & CHO PHÉP ĐĂNG NHẬP
        </a>
        <p style="margin-top:20px;color:#666;">Sau khi click, người dùng sẽ kích hoạt được ngay.</p>
      `
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error('Brevo error: ' + errText);
  }
}

// ====================== SUBMIT ======================
app.post('/api/submit', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        phone,
        loginToken: crypto.randomBytes(32).toString('hex')
      });
      await user.save();
    } else {
      // Cập nhật lại token nếu đã tồn tại
      user.name = name;
      user.phone = phone;
      user.loginToken = crypto.randomBytes(32).toString('hex');
      await user.save();
    }

    // GỬI EMAIL CHO ADMIN
    await sendAdminEmail(user);

    res.json({ success: true, message: 'Đã lưu thông tin! Email xác nhận đã gửi cho admin.' });
  } catch (error) {
    console.error('Lỗi submit:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lưu thông tin' });
  }
});

// ====================== DUYỆT ======================
app.get('/api/approve/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.send('<h1 style="color:#10b981;text-align:center;margin-top:50px;">✅ ĐÃ DUYỆT THÀNH CÔNG!</h1>');
  } catch (err) {
    res.status(500).send('Lỗi duyệt!');
  }
});

// ====================== KÍCH HOẠT ======================
app.post('/api/activate', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email, isApproved: true });
  if (user) {
    res.json({ success: true, token: user.loginToken });
  } else {
    res.json({ success: false, message: 'Admin chưa duyệt!' });
  }
});

// ====================== VERIFY ======================
app.post('/api/verify', async (req, res) => {
  const { token } = req.body;
  const user = await User.findOne({ loginToken: token, isApproved: true });
  if (user && user.isApproved) {
    res.json({ success: true, name: user.name });
  } else {
    res.json({ success: false });
  }
});

// ====================== PING GIỮ SERVICE KHÔNG SLEEP (Render free tier) ======================
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 10000, () => {
      console.log("Server running (DB connected)");
    });
  })
  .catch(err => console.error("Database connection failed:", err));
