require('dotenv').config();
const DOMAIN = process.env.DOMAIN || 'https://kafandigitalsn.onrender.com';
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Upload config
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// View engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify(function (error) {
    if (error) {
        console.log('Email error:', error);
    } else {
        console.log('Email server ready');
    }
});

// Data storage
const dataPath = path.join(__dirname, 'data');
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

const testimonialsFile = path.join(dataPath, 'testimonials.json');
const portfolioFile = path.join(dataPath, 'portfolio.json');
const adminFile = path.join(dataPath, 'admin.json');

if (!fs.existsSync(testimonialsFile)) {
    fs.writeFileSync(testimonialsFile, JSON.stringify([
        {
            id: Date.now().toString(),
            name: "Sarah Johnson",
            photo: "https://randomuser.me/api/portraits/women/43.jpg",
            message: "Kafan Digitals created an amazing logo for my business!",
            date: new Date().toISOString(),
            approved: true
        },
        {
            id: Date.now().toString() + 1,
            name: "Michael Brown",
            photo: "https://randomuser.me/api/portraits/men/32.jpg",
            message: "The flyers helped us triple event attendance!",
            date: new Date().toISOString(),
            approved: true
        }
    ]));
}

if (!fs.existsSync(portfolioFile)) {
    fs.writeFileSync(portfolioFile, JSON.stringify([
        {
            id: Date.now().toString(),
            title: "Brand Logo Design",
            image: "/portfolio-images/logo1.jpg",
            description: "Modern logo design for a tech startup"
        }
    ]));
}

if (!fs.existsSync(adminFile)) {
    fs.writeFileSync(adminFile, JSON.stringify({ pendingTestimonials: [] }));
}

function readTestimonials() {
    return JSON.parse(fs.readFileSync(testimonialsFile));
}

function writeTestimonials(data) {
    fs.writeFileSync(testimonialsFile, JSON.stringify(data, null, 2));
}

function readPortfolio() {
    return JSON.parse(fs.readFileSync(portfolioFile));
}

function writePortfolio(data) {
    fs.writeFileSync(portfolioFile, JSON.stringify(data, null, 2));
}

function readAdminData() {
    return JSON.parse(fs.readFileSync(adminFile));
}

function writeAdminData(data) {
    fs.writeFileSync(adminFile, JSON.stringify(data, null, 2));
}

// Admin authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "kafanadmin123";

// Routes
app.get('/', (req, res) => res.render('index'));
app.get('/portfolio', (req, res) => res.render('portfolio', { portfolio: readPortfolio() }));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'views/admin.html')));

app.get('/testimonials', (req, res) => {
    res.render('testimonials', {
        testimonials: readTestimonials().filter(t => t.approved)
    });
});

app.get('/api/testimonials', (req, res) => {
    res.json(readTestimonials().filter(t => t.approved));
});

app.get('/api/pending-testimonials', (req, res) => {
    const adminData = readAdminData();
    res.json(adminData.pendingTestimonials);
});

app.post('/submit-testimonial', (req, res) => {
    const { name, photo, message, email } = req.body;

    if (!name || !message) {
        return res.status(400).json({
            success: false,
            message: 'Name and message are required'
        });
    }

    const adminData = readAdminData();
    const newTestimonial = {
        id: Date.now().toString(),
        name,
        photo: photo || null,
        message,
        date: new Date().toISOString(),
        approved: false
    };

    adminData.pendingTestimonials.unshift(newTestimonial);
    writeAdminData(adminData);

    transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: 'New Testimonial Needs Approval',
        html: `<p>New testimonial from ${name}:</p>
               <p>${message}</p>
               <p><a href="${DOMAIN}/admin">Review now</a></p>`,
    }).catch(err => console.log('Email notify error:', err));

    res.json({
        success: true,
        message: 'Thank you for your testimonial! It will be visible after approval.',
        testimonial: newTestimonial
    });
});

app.get('/api/portfolio', (req, res) => {
    res.json(readPortfolio());
});

// ✅ New route using multer for image file upload
app.post('/api/upload', upload.single('image'), (req, res) => {
    const { title, description } = req.body;
    const file = req.file;

    if (!title || !description || !file) {
        return res.status(400).json({ success: false, message: 'Missing fields or image' });
    }

    const portfolio = readPortfolio();
    const newItem = {
        id: Date.now().toString(),
        title,
        description,
        image: '/uploads/' + file.filename
    };

    portfolio.unshift(newItem);
    writePortfolio(portfolio);

    res.json({ success: true, message: 'Portfolio item added!', item: newItem });
});

app.post('/admin/login', (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, message: "Login successful!" });
    } else {
        res.status(401).json({ success: false, message: "Wrong password!" });
    }
});

app.post('/admin/approve-testimonial', (req, res) => {
    const { password, id } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false });
    }

    const adminData = readAdminData();
    const testimonialIndex = adminData.pendingTestimonials.findIndex(t => t.id === id);

    if (testimonialIndex === -1) {
        return res.status(404).json({ success: false });
    }

    const [testimonial] = adminData.pendingTestimonials.splice(testimonialIndex, 1);
    testimonial.approved = true;
    writeAdminData(adminData);

    const testimonials = readTestimonials();
    testimonials.unshift(testimonial);
    writeTestimonials(testimonials);

    res.json({ success: true });
});

app.post('/admin/reject-testimonial', (req, res) => {
    const { password, id } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false });
    }

    const adminData = readAdminData();
    adminData.pendingTestimonials = adminData.pendingTestimonials.filter(t => t.id !== id);
    writeAdminData(adminData);

    res.json({ success: true });
});

app.post('/admin/delete-portfolio', (req, res) => {
    const { password, id } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: "Invalid password" });
    }

    try {
        const portfolio = readPortfolio();
        const updatedPortfolio = portfolio.filter(item => item.id !== id);
        writePortfolio(updatedPortfolio);

        res.json({ success: true });
    } catch (error) {
        console.error('Delete portfolio error:', error);
        res.status(500).json({
            success: false,
            message: "Server error during deletion"
        });
    }
});

app.get('/api/admin/testimonials', (req, res) => {
    const allTestimonials = {
        approved: readTestimonials().filter(t => t.approved),
        pending: readAdminData().pendingTestimonials
    };
    res.json(allTestimonials);
});

app.post('/send-message', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    try {
        await transporter.sendMail({
            from: `"Kafan Digitals" <${process.env.EMAIL_USER}>`,
            replyTo: `"${name}" <${email}>`,
            to: process.env.EMAIL_USER,
            subject: `Contact: ${subject}`,
            html: `<p>From: ${name} (${email})</p>
                   <p>Subject: ${subject}</p>
                   <p>${message.replace(/\n/g, '<br>')}</p>`
        });

        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
