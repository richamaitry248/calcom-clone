
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// 1. FIRST, tell Node to open the .env file and read the passwords
require('dotenv').config(); // Loads your .env file

const app = express();



// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://calcom-clone-navy.vercel.app" // MUST match your browser URL exactly
  ],
  credentials: true
}));
app.use(express.json()); // Allows us to read JSON data

// 2. THEN, wake up Resend (now it can actually see the password!)
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);





// Set up Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});


// Test Database Connection Route
app.get('/test-db', async (req, res) => {
    try {
        // This simple query just asks the database for the current time
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            message: 'Database connected perfectly!', 
            db_time: result.rows[0].now 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// A simple test route
app.get('/', (req, res) => {
    res.send('Cal.com Clone Backend is running!');
});


// --- API ROUTES ---

// 1. Get all Event Types
app.get('/api/event-types', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM event_types ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// 2. Create a new Event Type
app.post('/api/event-types', async (req, res) => {
    try {
        const { title, slug, description, duration ,buffer_time} = req.body;
        
        // $1, $2 etc. are safe placeholders to prevent SQL injection hackers
        const newEvent = await pool.query(
            'INSERT INTO event_types (title, slug, description, duration,buffer_time) VALUES ($1, $2, $3, $4,$5) RETURNING *',
            [title, slug, description, duration,buffer_time || 0]
        );
        
        res.json(newEvent.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create event type' });
    }
});

// --- DELETE an Event Type ---
app.delete('/api/event-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM event_types WHERE id = $1', [id]);
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error("Error deleting event:", err);
        res.status(500).json({ error: 'Failed to delete event type' });
    }
});

// --- UPDATE (Edit) an Event Type ---
app.put("/api/event-types/:id", async (req, res) => {
  const { id } = req.params;
  const { title, slug, description, duration, buffer_time } = req.body;

  try {
    // 1. CHECK FOR DUPLICATE SLUG (excluding the current event)
    const slugCheck = await pool.query(
      "SELECT id FROM event_types WHERE slug = $1 AND id != $2",
      [slug, id]
    );

    if (slugCheck.rows.length > 0) {
      return res.status(400).json({ 
        message: "This URL slug is already in use by another event." 
      });
    }

    // 2. UPDATE THE EVENT
    const result = await pool.query(
      "UPDATE event_types SET title = $1, slug = $2, description = $3, duration = $4, buffer_time = $5 WHERE id = $6 RETURNING *",
      [title, slug, description, duration, buffer_time, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ message: "Server error during update" });
  }
});

// --- AVAILABILITY ROUTES ---

// 1. Get Availability
app.get('/api/availability', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM availability ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// 2. Save Availability
app.post('/api/availability', async (req, res) => {
  try {
    const { schedule, timezone } = req.body; // Array of 7 day objects
    
    for (const day of schedule) {
      await pool.query(
        "UPDATE availability SET is_active = $1, start_time = $2, end_time = $3  ,timezone = $5 WHERE day_of_week = $4",
        [day.is_active, day.start_time, day.end_time, day.day_of_week,timezone]
      );
    }
    res.json({ message: "Availability updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

// 3. Get a single Event Type by its Slug (For the public booking page)
app.get('/api/event-types/slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await pool.query('SELECT * FROM event_types WHERE slug = $1', [slug]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// 4. Create a new Booking (When a guest confirms a time)
app.post('/api/bookings', async (req, res) => {
    try {
        const { event_type_id, guest_name, guest_email, start_time,end_time } = req.body;
        
        const newBooking = await pool.query(
            'INSERT INTO bookings (event_type_id, guest_name, guest_email, start_time,end_time) VALUES ($1, $2, $3, $4,$5) RETURNING *',
            [event_type_id, guest_name, guest_email, start_time,end_time]
        );
        
        const eventInfo = await pool.query('SELECT title FROM event_types WHERE id = $1', [event_type_id]);
        const eventTitle = eventInfo.rows[0].title;

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'richamaitry@gmail.com', 
            subject: `Confirmed: ${eventTitle} with ${guest_name}`,
            html: `
                <h1>Meeting Scheduled!</h1>
                <p>Hi Richa Maitry, a new meeting has been booked.</p>
                <ul>
                    <li><strong>Event:</strong> ${eventTitle}</li>
                    <li><strong>Guest:</strong> ${guest_name} (${guest_email})</li>
                    <li><strong>Time:</strong> ${start_time}</li>
                </ul>
                <p>Check your dashboard for more details.</p>
            `
        });

        res.json(newBooking.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// 5. Get all Bookings (For your Bookings Dashboard)
app.get('/api/bookings', async (req, res) => {
    try {
        // We use a JOIN to grab the Event Title alongside the booking data
        const result = await pool.query(`
            SELECT bookings.*, event_types.title as event_title 
            FROM bookings 
            JOIN event_types ON bookings.event_type_id = event_types.id 
            ORDER BY bookings.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});


// Add this to your server.js
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id); // Convert string to actual number
    const result = await pool.query('UPDATE bookings SET status = $1 WHERE id = $2',
      ['cancelled', id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error during deletion" });
  }
});

// 6. Get Booked Slots for a specific date (To prevent double booking)
app.get('/api/booked-slots', async (req, res) => {
    try {
        const { date } = req.query; 

        // 1. Let the Database do the formatting (Cleaner & Faster)
        // TO_CHAR converts the timestamp directly to "09:40" format
        const result = await pool.query(
            "SELECT TO_CHAR(start_time, 'HH24:MI') as slot FROM bookings WHERE start_time::date = $1",
            [date]
        );
        
        // 2. Map the results into a clean array: ["09:40", "10:00"]
        const bookedTimes = result.rows.map(row => row.slot);
        
        console.log(`Booked slots for ${date}:`, bookedTimes); // Check your terminal to see if this prints!
        res.json(bookedTimes);
    } catch (err) {
        console.error("Error fetching booked slots:", err);
        res.status(500).json([]); // Send an empty array on error so frontend doesn't crash
    }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));