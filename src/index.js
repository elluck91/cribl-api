/**
 * App Dependencies
 */

const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');

/**
 * App Configuration
 */
dotenv.config();

if (!process.env.PORT) {
    process.exit(1);
}
const port = parseInt(process.env.PORT);
const LOG_PATH = process.env.LOG_PATH;
const BUFFER_SIZE = parseInt(process.env.BUFFER_SIZE);

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
 * The endpoint returns a specified numer of lines from a given log file.
 * Returned lines are order by event's date/time (newest first).
 * 
 * Supported query parameters:
 *  a. filename (within /var/log)
 *  b. filter results based on basic text/keyword matches
 *  c. specify the last n number of matching entries to retrieve within the log
 */
app.get('/', async (req, res) => {
    console.log(`GET /`, req.query);
    const filename = req.query.filename || 'messages';
    const text = req.query.text || 'localhost';
    const n = req.query.n || 10;

    let path = LOG_PATH + filename;
    res.send(await tail(path, text, n));
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

/**
 * 
 * @param {*} filename Name of the file to be read from the /var/log directory
 * 
 * @returns Stats for the file in the /var/log directory
 */
async function fileStats(filename) {
    return fs.statSync(filename, (err, stats) => {
        if (err) {
            console.log(err);
            return err;
        }
        return stats;
    });
}

/**
 * 
 * @param {*} path Path to the log file to be read
 * @param {*} text Text to search for in the log file
 * @param {*} n Number of lines to return from the log file
 * @returns  Array of lines from the log file
 */
async function tail(path, text, n) {
    let results = [];
    let stats;

    try {
        stats = await fileStats(path);
        if (!stats || stats.size === 0) {
            return results;
        }
    } catch (err) {
        console.log(err);
        return results;
    }

    let buffer = Buffer.alloc(BUFFER_SIZE);
    let fd;

    try {
        fd = fs.openSync(path, 'r');
    } catch (err) {
        console.log(err);
        return results;
    }

    let position = stats.size - buffer.length;

    while (position >= 0 && results.length < n) {
        let bytesRead;

        try {
            bytesRead = fs.readSync(fd, buffer, 0, buffer.length, position);
        } catch (err) {
            console.log(err);
            return results;
        }

        let data = buffer.toString('utf8', 0, bytesRead);

        let lines = data.slice(data.indexOf('\n') + 1).split('\n');

        for (let i = lines.length - 1; i >= 0; i--) {
            let line = lines[i];
            if (line.includes(text)) {
                results.push(line);
            }
            if (results.length === n) {// BROKEN, n is a string, not a number
                break;
            }
        }

        position -= buffer.length;
    }

    try {
        fs.closeSync(fd);
    } catch (err) {
        console.log(err);
        return results;
    }

    return results;
}