const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. Kết nối Database
mongoose.connect(process.env.MONGO_URI);

const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    isApproved: { type: Boolean, default: false }
}));

// 2. Cấu hình gửi Mail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vietpridehb@gmail.com',
        pass: process.env.GMAIL_PASS // 16 ký tự App Password
    }
});

// 3. API Đăng ký & Đăng nhập
app.post('/api/submit', async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        let user = await User.findOne({ email });
        
        // Trường hợp đã được duyệt
        if (user && user.isApproved) {
            return res.json({ success: true, message: 'Welcome back!' });
        }

        // Trường hợp mới đăng ký hoặc chưa duyệt
        if (!user) {
            user = new User({ name, email, phone });
            await user.save();
        }

        const approveLink = `${process.env.BASE_URL}/api/approve/${user._id}`;
        await transporter.sendMail({
            from: 'Hệ thống Crypto',
            to: 'vietpridehb@gmail.com',
            subject: `Xác nhận cho: ${name}`,
            html: `<p>Duyệt đăng nhập cho ${name} (${email})?</p>
                   <a href="${approveLink}" style="padding:10px; background:gold; color:black;">BẤM VÀO ĐÂY ĐỂ DUYỆT</a>`
        });

        res.json({ success: false, message: 'Đang chờ Admin duyệt qua email.' });
    } catch (err) { res.status(500).send(err.message); }
});

// 4. API Duyệt (Bạn bấm link trong mail)
app.get('/api/approve/:id', async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.send("<h1>ĐÃ DUYỆT THÀNH CÔNG! Khách có thể vào web ngay.</h1>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server is running'));