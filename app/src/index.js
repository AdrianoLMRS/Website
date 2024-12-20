// *DEPENDECIES
    const path = require('path'); // Path for folders
    require('dotenv').config(); // Loads enviroments variables first
    const express = require('express');
    const app = express(); // Aplication
    const cors = require('cors'); // Enable CORS
    const { connectDB } = require('./db/index'); // Conect Database MongoDB
    const cookieParser = require('cookie-parser'); // For coookie setting with JWT
    const fs = require('fs'); // For logSetup

// *ROUTES
    const apiRoutes = require('./routes/apiRoutes'); // Import Stripe Check routes
    const reservaRoutes = require('./routes/reservaRoutes'); // Import Stripe Check routes
    const webhookRoutes = require('./routes/webhookRoutes'); // Import Stripe Webhook
    const userRoutes = require('./routes/userRoutes'); // Import User Routes

// *CONSTANTS
    fs.existsSync('./logSetup.js') && require('./logSetup'); // For logs.log file (optional)

// *GLOBAL MIDDLEWARES
    // app.use(express.json()); // JSON GLOBAL MIDDLEWARE
    // CORS GLOBAL MIDDLEWARE
    const allowedOrigins = ['https://pousada-tao.onrender.com', 'http://localhost:3000']; // Allowed CORS origins
    app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) { // Permit valid origins (e.g., Postman, insomnia)
        callback(null, true);
        } else {
        callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
    }));
    app.use(cookieParser()); // COOKIES GLOBAL MIDDLEWARE
    app.use(express.static(path.join(__dirname, '..', 'public'))); // SET PUBLIC FOLDER STATIC
    app.use((req, res, next) => { // logs
        console.log(`\nNew request: \n
        REQ METHOD : ${req.method}
        REQ URL : ${req.url}
        REQ/USER IP : ${req.ip}\n`);
        next(); 
    }); 
    app.use((req, res, next) => {
        if (req.accepts('html')) {
            res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        }
        next();
    });    
    app.use((req, res, next) => {
        let isCanceled = false;
    
        // Detecta se a requisição foi cancelada
        req.on('close', () => {
            isCanceled = true;
            console.log(`Request to ${req.originalUrl} was canceled.`);
        });
    
        res.on('finish', () => {
            if (!isCanceled) {
                console.log(`Request to ${req.originalUrl} completed successfully.`);
            }
        });
    
        next();
    });    
    app.get('/', (req, res) => {
        if (req.get('Accept') && req.get('Accept').includes('text/html')) {
            console.log('Main document loading...');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Content-Type', 'text/html; charset=UTF-8');
            res.sendFile(path.join(__dirname, '../../public/index.html')); // Send Profile static HTML
        } else {
            console.log("Request ignored (not for main document).");
            res.status(400).send('Bad Request');
        }
    });
    app.use((req, res, next) => {
        const startTime = Date.now();
    
        req.on('close', () => {
            const duration = Date.now() - startTime;
            console.log(`Request to ${req.originalUrl} was canceled after ${duration}ms.`);
        });
    
        next();
    });    
    app.set('view engine', 'ejs'); // For redenring .ejs files
    app.set('views', path.join(__dirname, 'views')); // Templates folder

  
// *FUNCTIONS
    connectDB(); // Connect MongoDB with MongoDB Atlas
    // Because of SIGINT errors...
    async function closeGracefully(signal) {
        await fastify.close();
        process.exit();
    }
    process.on('SIGINT', closeGracefully);
    process.on('SIGTERM', closeGracefully);

// *Routes uses
    app.use('/api', express.json(), apiRoutes); // routes/stripe.js
    app.use('/reserva', express.json(), reservaRoutes); // routes/stripe.js
    app.use('/profile', express.json(), userRoutes); //routes/userRoutes.js
    app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRoutes); // Use express.raw for webhook


const start = (port) => {
    try {
        app.listen(port, () => {
            console.log(`\nApi up and running at: http://localhost:${port}\n`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

// Initialize server + log
start(process.env.PORT);