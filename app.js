//jshint esversion:6
const express = require("express");
const bodyparser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

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

const secret = "Thisisourlittlesecret.";
userSchema.plugin(encrypt, { secret: secret , encryptedFields: ['password'] });

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
app.post("/register", function(req,res){
    let newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function(err){
        if(err){
            console.log(err);
        } else {
            res.render("secrets");
        }
    });
});

app.post("/login", function(req,res){
    const username = req.body.username;
    const password = req.body.password; 

    User.findOne({email: username},function(err, foundUsername){
        if(err){
            console.log(err);
        } else {
            if(foundUsername){ //This checks if there is a username actually found. 
                if(foundUsername.password === password){
                    res.render("secrets");
                }
            }
        }
    });
});

app.listen(3000, function () {
    console.log("The server is now online");
});