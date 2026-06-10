require('dotenv').config();

const http = require("http");

const path = require("path");

const express = require("express");

const bodyParser = require("body-parser");

const errorControllers = require('./controllers/error');
const User = require('./models/user');

const app = express();

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



const MONGODB_URI = 'mongodb+srv://mirmadihaaijaz_db_user:dbMadiha123@cluster0.xsaikfm.mongodb.net/shop';


const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

const csrfProtection = csrf();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({ secret: 'mysecret', resave: false, saveUninitialized: false, store: store })
);

app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {

    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if(!user){
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err =>{
            next (new Error(err));
        });
})

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorControllers.get500);

app.use(errorControllers.get404);

app.use((error, req, res, next)=>{
    res.status(500).render("500", {
        pageTitle: 'Error',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn,
        csrfToken: req.csrfToken()
    });
})

mongoose.connect(
    MONGODB_URI
)
    .then(result => {
        app.listen(4000);
    })
    .catch(err => console.log(err));