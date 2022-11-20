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

if (!process.env.PORT) {
    process.exit(1);
}
const port = process.env.PORT;

const app = express();

/**
 * App Start
 */
app.listen(port, () => {
    console.log(`Running crible API at http://localhost:${port}`);
});

/**
 * GET lines
 * 
 * The endpoint returns a specified numer of lines from a givel log file.
 * Returned linest are order by event's date/time (newest first).
 * 
 * Supported query parameters:
 *  a. filename (within /var/log)
 *  b. filter results based on basic text/keyword matches
 *  c. specify the last n number of matching entries to retrieve within the log
 */
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
