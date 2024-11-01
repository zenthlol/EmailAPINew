var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var loggerd = require("morgan");
const sendMail = require("./routes/mail");
require("dotenv").config();
const { scheduleFileDeletion } = require('./uploadCleanse'); // deletion job
// const { deleteMostRecentFile } = require('./uploadCleanse'); // deletion job

// const { responseVar } = require("./controllers/mail");

var app = express();

// me 
const multer = require("multer");
const diskStorage = multer.diskStorage({
    // konfigurasi folder penyimpanan file attachment email
    destination: function (req, file, cb){
        cb(null, path.join(__dirname, "./uploads"))
    },

    // konfigurasi penamaan file 
    filename: function (req, file, cb){
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: diskStorage // 10 mb
});

app.use(loggerd("dev"));
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// me
app.use(express.static('public'));

app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/sendmail", upload.array('attachments'), sendMail);

// console.log("response is" + responseVar);



scheduleFileDeletion();

module.exports = app;