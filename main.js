var express = require('express');
var app = express();
var fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const {spawn} = require("child_process");
const nrc = require('node-run-cmd')

console.log(crypto.randomUUID())

app.use(bodyParser.json({"limit": "200mb"}));
app.use(express.json());

const stmt = db.prepare("INSERT INTO instrument_entry (uuid, song_name, album_name, link_to, binary, artist) VALUES (?,?,?,?,?,?)")


app.post('/submit', function (req, res) {

    res.header("Access-Control-Allow-Origin", "*");


    try {
        fetch(req.body.file).then(res => {
            res.arrayBuffer().then(r => fs.writeFileSync("./audio_file", Buffer.from(r)));
        })
    } catch (err) {
        res.status(500).send("Server Error");
        return
    }

    var callback = function (d) {
        console.log(d.toString());
    }
    var errcb = function (d) {
        console.log(d.toString());
    }
    nrc.run(["pip install audio-separator", "audio-separator ./audio_file --model_filename UVR_MDXNET_KARA.onnx  --mdx_segment_size 4000 --mdx_overlap 0.75  --output_dir output "], {
        onData: callback,
        onError: errcb
    }).then(r => {
        r[1] === 1 ?
            res.sendStatus(500)
            : res.end("api_success");
        stmt.run(crypto.randomUUID(), req.body.name, req.body.albumName, req.body.link, fs.readFileSync('./output/audio_file_(Instrumental)_UVR_MDXNET_KARA.flac', req.body.artist))

    })

})
app.options('/submit', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.end()
})

app.post('/search_api', function (req, res) {
    function OnFetched(err, rows){
        try{
            res.header("Access-Control-Allow-Origin", "*");
            console.log("Triggered");
            res.end(JSON.stringify(rows));
        }catch(e){

        }

    }

    console.log(req.body.searchStr)
    db.all(`SELECT id, uuid, song_name, album_name, artist FROM instrument_entry WHERE song_name like '%${req.body.searchStr}%' or album_name like '%${req.body.searchStr}%' or artist like '%${req.body.searchStr}%'`, OnFetched)
})

app.post('/fetch', function (req, res) {
    function Provider(err, rows){
        try{
            res.header("Access-Control-Allow-Origin", "*");
            console.log("Triggered");
            res.end(rows[0]);
        }catch(e){

        }
    }
    db.all(`SELECT binary FROM instrument_entry WHERE uuid=${req.body.uuid}`, Provider)

})

app.options('/search_api', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.end()
})
app.listen(8080);