const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const uploadsPath = path.join(__dirname, '../public/uploads');
const portfolioFile = path.join(__dirname, '../data/portfolio.json');

// Ensure uploads folder exists
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsPath),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// POST /api/upload (add new portfolio item)
router.post('/upload', upload.single('image'), (req, res) => {
    const { title, description } = req.body;
    const file = req.file;

    if (!file || !title || !description) {
        return res.status(400).json({ success: false, message: 'Missing fields or image' });
    }

    const imagePath = '/uploads/' + file.filename;

    // Read existing portfolio.json
    let portfolio = [];
    if (fs.existsSync(portfolioFile)) {
        const raw = fs.readFileSync(portfolioFile);
        try {
            portfolio = JSON.parse(raw);
        } catch {
            portfolio = [];
        }
    }

    const newItem = {
        id: Date.now().toString(),
        title,
        description,
        image: imagePath
    };

    portfolio.push(newItem);
    fs.writeFileSync(portfolioFile, JSON.stringify(portfolio, null, 2));

    res.json({ success: true, message: 'Portfolio item saved!', item: newItem });
});

// GET /api/portfolio
router.get('/portfolio', (req, res) => {
    if (!fs.existsSync(portfolioFile)) {
        return res.json([]);
    }

    const data = fs.readFileSync(portfolioFile);
    try {
        const portfolio = JSON.parse(data);
        res.json(portfolio);
    } catch {
        res.status(500).json({ success: false, message: 'Invalid JSON in portfolio file' });
    }
});

module.exports = router;
