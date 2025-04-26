const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/authDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static HTML files
app.use(express.static(__dirname));

// Route for home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

// Signup route
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.redirect('/signup.html?error=Username already taken');
    }

    const newUser = new User({ username, password });
    await newUser.save();
    res.redirect('/login.html?success=Signup successful! Please login');

  } catch (error) {
    console.error('Signup error:', error);
    res.redirect('/signup.html?error=Something went wrong');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.redirect('/login.html?error=Username not found');
    }

    if (user.password !== password) {
      return res.redirect('/login.html?error=Incorrect password');
    }

    // Success
    res.redirect('/index.html');

  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/login.html?error=Something went wrong');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
