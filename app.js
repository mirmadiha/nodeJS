require('dotenv').config();

// Validate required environment variables before booting
const requiredEnvVars = [
    'MONGODB_URI',
    'SESSION_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'SENDGRID_API_KEY',
    'EMAIL_FROM',
    'BASE_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: Missing required environment variables:');
    missingEnvVars.forEach(envVar => {
        console.error('\x1b[33m%s\x1b[0m', ` - ${envVar}`);
    });
    console.error('Please configure these variables in your .env file before starting the application.');
    process.exit(1);
}

const https = require("https");

const path = require("path");

const express = require("express");

const fs = require('fs');

const helmet = require('helmet');

const compression = require('compression');

const morgan = require('morgan');

const bodyParser = require("body-parser");

const errorControllers = require('./controllers/error');
const User = require('./models/user');

const app = express();

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
);

app.use(morgan('combined', { stream: accessLogStream }));

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

app.use(compression());

app.set("view engine", "ejs");
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth')
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');



const MONGODB_URI = process.env.MONGODB_URI;


const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
    session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, store: store })
);

app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// app.use((req, res, next) => {
//     console.log("isLoggedIn:", req.session.isLoggedIn);
//     console.log("session.user:", req.session.user);
//     if (!req.session.user) {
//         return next();
//     }
//     User.findById(req.session.user._id)
//         .then(user => {
//             if (!user) {
//                 return next();
//             }
//             req.user = user;
//             next();
//         })
//         .catch(err => {
//             next(new Error(err));
//         });
// })

app.use((req, res, next) => {
    console.log("isLoggedIn:", req.session.isLoggedIn);
    console.log("session.user:", req.session.user);

    if (!req.session.user) {
        console.log("No session user");
        return next();
    }

    User.findById(req.session.user._id)
        .then(user => {
            console.log("User from DB:", user);

            if (!user) {
                console.log("User not found");
                return next();
            }

            req.user = user;
            console.log("req.user assigned");
            next();
        })
        .catch(err => next(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorControllers.get500);

app.use(errorControllers.get404);

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).render("500", {
        pageTitle: 'Error',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn,
        csrfToken: req.csrfToken()
    });
})

mongoose.connect(MONGODB_URI)
    .then(() => {
        app.listen(process.env.PORT || 4000);
    })
    .catch(err => console.log(err));