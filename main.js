var express = require('express');
var app = express();
var fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const {spawn} = require("child_process");
const nrc = require('node-run-cmd')
console.log(process.cwd())
app.use(bodyParser.json({"limit": "50mb"}));
app.use(express.json());

db.close()


app.post('/submit', function (req, res) {
    fetch(req.body.file).then(res => {
        res.arrayBuffer().then(r => fs.writeFileSync("./audio_file", Buffer.from(r)));
    })
    res.header("Access-Control-Allow-Origin", "*");

    var callback = function (d) {
        console.log(d.toString());
    }
    var errcb = function (d) {
        console.log(d.toString());
    }

    nrc.run("python separate.py -m MDX_Net_Models/UVR_MDXNET_KARA.onnx -d -c 4000 ./audio_file", {
        onData: callback,
        onError: errcb
    });

    res.end("api_success");


})
app.options('/submit', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.end()
})
app.listen(8080);