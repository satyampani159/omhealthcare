# Om Health Care — Full Stack Clinic Website

A full-stack web application for **Om Health Care**, a homeopathy and acupuncture clinic in Rourkela, Odisha. The website presents the clinic’s services to patients, allows people to book appointments, send consultation requests, submit reviews, and contact the clinic, while the backend stores and manages all data securely through MongoDB and Cloudinary.

---

## Table of Contents

- [Project Purpose](#project-purpose)
- [Key Features](#key-features)
- [Website Sections and Why They Exist](#website-sections-and-why-they-exist)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [How the Backend Works](#how-the-backend-works)
- [MongoDB Data Flow](#mongodb-data-flow)
- [How Images Are Saved in Cloudinary](#how-images-are-saved-in-cloudinary)
- [Admin Panel and Security](#admin-panel-and-security)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Skills Used](#skills-used)
- [AI Tools Used for Design Assets](#ai-tools-used-for-design-assets)
- [Setup and Running Locally](#setup-and-running-locally)
- [Future Improvements](#future-improvements)

---

## Project Purpose

The purpose of this website is to digitize the clinic workflow and make it easier for patients to connect with the clinic online. The platform is designed to:

- present the clinic professionally
- explain the treatments and conditions handled by the clinic
- allow appointment booking online
- support patient consultation requests
- collect feedback and reviews
- show the current clinic status as open or closed
- give the admin a dashboard to manage all submitted records

This project combines a clean public-facing frontend with a secure backend, database storage, and media upload support.

---

## Key Features

- Modern responsive landing page for the clinic
- Homeopathy and acupuncture service presentation
- Appointment booking form
- Doctor chat / consultation request form
- General contact form
- Patient review and rating system
- Admin login and dashboard access
- Live clinic open/closed status
- MongoDB-based data storage
- Cloudinary-based image storage
- Rate limiting for better protection
- In-memory caching for faster responses

---

## Website Sections and Why They Exist

### 1. Header / Navbar
The navbar gives users quick access to the main areas of the website such as Home, Services, Conditions, Book, Reviews, and Contact. It also includes an Admin button for dashboard access.  
**Why it exists:** to improve navigation and make the site easy to use on desktop and mobile.

### 2. Hero Section
The hero section introduces the clinic, highlights experience, and shows the live status indicator. It also contains the main call-to-action buttons for booking or chatting.  
**Why it exists:** to create a strong first impression and guide the user toward action immediately.

### 3. Services Section
This section explains the types of treatment available, especially homeopathy consultation and acupuncture treatment.  
**Why it exists:** to show what the clinic offers and build trust before the patient books anything.

### 4. Conditions Section
This section describes the health concerns the clinic can help with.  
**Why it exists:** to help users quickly understand whether the clinic is relevant to their needs.

### 5. Appointment Section
This form collects booking information such as name, phone, service, date, time, and note.  
**Why it exists:** to let patients book appointments online instead of calling manually.

### 6. Chat / Consultation Section
This form lets patients send their issue details and optionally attach an image.  
**Why it exists:** to support remote consultation and help the doctor review patient concerns in advance.

### 7. Reviews Section
This section allows patients to submit star ratings and feedback.  
**Why it exists:** to build credibility and display social proof.

### 8. Contact Section
This form is for general enquiries, messages, or follow-up communication.  
**Why it exists:** to give users a simple way to reach the clinic.

### 9. Footer / Contact Details
The website displays the clinic’s phone number, email, and location-related information.  
**Why it exists:** to make direct communication and visit planning easier.

### 10. Admin Dashboard
The admin system is used to view and manage appointments, chats, contacts, reviews, and clinic status.  
**Why it exists:** to centralize backend management in one secure place.

---

## Technology Stack

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

### File and Media Handling
- Cloudinary

### Security and Utility
- dotenv
- cors
- express-rate-limit
- crypto
- multer

### Development Tooling
- nodemon

---

## System Architecture

The application follows a simple full-stack flow:

1. The user interacts with the frontend website.
2. A form submission or action sends a request to the Express backend.
3. The backend validates and stores the data.
4. MongoDB stores the text-based records.
5. Cloudinary stores the images and returns a URL.
6. The backend sends a response back to the frontend.
7. The frontend updates the UI based on the response.

This architecture keeps the public UI fast and the backend organized.

---

## How the Backend Works

The backend is built using Express and Mongoose. It performs the following tasks:

### 1. Loads Environment Variables
The application reads secrets and configuration from `.env` using `dotenv`.

### 2. Initializes the Server
Express creates the HTTP server and listens on the configured port.

### 3. Applies Middleware
The backend uses middleware for:
- JSON body parsing
- URL-encoded body parsing
- CORS
- static file serving
- rate limiting on API routes

### 4. Connects to MongoDB Atlas
The backend connects to MongoDB using the connection string stored in `MONGODB_URI`.

### 5. Defines Mongoose Schemas
Each type of form data has its own schema and model:
- Appointment
- Chat
- Contact
- Review
- Status

### 6. Provides API Routes
The backend exposes POST routes for saving customer requests and GET/PATCH routes for admin and clinic status management.

### 7. Handles Admin Authentication
The backend checks the admin password from environment variables and creates a session token for the admin panel.

### 8. Protects Important Routes
Admin-only routes are protected by token validation.

### 9. Optimizes Performance
The backend uses rate limiting and in-memory caching to reduce load and improve speed.

---

## MongoDB Data Flow

MongoDB is the main database for the project. It stores all submitted data as documents.

### Collections Used

#### `appointments`
Stores booking form data:
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
Stores enquiry messages:
- name
- phone
- email
- message
- createdAt

#### `reviews`
Stores patient feedback:
- name
- rating
- text
- createdAt

#### `statuses`
Stores the current clinic status:
- key
- isOpen
- updatedAt

### Why MongoDB Was Used
MongoDB is a good fit for this project because:
- the data is document-based
- the forms have flexible fields
- the application needs quick inserts and reads
- the backend is easy to maintain with Mongoose models

---

## How Images Are Saved in Cloudinary

The project uses Cloudinary to store uploaded images instead of saving large files directly in the database.

### Image Saving Process

1. The user uploads an image from the frontend.
2. The backend receives the image data.
3. Cloudinary is configured with the account credentials from `.env`.
4. The backend uploads the image to Cloudinary.
5. Cloudinary returns a hosted image URL.
6. The backend stores that URL in MongoDB.

### Why Cloudinary Is Used
Cloudinary is used because it:
- stores images externally and efficiently
- reduces database size
- provides CDN-based fast delivery
- supports optimization and transformation of images
- avoids storing large binary data inside MongoDB

### Result
The database stores the image link, while the actual image lives securely in Cloudinary.

---

## Admin Panel and Security

The admin panel is designed for internal use only.

### Authentication
- Admin login is validated using an environment variable password.
- A token is generated after successful login.
- The token is kept in an in-memory session set.

### Route Protection
Protected admin routes require a valid token in the request headers.

### Rate Limiting
The backend includes protection against abuse:
- login attempts are limited
- API traffic is rate-limited

### Clinic Status
The clinic status is stored in MongoDB as a single document so the admin can control whether the site shows the clinic as open or closed.

### Caching
Some data is cached in memory for a short duration to improve performance:
- public status data
- reviews
- admin dashboard data

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

Create a `.env` file and add the required values below.

```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
ADMIN_PASSWORD=your_admin_password

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Important
Do not commit the `.env` file to version control.

---

## API Endpoints

### Public / Customer Routes

#### `POST /api/appointments`
Stores appointment booking information.

#### `POST /api/chats`
Stores chat / consultation requests.

#### `POST /api/contacts`
Stores general contact form submissions.

#### `POST /api/reviews`
Stores reviews and ratings from patients.

#### `GET /api/status`
Returns the current clinic open/closed status.

#### `GET /api/health`
Returns server and database health information.

### Admin Routes

#### `POST /api/admin/login`
Authenticates the admin using the password stored in `.env`.

#### `POST /api/admin/logout`
Ends the admin session.

#### `GET /api/admin/all`
Fetches all dashboard data in one request.

#### `PATCH /api/admin/status`
Updates the clinic open/closed status.

---

## Skills Used

This project was developed using a combination of frontend, backend, database, and deployment-oriented skills.

### Frontend Skills
- semantic HTML structure
- responsive layout design
- Bootstrap-based UI development
- custom CSS styling
- mobile-friendly design
- section-based content organization
- form UI implementation
- icon integration
- image placement and presentation

### Backend Skills
- REST API design
- Express server setup
- route handling
- middleware configuration
- form data processing
- authentication logic
- rate limiting
- caching logic
- static file serving

### Database Skills
- MongoDB collection design
- Mongoose schema creation
- data validation
- CRUD operations
- document-based storage design

### Media / Storage Skills
- Cloudinary integration
- image upload workflow
- hosted media URL storage
- optimized asset delivery

### General Engineering Skills
- environment variable management
- project structuring
- secure secret handling
- debugging and integration
- modular full-stack development

---

## AI Tools Used for Design Assets

The logo and image modifications for the project were created and improved using **Gemini**.  
Gemini was used for:
- logo creation
- image enhancement
- visual refinements
- design iteration support

This helped speed up the branding and visual asset workflow while keeping the site presentation polished.

---

## Setup and Running Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Add your environment variables
Create `.env` using the template shown above.

### 3. Start the development server
```bash
npm run dev
```

### 4. Start the production server
```bash
npm start
```

### 5. Open the site
```bash
http://localhost:3000
```

---

## Future Improvements

Possible upgrades for the next version:

- JWT-based admin authentication
- real-time chat system
- image compression before upload
- pagination in admin dashboard
- email notifications for new bookings
- payment integration
- separate dashboard analytics
- database indexing for large-scale use

---

## Summary

This project is a complete clinic website solution that combines:
- a professional public website
- online booking and contact forms
- patient chat and reviews
- MongoDB-based storage
- Cloudinary image hosting
- secure admin management
- performance and security safeguards

It is built to support both patient convenience and clinic administration in a structured, maintainable way.
