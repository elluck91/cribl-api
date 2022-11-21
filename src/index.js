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
 * The endpoint returns a specified numer of lines from a givel log file.
 * Returned linest are order by event's date/time (newest first).
 * 
 * Supported query parameters:
 *  a. filename (within /var/log)
 *  b. filter results based on basic text/keyword matches
 *  c. specify the last n number of matching entries to retrieve within the log
 */
app.get('/', async (req, res) => {
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
 * @param {*} filename 
 */

// take a name of a file and return the file stats
async function fileStats(filename) {
    return fs.statSync(filename, (err, stats) => {
        if (err) {
            console.log(err);
            return err;
        }
        return stats.size;
    });
}

/**
 * 
 * @param {*} path Path to the log file to be read
 * @param {*} text Text to search for in the log file
 * @param {*} n Number of lines to return from the log file
 * @returns  Array of lines from the log file
 */
async function tail(path = '/var/log/lastlog', text = 'localhost', n = 10) {
    let results = [];
    let stats = await fileStats(path);

    if (!stats || stats.size === 0) {
        return results;
    }

    let buffer = Buffer.alloc(BUFFER_SIZE);

    let fd = fs.openSync(path, 'r', (err, fd) => {
        if (err) {
            console.error(`error: ${err}`);
            return err;
        }

        return fd;
    });

    if (!fd) {
        console.error('Error opening file');
        return results;
    }


    let position = stats.size - buffer.length;

    while (position > 0 && results.length < n) {

        let bytesRead = fs.readSync(fd, buffer, 0, buffer.length, position);
        let data = buffer.toString('utf8', 0, bytesRead);

        let lines = data.slice(data.indexOf('\n') + 1).split('\n');

        for (let i = lines.length - 1; i >= 0; i--) {
            let line = lines[i];
            if (line.includes(text)) {
                results.push(line);
            }
            if (results.length === n) {
                break;
            }
        }

        position -= buffer.length;
    }

    return results;

}