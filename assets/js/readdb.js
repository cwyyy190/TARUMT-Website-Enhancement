const mysql = require('mysql');
const express = require("express");
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
const port = 8080;

//serve static files
app.use(express.static(path.join(__dirname, 'courses.html')));
app.use(express.static(path.join(__dirname, 'course-details.html')));

//MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: '12345678',
    database: 'lima',
});


connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database!');
});

//connection.end();

//API endpoint to get data from table 'programmes'
app.get('/programmes', (req, res) => {
    const query = 'select * from programmes';
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

//API endpoint to get data from table 'branch'
app.get('/branch', (req, res) => {
    const query = 'select * from branch';
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

//API endpoint to get data from table 'programme_branch'
app.get('/programme_branch', (req, res) => {
    const query = 'select * from programme_branch';
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

//API endpoint to get data from table 'programme_outlines'
app.get('/programme_outlines', (req, res) => {
    const query = 'select * from programme_outlines';
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

//API endpoint to get data from table 'career_prospects'
app.get('/career_prospects', (req, res) => {
    const query = 'select * from career_prospects';
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});



//API endpoint to get data from table 'programmes' where id = ?
app.get('/programmes/:id', (req, res) => {
    const id = req.params.id;
    const query = 'select * from programmes where id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) throw err;

        //Send results as JSON
        res.json(results[0]);
    });
});

//
app.get('/programme_outlines/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT * FROM programme_outlines WHERE programme_id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

//
app.get('/career_prospects/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT * FROM career_prospects WHERE programme_id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

//API endpoint to get data from distinct branch based on programme_id
app.get('/programmes/branches/:programme_id', (req, res) => {
    const programmeId = req.params.programme_id;
    const query = `
        SELECT DISTINCT branch.name 
        FROM programme_branch 
        JOIN branch ON programme_branch.branch_id = branch.id 
        WHERE programme_branch.programme_id = ?`;

    connection.query(query, [programmeId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

//API endpoint to get all distinct level from table programmes
app.get('/programmeLevels', (req, res) => {
    connection.query("SELECT DISTINCT level FROM programmes", (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

//API endpoint to get all distinct intake month from programm_branch
app.get('/intakeMonth', (req, res) => {
    connection.query("SELECT DISTINCT month FROM programme_branch", (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});


//API endpoint to get selected programmes based on level
app.get('/programmesByLevel', (req, res) => {
    const level = req.query.level;
    let query = "SELECT * FROM programmes";
    if (level) {
        query += " WHERE level = ?";
    }

    connection.query(query, [level], (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});


//
app.get('/programmes/intake/:programme_id', (req, res) => {
    const programmeId = req.params.programme_id;
    const query = `
        SELECT branch.name AS branch_name, programme_branch.year, programme_branch.month 
        FROM programme_branch 
        JOIN branch ON programme_branch.branch_id = branch.id 
        WHERE programme_branch.programme_id = ?`;

    connection.query(query, [programmeId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// API endpoint to get data from table 'requirement' where programme_id = ?
app.get('/requirements/:programme_id', (req, res) => {
    const programmeId = req.params.programme_id;
    const query = `
        SELECT name, requirement_text 
        FROM minimum_requirements 
        WHERE programme_id = ?;
    `;

    connection.query(query, [programmeId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});


// Your getProgrammes function
const getProgrammes = async (req, res) => {

    try {
        //const [programmes] = await connection.query('SELECT * FROM programmes');
        const [programmeBranches] = await connection.query('SELECT * FROM programme_branch');
        const [branches] = await connection.query('SELECT * FROM branch');
        const [careerProspects] = await connection.query('SELECT * FROM career_prospects');
        const [programmeOutlines] = await connection.query('SELECT * FROM programme_outlines');
        const [minimumRequirements] = await connection.query('SELECT * FROM minimum_requirements');

        // Combine data based on programme ID
        const combinedData = programmes.map((programme) => ({
            ...programme,
            branches: programmeBranches.filter((branch) => branch.programme_id === programme.id),
            outlines: programmeOutlines.filter((outline) => outline.programme_id === programme.id),
            careerProspects: careerProspects.filter((prospect) => prospect.programme_id === programme.id),
            requirements: minimumRequirements.filter((req) => req.programme_id === programme.id),
        }));

        // Send the combined data back as JSON
        res.json(combinedData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: '1Internal server error' });
    }
};

// Define the API route
app.get('/getProgrammes', getProgrammes);






app.get('/categories', (req, res) => {
    const query = 'SELECT DISTINCT category FROM events';
    connection.query(query, (err, results) => {
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
    connection.query(query, [category], (err, results) => {
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
    connection.query(query, (err, results) => {
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
    connection.query('SELECT * FROM events WHERE event_id = ?', [eventID], (err, results) => {
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
    connection.query('SELECT * FROM organizer WHERE organizer_id = ?', [organizerID], (err, results) => {
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
    
    connection.query(query, [organizerID], (err, results) => {
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
    connection.query(query, [first_name, last_name, studentID, email, phone, facultyStudent, media, event_id], (err, result) => {
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
    connection.query(query, [eventID], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve participant count' });
        }
        res.json({ participantCount: results[0].participantCount || 0 });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
