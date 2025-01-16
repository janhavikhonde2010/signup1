const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
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
app.post('/signup', async (req, res) => {
  const { username, password, confirmPassword, email, phone, education } = req.body;

  console.log('Received Signup Request:', req.body);  // Log the received data

  // Validate password confirmation
  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  // Validate password with regex
  if (!passwordValidationRegex.test(password)) {
    return res.status(400).send('Password must be at least 8 characters long, contain at least 2 digits, 1 symbol, and both uppercase and lowercase letters');
  }

  try {
    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password:', hashedPassword);  // Log the hashed password

    // Save new user to the database with hashed password
    const newUser = new User({
      username,
      password: hashedPassword,  // Store the hashed password
      email,
      phone,
      education
    });

    await newUser.save();  // Save the user to the database

    // After successful signup, render the signup success message and login form
    res.send(`
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .message {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              font-size: 18px;
              text-align: center;
              width: 300px;
            }
            .form-container {
              margin-top: 20px;
            }
            input {
              padding: 10px;
              margin: 5px;
              width: 100%;
              box-sizing: border-box;
            }
            button {
              background-color: #4CAF50;
              color: white;
              padding: 10px;
              border: none;
              width: 100%;
              cursor: pointer;
              font-size: 16px;
            }
            .login-link {
              text-align: center;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          
          <div class="form-container">
            <form action="/login" method="POST">
             <div class="message">
            Signup successful! Your account has been created. Please log in now:
          </div><br></br>
              <input type="email" name="email" placeholder="Email" required><br>
              <input type="password" name="password" placeholder="Password" required><br>
              <button type="submit">Login</button>
              <div class="login-link">
            <p>Already have an account? <a href="/login">Login here</a></p>
          </div>
            </form>
          </div>
          
        </body>
      </html>
    `);

  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).send('Error hashing password or saving user');
  }
});

// Handle Login Request
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Received Login Request:', req.body);  // Log the received login data

  try {
    // Use case-insensitive query to find the user by email
    const user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });

    if (!user) {
      console.log('User not found');
      return res.status(400).send('User not found');
    }

    // Compare the provided password with the stored hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log('Password Match Result:', isPasswordCorrect);  // Log password match result

    if (isPasswordCorrect) {
      res.send(`
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
              }
              .message {
                background-color: #4CAF50;
                color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                font-size: 18px;
                text-align: center;
                width: 300px;
              }
            </style>
          </head>
          <body>
            <div class="message">
              Login successful! Welcome back, ${user.username}.
            </div>
          </body>
        </html>
      `);
    } else {
      res.status(400).send('Invalid password');
    }

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Error finding user or comparing passwords');
  }
});

// Serve Login HTML (Only for login page)
app.get('/login', (req, res) => {
  res.send(`
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .form-container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            width: 300px;
          }
          input {
            padding: 10px;
            margin: 5px;
            width: 100%;
            box-sizing: border-box;
          }
          button {
            background-color: #4CAF50;
            color: white;
            padding: 10px;
            border: none;
            width: 100%;
            cursor: pointer;
            font-size: 16px;
          }
          .signup-link {
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="form-container">
          <h2>Login</h2>
          <form action="/login" method="POST">
            <input type="email" name="email" placeholder="Email" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <button type="submit">Login</button>
          </form>
          <div class="signup-link">
            <p>Don't have an account? <a href="/">Sign up here</a></p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Serve Signup Page (For signup form)
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .form-container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            width: 300px;
          }
          input {
            padding: 10px;
            margin: 5px;
            width: 100%;
            box-sizing: border-box;
          }
          button {
            background-color: #4CAF50;
            color: white;
            padding: 10px;
            border: none;
            width: 100%;
            cursor: pointer;
            font-size: 16px;
          }
          .login-link {
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="form-container">
          <h2>Signup</h2>
          <form action="/signup" method="POST">
            <input type="text" name="username" placeholder="Username" required><br>
            <input type="email" name="email" placeholder="Email" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <input type="password" name="confirmPassword" placeholder="Confirm Password" required><br>
            <input type="text" name="phone" placeholder="Phone" required><br>
            <input type="text" name="education" placeholder="Education" required><br>
            <button type="submit">Sign Up</button>
          </form>
          <div class="login-link">
            <p>Already have an account? <a href="/login">Login here</a></p>
          </div>
        </div>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
