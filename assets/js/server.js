const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Create the Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// Create a connection to MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'sem',
    password: 'sem',
    database: 'semdb'
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

app.get('/categories', (req, res) => {
    const query = 'SELECT DISTINCT category FROM events';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

app.get('/events/category', (req, res) => {
    const category = req.query.category;
    const query = `
        SELECT events.*, organizer.organizer_name
        FROM events
        JOIN organizer ON events.organizer_id = organizer.organizer_id
        WHERE events.category = ?
    `;
    db.query(query, [category], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// Fetch all events
app.get('/events', (req, res) => {
    const query = `
        SELECT events.*, organizer.organizer_name
        FROM events
        JOIN organizer ON events.organizer_id = organizer.organizer_id
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// Fetch event details
app.get('/event/:eventID', (req, res) => {
    const eventID = req.params.eventID;
    const query = 'SELECT * FROM events WHERE event_id = ?';
    db.query('SELECT * FROM events WHERE event_id = ?', [eventID], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length > 0) {
            res.json(results[0]); // Return the first event object
        } else {
            res.status(404).send({ message: 'Event not found' });
        }
    });
});

// Fetch organizer details
app.get('/organizer/:organizerID', (req, res) => {
    const organizerID = req.params.organizerID;
    db.query('SELECT * FROM organizer WHERE organizer_id = ?', [organizerID], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length > 0) {
            res.json(results[0]); // Return the organizer object
        } else {
            res.status(404).send({ message: 'Organizer not found' });
        }
    });
});

// Fetch related events based on the organizer
app.get('/events/related/:organizerID', (req, res) => {
    const organizerID = req.params.organizerID;

    const query = 'SELECT * FROM events WHERE organizer_id = ?';
    
    db.query(query, [organizerID], (err, results) => {
        if (err) {
            console.error('Error fetching related events:', err);
            return res.status(500).send({ error: 'Failed to retrieve related events' });
        }
        
        res.json(results); // Return related events
    });
});


// Register a participant
app.post('/register-participant', (req, res) => {
    const { first_name, last_name, studentID, email, phone, facultyStudent, media, event_id } = req.body;
    const query = `
        INSERT INTO participants (first_name, last_name, studentID, email, phone, facultyStudent, media, event_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [first_name, last_name, studentID, email, phone, facultyStudent, media, event_id], (err, result) => {
        if (err) {
            console.error('Error registering participant:', err);
            return res.status(500).json({ error: 'Failed to register participant' });
        }
        res.json({ message: 'Participant registered successfully' });
    });
});

// Fetch the participant count for a specific event
app.get('/event/participants/:eventID', (req, res) => {
    const eventID = req.params.eventID;
    const query = 'SELECT COUNT(*) AS participantCount FROM participants WHERE event_id = ?';
    db.query(query, [eventID], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve participant count' });
        }
        res.json({ participantCount: results[0].participantCount || 0 });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
