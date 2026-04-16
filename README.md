🗓️ Calcom Clone - Full-Stack Scheduling Platform
A full-stack, open-source scheduling infrastructure designed to simplify meeting bookings. This project mimics the core functionality of Cal.com, allowing users to manage their availability, create custom event types, and provide a seamless booking experience for clients.
🚀 Live Links
Frontend (Production): https://calcom-clone-navy.vercel.app

Backend API: https://calcom-clone-ywsp.onrender.com

🛠️ Tech Stack & Tools
Frontend
Framework: Next.js 15 (App Router)

Language: TypeScript (Strict Type Checking)

Styling: Tailwind CSS (Responsive Design)

Icons: Lucide-React

Date Management: date-fns (Slot calculation & formatting)

Backend
Runtime: Node.js

Framework: Express.js

Database: PostgreSQL (Supabase)

Middleware: CORS, Body-Parser

Deployment: Render (Web Service)

Database (Supabase)
Architecture: Relational Schema (PostgreSQL)

Tables: event_types, availability, bookings.

✨ Key Features
Dynamic Event Types: Create custom meetings (e.g., "15 Min Discovery," "1 Hour Consultation") with unique URL slugs.

Smart Availability: Set global working hours and toggle specific days of the week on/off.

Conflict-Free Booking: Automatically calculates available time slots by checking existing bookings and adding user-defined buffer times.

Responsive Dashboard: A clean, indigo-themed interface for managing upcoming, past, and cancelled bookings.

Public Booking Page: A seamless user flow for guests to select dates, times, and confirm appointments.

🏗️ Architecture & Data Flow
Frontend (Vercel) sends a request to the Backend (Render) using Environment Variables (NEXT_PUBLIC_API_URL).

Backend validates the request and queries the Supabase (PostgreSQL) database.

CORS Policy ensures only the authorized Vercel domain can interact with the API.

Data is returned as JSON to the client-side for dynamic rendering.

⚙️ Installation & Local Setup
1. Clone the Repository
Bash
git clone https://github.com/richamaitry248/calcom-clone.git
cd calcom-clone
2. Setup Backend
Bash
cd backend
npm install
# Create a .env file and add your Supabase credentials:
# DB_USER, DB_PASSWORD, DB_HOST, DB_NAME
npm start
3. Setup Frontend
Bash
cd ../frontend
npm install
# Create a .env.local file:
npm run dev
🚀 Deployment Commands Used
To keep the production environment synced with local changes, the following CI/CD workflow was used:

PowerShell
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: implement dynamic slot calculation and production CORS"

# Push to GitHub (Triggers auto-build on Vercel & Render)
git push
📝 Troubleshooting Note (Free Tier)
This project is hosted on Render's Free Tier. If the site shows a "Network Error" on the first load, please allow 30-60 seconds for the backend instance to spin up from its idle state.
