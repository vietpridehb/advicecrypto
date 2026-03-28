const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Kết nối và báo lỗi chi tiết ra Logs
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ DA KET NOI MONGODB THANH CONG'))
    .catch(err => console.log('❌ LOI KET NOI DATABASE:', err));

const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    isApproved: { type: Boolean, default: false }
}));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'vietpridehb@gmail.com', pass: process.env.GMAIL_PASS }
});

app.post('/api/submit', async (req, res) => {
    console.log('=> Nhan du lieu tu Web:', req.body);
    const { name, email, phone } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user && user.isApproved) return res.json({ success: true });
        if (!user) {
            user = new User({ name, email, phone });
            await user.save();
            console.log('=> Da luu user moi vao database');
        }
        const approveLink = `${process.env.BASE_URL}/api/approve/${user._id}`;
        await transporter.sendMail({
            from: 'Advice Crypto',
            to: 'vietpridehb@gmail.com',
            subject: `Yeu cau duyet: ${name}`,
            html: `Khach hang ${name} muon vao web. <br><a href="${approveLink}">BAM VAO DAY DE DUYET</a>`
        });
        res.json({ success: false, message: 'Vui lòng chờ Admin duyệt qua Email!' });
    } catch (err) { 
        console.log('❌ LOI SERVER:', err.message);
        res.status(500).json({ error: err.message }); 
    }
});

app.get('/api/approve/:id', async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.send("<h1>DA DUYET THANH CONG!</h1>");
});

app.listen(process.env.PORT || 10000, () => console.log('🚀 Backend dang lang nghe...'));
