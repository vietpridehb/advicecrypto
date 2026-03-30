const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

const UserSchema = new mongoose.Schema({
    name: String, email: { type: String, unique: true }, phone: String,
    isApproved: { type: Boolean, default: false }, loginToken: String
});
const User = mongoose.model('User', UserSchema);

app.post('/api/submit', async (req, res) => {
    const { name, email, phone } = req.body;
    console.log(`[LOG] Đang xử lý đăng ký cho: ${email}`);
    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ name, email, phone, loginToken: crypto.randomBytes(32).toString('hex') });
            await user.save();
        }
        
        console.log(`[LOG] Bắt đầu kết nối SMTP...`);
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { 
                user: 'vietpridehb@gmail.com', 
                pass: process.env.GMAIL_PASS 
            },
            tls: { rejectUnauthorized: false } // ĐẶC BIỆT: Gỡ bỏ kiểm tra chứng chỉ để tránh lỗi kết nối
        });

        console.log(`[LOG] SMTP kết nối thành công, đang gửi mail...`);
        await transporter.sendMail({
            from: '"Advice Crypto" <vietpridehb@gmail.com>', 
            to: 'vietpridehb@gmail.com', 
            subject: `Duyệt: ${name}`,
            html: `<p>Có người đăng ký mới:</p>
                   <p>Tên: ${name}</p>
                   <p>Email: ${email}</p>
                   <p>SĐT: ${phone}</p>
                   <a href="${process.env.BASE_URL}/api/approve/${user._id}">BẤM ĐÂY DUYỆT ĐỂ NGƯỜI DÙNG KÍCH HOẠT</a>`
        });
        console.log(`[LOG] Gửi mail thành công cho: ${name}`);
        res.json({ success: true, message: 'Đã gửi thông tin! Vui lòng chờ Admin xác nhận qua email.' });
    } catch (error) {
        console.error('[LOG ERROR] Lỗi server:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

app.get('/api/approve/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isApproved: true });
        res.send("<h1>ĐÃ DUYỆT THÀNH CÔNG!</h1>");
    } catch (err) {
        res.status(500).send("Lỗi duyệt!");
    }
});

app.post('/api/activate', async (req, res) => {
    const user = await User.findOne({ email: req.body.email, isApproved: true });
    if (user) return res.json({ success: true, token: user.loginToken });
    res.json({ success: false, message: 'Admin chưa duyệt!' });
});

app.post('/api/verify', async (req, res) => {
    const user = await User.findOne({ loginToken: req.body.token });
    if (user && user.isApproved) return res.json({ success: true, name: user.name });
    res.json({ success: false });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT || 10000, () => console.log("Server running"));
    })
    .catch(err => console.error("Database connection failed:", err));
