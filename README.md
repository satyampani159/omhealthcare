# Om Health Care — Homeopathy & Acupuncture Clinic

**Live Website:** [https://omhealthcare.jo3.org](https://omhealthcare.jo3.org)

A full-stack clinic website built for **Om Health Care**, a homeopathy and acupuncture clinic in Rourkela, Odisha. The website presents the clinic professionally, explains available services, supports appointment booking, patient chat, reviews, and contact requests, and gives the admin a secure dashboard to manage everything.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Live Website](#live-website)
- [Key Features](#key-features)
- [Website Sections and Their Purpose](#website-sections-and-their-purpose)
- [Tech Stack](#tech-stack)
- [How the System Works](#how-the-system-works)
- [Backend Architecture](#backend-architecture)
- [MongoDB Data Flow](#mongodb-data-flow)
- [How Images Are Saved in Cloudinary](#how-images-are-saved-in-cloudinary)
- [Admin Panel and Security](#admin-panel-and-security)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Skills Used](#skills-used)
- [AI Tools Used for Design Assets](#ai-tools-used-for-design-assets)
- [Deployment Process](#deployment-process)
- [Setup and Running Locally](#setup-and-running-locally)
- [Future Improvements](#future-improvements)

---

## Project Overview

This project is a complete website and backend system for a clinic that provides **homeopathy** and **acupuncture** treatment. It is designed to help patients understand the clinic, book appointments, contact the doctor, submit reviews, and share issues through a chat form. The backend stores and manages all submitted data using MongoDB, while uploaded images are hosted through Cloudinary.

The project combines:
- a responsive public website
- a secure Node.js + Express backend
- MongoDB database integration
- Cloudinary image hosting
- an admin dashboard
- custom domain deployment through GitHub Pages

---

## Live Website

You can open the website directly here:

**[https://omhealthcare.jo3.org](https://omhealthcare.jo3.org)**

If the custom domain is still propagating, the same site can also be opened through the GitHub Pages address linked to this repository.

---

## Key Features

- Responsive clinic landing page
- Homeopathy and acupuncture service showcase
- Doctor profile section
- Appointment booking form
- Doctor chat / consultation request form
- Review and rating system
- Contact section with phone, email, and map link
- Admin login and dashboard
- Real-time clinic open/closed status
- MongoDB-based form submission storage
- Cloudinary-based image storage
- Rate limiting and caching for performance
- Custom domain deployment support

---

## Website Sections and Their Purpose

### 1. Navbar
The navbar gives quick access to the main sections of the website: Home, Services, Conditions, Book, Reviews, and Contact. It also includes an Admin button for dashboard access.

**Purpose:** easy navigation and quick action access.

### 2. Hero Section
This is the first visual section users see. It introduces the clinic, highlights experience, shows live status, and offers booking/chat buttons.

**Purpose:** create trust and encourage the user to act immediately.

### 3. Services Section
This section lists the main clinic services such as consultation, acupuncture therapy, chat support, and booking.

**Purpose:** explain what the clinic offers.

### 4. Doctor Profile Section
This section presents the doctor’s background, qualifications, experience, and expertise.

**Purpose:** build credibility and confidence.

### 5. Conditions Section
This section lists the health issues the clinic can support.

**Purpose:** help users understand whether the clinic is relevant to their needs.

### 6. Appointment Section
This form collects patient details such as name, phone number, date, time, service, and note.

**Purpose:** allow online appointment booking.

### 7. Chat Section
This section allows the patient to send a problem description and optionally upload an image.

**Purpose:** support early consultation and problem review.

### 8. Reviews Section
Patients can submit ratings and written feedback.

**Purpose:** build social proof and patient trust.

### 9. Contact Section
This section includes contact details and a map link.

**Purpose:** make it easy to call, email, or visit the clinic.

### 10. Admin Dashboard
The admin view allows the clinic owner to view all submitted records and control the clinic status.

**Purpose:** centralize management in a secure interface.

---

## Tech Stack

### Frontend
- HTML5
- CSS3
- Bootstrap 5
- Bootstrap Icons
- Vanilla JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Media Storage
- Cloudinary

### Security and Utilities
- dotenv
- cors
- express-rate-limit
- crypto
- multer

### Development Tools
- nodemon

---

## How the System Works

The application follows a standard full-stack flow:

1. The user interacts with the frontend.
2. The frontend sends a request to the backend API.
3. Express receives and processes the request.
4. The backend validates the data.
5. MongoDB stores the submitted record.
6. Cloudinary stores uploaded images and returns a URL.
7. The backend responds to the frontend.
8. The UI updates accordingly.

---

## Backend Architecture

The backend is built using Node.js and Express, with MongoDB for persistent storage and Cloudinary for media hosting.

### Main backend responsibilities
- serve static frontend files
- accept form submissions
- store appointment, chat, contact, and review data
- manage clinic status
- provide admin dashboard data
- secure the admin login route
- protect API routes with rate limiting
- optimize repeated reads using caching

### Route structure
The backend exposes separate routes for each kind of form submission and dashboard access. Mongoose models are used to keep the database structure clean and organized.

The backend uses environment variables for:
- MongoDB connection
- admin password
- Cloudinary credentials
- server port

---

## MongoDB Data Flow

MongoDB stores each kind of submission in its own collection.

### Collections used

#### `appointments`
Stores appointment booking data:
- name
- phone
- email
- service
- date
- time
- note
- createdAt

#### `chats`
Stores doctor chat requests:
- name
- contact
- issue
- image
- createdAt

#### `contacts`
Stores general contact messages:
- name
- phone
- email
- message
- createdAt

#### `reviews`
Stores patient reviews:
- name
- rating
- text
- createdAt

#### `statuses`
Stores the clinic open/closed flag:
- key
- isOpen
- updatedAt

### Why MongoDB was used
- flexible document structure
- simple integration with Mongoose
- easy to scale
- easy to query for dashboard data

---

## How Images Are Saved in Cloudinary

The chat form supports image upload. Instead of storing image files directly in MongoDB, the project uses Cloudinary.

### Image upload flow
1. The user selects an image in the chat form.
2. The frontend sends the image to the backend.
3. The backend uploads it to Cloudinary.
4. Cloudinary returns a hosted image URL.
5. The backend stores that URL in MongoDB.

### Why Cloudinary is used
- keeps database small
- provides fast image delivery
- supports CDN-based access
- allows future image transformations and optimization
- avoids storing large binary files in the database

---

## Admin Panel and Security

The admin section is protected and meant for internal use only.

### Authentication
- Admin password is stored in `.env`
- Login is checked server-side
- A session token is created after successful login

### Protection
- Admin routes require a valid token
- Rate limiting helps prevent abuse
- API traffic is limited to reduce spam and brute-force attempts

### Performance features
- short-term in-memory caching for repeated dashboard/public requests
- reduced unnecessary database reads
- optimized status handling

---

## Project Structure

```bash
om-clinic/
├── public/
│   └── index.html
├── server.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
└── README.md
```

---

## Environment Variables

Create a `.env` file with the following values:

```env
MONGODB_URI=your_mongodb_connection_string
ADMIN_PASSWORD=your_admin_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=3000
```

### Important
Do not commit `.env` to GitHub.

---

## API Endpoints

### Public routes

#### `POST /api/appointments`
Saves appointment bookings.

#### `POST /api/chats`
Saves consultation requests and uploaded image URLs.

#### `POST /api/contacts`
Saves contact form submissions.

#### `POST /api/reviews`
Saves patient ratings and reviews.

#### `GET /api/status`
Returns the current clinic open/closed status.

#### `GET /api/health`
Returns server and database health information.

### Admin routes

#### `POST /api/admin/login`
Authenticates the admin.

#### `POST /api/admin/logout`
Ends the admin session.

#### `GET /api/admin/all`
Fetches all dashboard data in one request.

#### `PATCH /api/admin/status`
Updates clinic open/closed status.

---

## Skills Used

### Frontend Skills
- semantic HTML structure
- responsive page layout
- Bootstrap grid and components
- custom CSS styling
- section design and spacing
- form creation
- icon usage
- image presentation
- mobile-first UI planning

### Backend Skills
- Express server setup
- REST API design
- route handling
- request parsing
- middleware usage
- server-side validation
- admin authentication flow
- rate limiting
- static file hosting
- environment variable management

### Database Skills
- MongoDB schema design
- Mongoose models
- CRUD operations
- document-based storage
- dashboard data aggregation

### Media and Storage Skills
- Cloudinary integration
- image upload workflow
- hosted media URL saving
- external asset management

### General Development Skills
- project structuring
- debugging
- deployment preparation
- security-aware configuration
- environment separation between development and production

---

## AI Tools Used for Design Assets

The logo and image modifications for this project were created and improved using **Gemini**.

Gemini was used for:
- logo creation
- image enhancement
- visual refinement
- image modification support

This helped produce polished visual assets for the clinic website.

---

## Deployment Process

The project is deployed using:

- **GitHub Pages** for the frontend
- **Render** for the backend
- **MongoDB Atlas** for the database
- **Cloudinary** for image storage
- **DNSExit** for custom domain management

### 1. Frontend deployment on GitHub Pages
The frontend is deployed from the GitHub repository as a static site.

Steps:
1. Push the frontend files to GitHub.
2. Make sure `index.html` is in the repository root for GitHub Pages.
3. Open **Settings → Pages** in GitHub.
4. Select the branch and root folder.
5. Save the settings.
6. Add the custom domain if needed.

### 2. Backend deployment on Render
The backend is deployed as a Node.js web service.

Steps:
1. Push the backend code to GitHub.
2. Connect the repository to Render.
3. Use `npm start` as the start command.
4. Add all environment variables in Render.
5. Deploy the service.
6. Copy the live backend URL and use it in the frontend API requests.

### 3. MongoDB setup
1. Create a MongoDB Atlas cluster.
2. Add the database user and password.
3. Copy the connection string.
4. Add it to `.env` locally and to Render environment variables.

### 4. Cloudinary setup
1. Create a Cloudinary account.
2. Copy cloud name, API key, and API secret.
3. Add them to `.env` and Render variables.
4. Use Cloudinary to upload and serve clinic images.

### 5. Custom domain setup with DNSExit
The domain is configured through DNSExit.

Current setup:
- A records point the root domain to GitHub Pages IP addresses
- CNAME maps `www` to `satyampani159.github.io`
- TTL is kept low during setup for faster propagation

### 6. HTTPS on GitHub Pages
After DNS verification, GitHub issues the SSL certificate and enables HTTPS automatically. This may take some time after DNS is correctly configured.

---

## Setup and Running Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env`
Add your MongoDB, Cloudinary, and admin values.

### 3. Start the development server
```bash
npm run dev
```

### 4. Start production mode locally
```bash
npm start
```

### 5. Open the site
```bash
http://localhost:3000
```

---

## Future Improvements

- JWT-based authentication
- real-time chat support
- appointment notifications
- email alerts for new submissions
- image compression before upload
- dashboard analytics
- pagination for large data sets
- custom contact form confirmation messages

---

## Summary

This project is a complete clinic website solution that combines:
- a polished public-facing website
- online appointment booking
- patient chat and image upload
- reviews and contact forms
- secure backend APIs
- MongoDB storage
- Cloudinary image hosting
- admin dashboard access
- GitHub Pages + Render deployment
- custom domain support

It is designed to be practical, scalable, and easy to maintain.
