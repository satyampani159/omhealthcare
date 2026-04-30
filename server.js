// ============================================================
//  Om Homeopathy & Acupuncture Clinic — Express Backend
// ============================================================
require('dotenv').config();
const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const path         = require('path');
const crypto       = require('crypto');
const rateLimit    = require('express-rate-limit');
const cloudinary   = require('cloudinary').v2;

// ── Cloudinary Config ─────────────────────────────────────────
cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
});

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Rate Limiters ─────────────────────────────────────────────
// Login: max 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API: max 100 requests per minute per IP (protects all routes)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/', apiLimiter);                            // general API protection
app.use(express.static(path.join(__dirname, 'public')));

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
  image:     { type: String },
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

const Appointment = mongoose.model('Appointment', appointmentSchema);
const Chat        = mongoose.model('Chat',        chatSchema);
const Contact     = mongoose.model('Contact',     contactSchema);
const Review      = mongoose.model('Review',      reviewSchema);
const Status      = mongoose.model('Status',      statusSchema);

mongoose.connection.once('open', async () => {
  await Status.findOneAndUpdate(
    { key: 'clinic_status' },
    { $setOnInsert: { isOpen: true } },
    { upsert: true, new: true }
  );
});

// ════════════════════════════════════════════════════════════════
//  IN-MEMORY CACHE
//  Public endpoints: 30s TTL  |  Admin dashboard: 10s TTL
// ════════════════════════════════════════════════════════════════
const cache = {
  status:   { data: null, ts: 0 },
  reviews:  { data: null, ts: 0 },
  adminAll: { data: null, ts: 0 },
};
const TTL_PUBLIC = 30_000;
const TTL_ADMIN  = 10_000;

const isFresh = (entry, ttl) => entry.data !== null && (Date.now() - entry.ts) < ttl;
const bust    = (...keys) => keys.forEach(k => { cache[k] = { data: null, ts: 0 }; });

// ════════════════════════════════════════════════════════════════
//  ADMIN AUTH  — password lives in .env, never in source code
// ════════════════════════════════════════════════════════════════
const sessions = new Set();   // active tokens (in-memory)

// POST /api/admin/login
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Incorrect password' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  sessions.add(token);
  res.json({ success: true, token });
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  sessions.delete(req.headers['x-admin-token']);
  res.json({ success: true });
});

// ── Middleware: protect all admin data routes ─────────────────
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ success: false, error: 'Unauthorised' });
  }
  next();
}

// ════════════════════════════════════════════════════════════════
//  PUBLIC CUSTOMER ROUTES
// ════════════════════════════════════════════════════════════════

// GET /api/health  — platform health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status:  'ok',
    uptime:  Math.floor(process.uptime()) + 's',
    db:      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// GET /api/status  — clinic open/closed, cached 30s
app.get('/api/status', async (req, res) => {
  try {
    if (isFresh(cache.status, TTL_PUBLIC))
      return res.json({ success: true, isOpen: cache.status.data });
    const doc    = await Status.findOne({ key: 'clinic_status' }).lean();
    const isOpen = doc ? doc.isOpen : true;
    cache.status = { data: isOpen, ts: Date.now() };
    res.json({ success: true, isOpen });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// GET /api/reviews  — only reviews for customer page, cached 30s
app.get('/api/reviews', async (req, res) => {
  try {
    if (isFresh(cache.reviews, TTL_PUBLIC))
      return res.json({ success: true, data: cache.reviews.data });
    const reviews   = await Review.find().sort({ createdAt: -1 }).lean();
    cache.reviews   = { data: reviews, ts: Date.now() };
    res.json({ success: true, data: reviews });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// POST /api/appointments
app.post('/api/appointments', async (req, res) => {
  try {
    const doc = await Appointment.create(req.body);
    bust('adminAll');
    res.status(201).json({ success: true, data: doc });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

// POST /api/chats
app.post('/api/chats', async (req, res) => {
  try {
    const { name, contact, issue, image } = req.body;
    let imageUrl = '';

    // If a base64 image was sent, upload it to Cloudinary
    if (image && image.startsWith('data:')) {
      const uploaded = await cloudinary.uploader.upload(image, {
        folder:         'om-clinic/chats',
        transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }]
      });
      imageUrl = uploaded.secure_url;
    }

    const doc = await Chat.create({ name, contact, issue, image: imageUrl });
    bust('adminAll');
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/contacts
app.post('/api/contacts', async (req, res) => {
  try {
    const doc = await Contact.create(req.body);
    bust('adminAll');
    res.status(201).json({ success: true, data: doc });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

// POST /api/reviews
app.post('/api/reviews', async (req, res) => {
  try {
    const doc = await Review.create(req.body);
    bust('adminAll', 'reviews');
    res.status(201).json({ success: true, data: doc });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
//  PROTECTED ADMIN ROUTES  (x-admin-token header required)
// ════════════════════════════════════════════════════════════════

// GET /api/admin/all  — full dashboard, cached 10s
app.get('/api/admin/all', requireAdmin, async (req, res) => {
  try {
    if (isFresh(cache.adminAll, TTL_ADMIN))
      return res.json({ success: true, data: cache.adminAll.data });

    const [appointments, chats, contacts, reviews, statusDoc] = await Promise.all([
      Appointment.find().sort({ createdAt: -1 }).lean(),
      Chat.find().sort({ createdAt: -1 }).lean(),
      Contact.find().sort({ createdAt: -1 }).lean(),
      Review.find().sort({ createdAt: -1 }).lean(),
      Status.findOne({ key: 'clinic_status' }).lean()
    ]);

    const payload = {
      appointments, chats, contacts, reviews,
      isOpen: statusDoc ? statusDoc.isOpen : true,
      counts: {
        appointments: appointments.length,
        chats:        chats.length,
        contacts:     contacts.length,
        reviews:      reviews.length
      }
    };
    cache.adminAll = { data: payload, ts: Date.now() };
    res.json({ success: true, data: payload });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// PATCH /api/admin/status
app.patch('/api/admin/status', requireAdmin, async (req, res) => {
  try {
    const doc     = await Status.findOne({ key: 'clinic_status' });
    doc.isOpen    = !doc.isOpen;
    doc.updatedAt = new Date();
    await doc.save();
    bust('status', 'adminAll');
    res.json({ success: true, isOpen: doc.isOpen });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// DELETE /api/appointments/:id
app.delete('/api/appointments/:id', requireAdmin, async (req, res) => {
  try {
    const doc = await Appointment.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
    bust('adminAll');
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// DELETE /api/chats/:id
app.delete('/api/chats/:id', requireAdmin, async (req, res) => {
  try {
    const doc = await Chat.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: 'Not found' });

    // Remove image from Cloudinary if it exists
    if (doc.image && doc.image.includes('cloudinary.com')) {
      const parts  = doc.image.split('/');
      const file   = parts[parts.length - 1].split('.')[0];
      const folder = parts[parts.length - 2];
      await cloudinary.uploader.destroy(`${folder}/${file}`).catch(() => {});
    }

    bust('adminAll');
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ── Catch-all ─────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀  Server running at http://localhost:${PORT}`);
});
