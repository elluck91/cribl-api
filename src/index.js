/**
 * App Dependencies
 */

const express = require('express');
const dotenv = require('dotenv');
const url = require('url');


/**
 * App Configuration
 */
dotenv.config();

const app = express();
const port = process.env.PORT;


/**
 * App Start
 */
app.listen(port, () => {
    console.log(`Running crible API at http://localhost:${port}`);
});

app.get('/', (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    console.log(JSON.stringify(queryObject));
    res.send('Received API GET request.');
});


/***
 * App Termination
 */

process.on('SIGTERM', () => {
    console.log('Termination Signal received - SIGTERM. Preparing application for shot down.');
    process.exit();
})

// Linux 'kill' command was sent
process.on('SIGUSR2', () => {
    console.log('SIGUSR2 received - killing process.');
});
