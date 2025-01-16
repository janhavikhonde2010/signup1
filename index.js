const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB (using the 'myNewDatabase1' database)
mongoose.connect('mongodb://localhost/myNewDatabase1', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("MongoDB connected!");
})
.catch(err => console.log(err));

// Define User Schema and Model with the new fields (phone, confirmPassword, education)
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  phone: String,
  education: String
});

const User = mongoose.model('User', userSchema);

// Password Validation Regex (8 characters, 2 digits, 1 symbol, case-sensitive)
const passwordValidationRegex = /^(?=(.*[a-z]){1})(?=(.*[A-Z]){1})(?=(.*\d){2})(?=(.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]){1}).{8,}$/;

// Handle Signup Request
app.post('/signup', (req, res) => {
  const { username, password, confirmPassword, email, phone, education } = req.body;

  // Validate password confirmation
  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  // Validate password with regex
  if (!passwordValidationRegex.test(password)) {
    return res.status(400).send('Password must be at least 8 characters long, contain at least 2 digits, 1 symbol, and both uppercase and lowercase letters');
  }

  // Save new user to the database
  const newUser = new User({
    username,
    password,  // Case-sensitive password storage
    email,
    phone,
    education
  });

  newUser.save()
    .then(user => {
      res.send('Signup successful!');
    })
    .catch(err => {
      res.status(400).send('Error: ' + err);
    });
});

// Serve Signup HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
