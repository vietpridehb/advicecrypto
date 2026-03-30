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
    name: String, email: { type: String, unique: true }, phone: String,
    isApproved: { type: Boolean, default: false }, loginToken: String
});
const User = mongoose.model('User', UserSchema);

// Endpoint lưu thông tin user vào database (chỉ lưu, không gửi mail)
app.post('/api/submit', async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ name, email, phone, loginToken: crypto.randomBytes(32).toString('hex') });
            await user.save();
        }
        res.json({ success: true, message: 'Đã lưu thông tin!' });
    } catch (error) {
        console.error('Lỗi khi lưu DB:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lưu thông tin' });
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
        app.listen(process.env.PORT || 10000, () => console.log("Server running (DB mode only)"));
    })
    .catch(err => console.error("Database connection failed:", err));
