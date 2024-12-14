const express = require('express');
const mongoose = require('mongoose');
const app = express();

const PORT = 3000;

// MongoDB Connection
mongoose.connect('mongodb+srv://antoniobeckfordofficial:whatisthat242@cluster0.jfjay.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Define Business Schema with Validation
const businessSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    category: {
        type: String,
        required: true,
        trim: true,
        enum: ['Restaurant', 'Technology', 'Retail', 'Art', 'Other'],
        default: 'Other',
    },
});

const Business = mongoose.model('Business', businessSchema);

// Routes

// Home Route
app.get('/', (req, res) => {
    res.send('Welcome to the Bahamian Business Directory!');
});

// Get All Businesses with Pagination, Search, and Filter
app.get('/businesses', async (req, res) => {
    try {
        const { name, category, page = 1, limit = 5 } = req.query; // Default to page 1, 5 items per page
        const filter = {};

        if (name) filter.name = { $regex: name, $options: 'i' }; // Case-insensitive name search
        if (category) filter.category = category;

        const businesses = await Business.find(filter)
            .skip((page - 1) * limit) // Skip documents for previous pages
            .limit(parseInt(limit)); // Limit results per page

        const total = await Business.countDocuments(filter); // Total number of matching businesses
        const totalPages = Math.ceil(total / limit);

        res.json({ businesses, totalPages, currentPage: parseInt(page) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch businesses' });
    }
});



// Add a New Business
app.post('/businesses', async (req, res) => {
    try {
        const newBusiness = new Business(req.body);
        await newBusiness.save();
        res.status(201).json(newBusiness);
    } catch (err) {
        if (err.name === 'ValidationError') {
            res.status(400).json({ error: 'Invalid input: Check category or other fields.' });
        } else {
            res.status(500).json({ error: 'Failed to add business.' });
        }
    }
});

// Update a Business by ID
app.put('/businesses/:id', async (req, res) => {
    try {
        const updatedBusiness = await Business.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the updated document
            runValidators: true, // Validate the updated data
        });
        if (!updatedBusiness) return res.status(404).json({ error: 'Business not found' });
        res.json(updatedBusiness);
    } catch (err) {
        if (err.name === 'ValidationError') {
            res.status(400).json({ error: 'Invalid input: Check category or other fields.' });
        } else {
            res.status(500).json({ error: 'Failed to update business.' });
        }
    }
});

// Delete a Business by ID
app.delete('/businesses/:id', async (req, res) => {
    try {
        const deletedBusiness = await Business.findByIdAndDelete(req.params.id);
        if (!deletedBusiness) return res.status(404).json({ error: 'Business not found' });
        res.json({ message: 'Business deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete business.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
