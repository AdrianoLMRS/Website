// *DEPENDECIES
  const path = require('path'); // Path for folders
  require('dotenv').config(); // Loads enviroments variables first
  const express = require('express');
  const app = express(); // Aplication
  const cors = require('cors'); // Enable CORS
  const { connectDB } = require('./db/index'); // Conect Database MongoDB

// *ROUTES
  const stripe = require('./routes/stripe'); // Import Stripe Check routes
  const userRoutes = require('./routes/userRoutes'); // userRoutes

// *CONSTANTS


// *GLOBAL MIDDLEWARES
  app.use(express.json()); // JSON GLOBAL MIDDLEWARE
  app.use(cors()); // CORS GLOBAL MIDDLEWARE
  app.use(express.static(path.join(__dirname, '..', 'public'))); // SET PUBLIC FOLDER STATIC
  app.use((req, res, next) => { // logs
    console.log(`\n\nNova request: \nREQ METHOD : ${req.method} \nREQ URL : ${req.url} \nREQ/USER IP : ${req.ip} \n\n`);
    next(); 
  }); 

// *NODE.JS METHODS
  // Set motor to .EJS files in /view folder
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));



// *FUNCTIONS
  connectDB();

// *Routes uses
  app.use('/stripe', stripe); // routes/stripe.js
  app.use(userRoutes); //routes/userRoutes.js


// TEMP
  // req.isAuthenticated is provided from the auth router
  app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
  });

  console.log(config);

// Initialize server log
app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em ${process.env.BASE_URL}`);
});