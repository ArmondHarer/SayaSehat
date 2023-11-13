// import packages
const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const router = express.Router();
const bcrypt = require("bcrypt");
const session = require('express-session');

//middleware
app.use(express.json());

app.use(session({
    secret: '1234',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set it to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
}));
const corsOptions = {
    origin: 'http://localhost:4000',
    credentials: true,
};

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(cors(corsOptions));

//router
//router for register
app.post('/register', async (req, res) => {
    try {
        const { username, password, email, age, gender} = req.body;
        const REGISTER = await pool.query("INSERT INTO USERDATA (username, password, email, age, gender) VALUES ($1, $2, $3, $4, $5) RETURNING user_id", [username, password, email, age, gender]);
        const insertedUserId = REGISTER.rows[0].user_id;
        res.json({ user_id: insertedUserId });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//routers for login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const LOGIN = await pool.query("SELECT * FROM USERDATA WHERE username = $1 AND password = $2", [username, password]);
        if (LOGIN.rows.length > 0) {
            const user = LOGIN.rows[0];
            const userId = user.user_id;
    
            // Login successful
            req.session.user = userId; // Save the user ID in the session
            console.log('User ID:', userId); // Add this line
            req.session.username = username;
            res.json({ message: 'Login successful', userId: userId });
        } else {
            // Login failed
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } 
catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.json({ message: 'Logout successful' });
        }
    });
});

app.get('/user', async (req, res) => {
    try {
        const userId = req.session.user;
        console.log('User ID from session:', userId);
        if (userId) {
            const User = await pool.query("SELECT * FROM USERDATA WHERE user_id = $1", [userId]);
            const userData = User.rows[0]; // Assuming there is only one user with the given user_id
            console.log('User data from database:', userData);
            res.json(userData); // Return the user data as JSON
            } 
        else {
            console.log('User ID not found in the session');
            res.status(401).json({ error: 'User ID not found in the session' });
            }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/NutritionList/Vegetable', async (req, res) => {
    try {
        const Vegetable = await pool.query('SELECT * FROM VEGETABLE');
        res.json(Vegetable.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/NutritionList/Mushrooms', async (req, res) => {
    try {
        const Mushrooms = await pool.query('SELECT * FROM MUSHROOMS');
        res.json(Mushrooms.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/NutritionList/Fruit', async (req, res) => {
    try {
        const Fruit = await pool.query('SELECT * FROM FRUIT');
        res.json(Fruit.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/NutritionCalculate', async (req, res) => {
    try {
        const {Food} = req.body;
        if (!Food || Food.length === 0) {
            return res.status(400).send({ error: 'No food inputted' });
        }
        let totalCalories = 0;
        for(let i = 0; i < Food.length; i++) {
            let query = `
                SELECT Calories FROM VEGETABLE WHERE BINARY Food = '${Food[i]}'
                UNION ALL
                SELECT Calories FROM MUSHROOOMS WHERE BINARY Food = '${Food[i]}'
                UNION ALL
                SELECT Calories FROM FRUIT WHERE BINARY Food = '${Food[i]}'
            `;
            connection.query(query, function (error, results, fields) {
                if (error) throw error;
                results.forEach(result => {
                totalCalories += result.calories;
                });
            });
        }
        res.send({ totalCalories: totalCalories });
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ error: 'An error occurred' });
    }
});

app.listen(4000, () => {
    console.log("Server is running on port 4000");
});
