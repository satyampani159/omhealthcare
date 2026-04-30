# Om Clinic — Backend Integration Guide

## Folder Structure

```
om-clinic/
├── public/
│   └── index.html          ← your existing frontend (move it here)
├── server.js               ← Express backend (provided)
├── package.json            ← npm manifest (provided)
├── .env                    ← your secrets (create from .env.example)
└── .gitignore
```

---

## Step 1 — Install dependencies

```bash
npm install
```

---

## Step 2 — Set up your .env file

Copy `.env.example` to `.env` and fill in your MongoDB Atlas connection string:

```
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/omClinicDB?retryWrites=true&w=majority
PORT=3000
```

**Where to find your connection string:**
1. Open MongoDB Atlas → your cluster → **Connect**
2. Choose **Drivers** → Node.js
3. Copy the `mongodb+srv://…` string and paste it into `.env`

> MongoDB Compass and Atlas share the same cluster. The `MONGODB_URI` string
> is the same one Compass uses — just add it to `.env`.

---

## Step 3 — Move your frontend into /public

```bash
mkdir public
mv index.html public/
```

Express serves everything in `/public` automatically at the root URL.

---

## Step 4 — Replace the frontend script block

Open `public/index.html` and find the `<script>` tag at the very bottom
(just before `</body>`). Replace **everything** from `<script>` to
`</script>` (inclusive) with the contents of `frontend-script-replacement.html`.

No HTML, CSS, or layout changes are needed anywhere else.

---

## Step 5 — Add .gitignore

```
node_modules/
.env
```

---

## Step 6 — Run the server

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

Open `http://localhost:3000` — you should see your clinic site.

---

## API Endpoints Reference

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/appointments` | Save an appointment |
| `POST` | `/api/chats` | Save a doctor-chat request |
| `POST` | `/api/contacts` | Save a contact enquiry |
| `POST` | `/api/reviews` | Save a patient review |
| `GET` | `/api/admin/all` | Fetch all records for the dashboard |
| `GET` | `/api/status` | Get current open/closed status |
| `PATCH` | `/api/admin/status` | Toggle open/closed status |

---

## MongoDB Collections Created

| Collection | Purpose |
|------------|---------|
| `appointments` | Appointment booking form submissions |
| `chats` | Doctor chat/desk requests (with optional image) |
| `contacts` | General contact enquiries |
| `reviews` | Patient reviews with star ratings |
| `statuses` | Single document storing the clinic open/closed flag |

---

## Next Steps (optional improvements)

- **Real admin authentication:** Replace the `admin123` password check in the
  frontend with a `POST /api/admin/login` route that issues a JWT, and protect
  the `/api/admin/*` routes with a middleware that verifies the token.
- **Image uploads:** For production, replace the base64 image approach with
  `multer` + cloud storage (Cloudinary, AWS S3) to avoid storing large blobs
  in MongoDB.
- **Pagination:** Add `?page=` and `?limit=` query parameters to
  `GET /api/admin/all` as your data grows.
