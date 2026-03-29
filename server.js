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

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ DA KET NOI MONGODB THANH CONG'))
    .catch(err => console.log('❌ LOI KET NOI DATABASE:', err));

const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    isApproved: { type: Boolean, default: false },
    loginToken: String
}));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'vietpridehb@gmail.com', pass: process.env.GMAIL_PASS }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/submit', async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ name, email, phone, loginToken: crypto.randomBytes(32).toString('hex') });
            await user.save();
        }
        
        await transporter.sendMail({
            from: 'Advice Crypto',
            to: 'vietpridehb@gmail.com',
            subject: `Duyệt đăng ký: ${name}`,
            html: `Khách ${name} muốn vào web. <a href="${process.env.BASE_URL}/api/approve/${user._id}">BẤM ĐÂY ĐỂ DUYỆT</a>`
        });
        res.json({ success: false, message: 'Đang chờ Admin duyệt!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/approve/:id', async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.send("<h1>ĐÃ DUYỆT THÀNH CÔNG!</h1><p>User có thể quay lại web nhấn KÍCH HOẠT.</p>");
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

app.listen(process.env.PORT || 10000, () => console.log('🚀 Server is running...'));
