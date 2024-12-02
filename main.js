var express = require('express');
var app = express();
var fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

app.use(bodyParser.json({"limit": "50mb"}));
app.use(express.json());

db.close()


app.post('/submit', function (req, res) {
    fetch(req.body.file).then(res=>{
        res.arrayBuffer() .then(r => fs.writeFileSync("./file", Buffer.from(r) ));
    })
    res.header("Access-Control-Allow-Origin", "*");
    res.end()
})
app.options('/submit', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.end()
})
app.listen(8080);