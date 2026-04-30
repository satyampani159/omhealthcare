process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
require('dotenv').config();
// ... rest of your code

// ============================================================
//  Om Homeopathy & Acupuncture Clinic — Express Backend
// ============================================================
require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const path       = require('path');
const multer     = require('multer');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));        // large limit for base64 images
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // serve index.html from /public

// ── MongoDB Connection ────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅  MongoDB Atlas connected'))
  .catch(err => { console.error('❌  MongoDB connection error:', err); process.exit(1); });

// ── Mongoose Schemas & Models ─────────────────────────────────
const appointmentSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  phone:     { type: String, required: true, trim: true },
  email:     { type: String, trim: true },
  service:   { type: String, trim: true },
  date:      { type: String },
  time:      { type: String },
  note:      { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  contact:   { type: String, trim: true },
  issue:     { type: String, trim: true },
  image:     { type: String },           // base64 data-URL string
  createdAt: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  phone:     { type: String, trim: true },
  email:     { type: String, trim: true },
  message:   { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const reviewSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  rating:    { type: Number, min: 1, max: 5, required: true },
  text:      { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const statusSchema = new mongoose.Schema({
  key:       { type: String, default: 'clinic_status', unique: true },
  isOpen:    { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

// Compile models into a single "Responses" conceptual collection per type
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Chat        = mongoose.model('Chat',        chatSchema);
const Contact     = mongoose.model('Contact',     contactSchema);
const Review      = mongoose.model('Review',      reviewSchema);
const Status      = mongoose.model('Status',      statusSchema);

// ── Helper: ensure clinic status doc exists ───────────────────
async function ensureStatus() {
  await Status.findOneAndUpdate(
    { key: 'clinic_status' },
    { $setOnInsert: { isOpen: true } },
    { upsert: true, new: true }
  );
}
mongoose.connection.once('open', ensureStatus);

// ════════════════════════════════════════════════════════════════
//  CUSTOMER ROUTES  (POST — save form submissions)
// ════════════════════════════════════════════════════════════════

// POST /api/appointments
app.post('/api/appointments', async (req, res) => {
  try {
    const doc = await Appointment.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/chats
app.post('/api/chats', async (req, res) => {
  try {
    const doc = await Chat.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/contacts
app.post('/api/contacts', async (req, res) => {
  try {
    const doc = await Contact.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/reviews
app.post('/api/reviews', async (req, res) => {
  try {
    const doc = await Review.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
//  ADMIN ROUTES  (GET — fetch all documents for dashboard)
// ════════════════════════════════════════════════════════════════

// GET /api/admin/all  — returns everything the dashboard needs in one call
app.get('/api/admin/all', async (req, res) => {
  try {
    const [appointments, chats, contacts, reviews, statusDoc] = await Promise.all([
      Appointment.find().sort({ createdAt: -1 }).lean(),
      Chat.find().sort({ createdAt: -1 }).lean(),
      Contact.find().sort({ createdAt: -1 }).lean(),
      Review.find().sort({ createdAt: -1 }).lean(),
      Status.findOne({ key: 'clinic_status' }).lean()
    ]);

    res.json({
      success: true,
      data: {
        appointments,
        chats,
        contacts,
        reviews,
        isOpen: statusDoc ? statusDoc.isOpen : true,
        counts: {
          appointments: appointments.length,
          chats:        chats.length,
          contacts:     contacts.length,
          reviews:      reviews.length
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/status  — clinic open/closed (public, used by customer view)
app.get('/api/status', async (req, res) => {
  try {
    const doc = await Status.findOne({ key: 'clinic_status' }).lean();
    res.json({ success: true, isOpen: doc ? doc.isOpen : true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/status  — toggle open/closed from admin panel
app.patch('/api/admin/status', async (req, res) => {
  try {
    const doc = await Status.findOne({ key: 'clinic_status' });
    doc.isOpen    = !doc.isOpen;
    doc.updatedAt = new Date();
    await doc.save();
    res.json({ success: true, isOpen: doc.isOpen });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Catch-all: serve index.html for any unknown route ─────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Server running at http://localhost:${PORT}`);
});