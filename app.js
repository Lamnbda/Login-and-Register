//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyparser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
    extended: true
}));

//The mongoose connection string
mongoose.connect('mongodb://localhost:27017/userDB', {
    useNewUrlParser: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("we're connected!");
});

let userSchema = new mongoose.Schema({
    email: String,
    password: String
});


// userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password'] });

var User = mongoose.model('User', userSchema);

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

//The user submits a registration including their email and password
app.post("/register", function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        let newUser = new User({
            email: req.body.username,
            password: hash
        });

        newUser.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                res.render("secrets");
            }
        })
    });
});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({
        email: username
    }, function (err, foundUsername) {
        if (err) {
            console.log(err);
        } else {
            if (foundUsername) { //This checks if there is a username actually found. 
                bcrypt.compare(password, foundUsername.password, function (err, result) {
                    if (result === true) {
                        res.render("secrets");
                    }
                });
            }
        }
    });
});

app.listen(3000, function () {
    console.log("The server is now online");
});