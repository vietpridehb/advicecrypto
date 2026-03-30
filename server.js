const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const nodemailer = require('nodemailer');

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

// Nodemailer transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

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
    const approveLink = `${process.env.BASE_URL || 'https://advicecrypto.onrender.com'}/api/approve/${user._id}`;
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'vietpridehb@gmail.com',
      subject: `Đăng ký mới - Cần duyệt: ${name} (${email})`,
      html: `
        <h1 style="color:#10b981">Có đăng ký mới!</h1>
        <p><strong>Họ tên:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <br>
        <a href="${approveLink}" 
           style="background:#10b981;color:white;padding:15px 25px;border-radius:8px;text-decoration:none;font-weight:bold;">
          ✅ CLICK ĐỂ DUYỆT & CHO PHÉP ĐĂNG NHẬP
        </a>
        <p style="margin-top:20px;color:#666;">Sau khi click, người dùng sẽ kích hoạt được ngay.</p>
      `
    });

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

// ====================== VERIFY (dùng sau) ======================
app.post('/api/verify', async (req, res) => {
  const { token } = req.body;
  const user = await User.findOne({ loginToken: token, isApproved: true });
  if (user && user.isApproved) {
    res.json({ success: true, name: user.name });
  } else {
    res.json({ success: false });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 10000, () => {
      console.log('Server running (DB connected)');
    });
  })
  .catch(err => console.error('Database connection failed:', err));