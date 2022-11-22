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
 * Returned lines are ordered by event's date/time (newest first).
 * 
 * Supported query parameters:
 *  a. filename (within /var/log)
 *  b. filter results based on basic text/keyword matches
 *  c. specify the last n number of matching entries to retrieve within the log
 */
app.get('/lines', async (req, res) => {
    const filename = req.query.filename;
    const filter = req.query.filter;
    const limit = req.query.limit;

    if (!filename) {
        res.status(400).send('Missing filename');
        return;
    } else if (!fs.existsSync(`${LOG_PATH}/${filename}`)) {
        res.status(400).send('Invalid filename');
        return;
    } else if (limit && isNaN(limit)) {
        res.status(400).send('Invalid limit');
        return;
    }

    try {
        // Get the last n lines from the log file
        const results = await tail(`${LOG_PATH}/${filename}`, filter, limit || 10);
        res.status(200).send(results);
    } catch (err) {
        res.status(500).send(err.message);
    }

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
    const stats = await fileStats(path);
    const fileSize = stats.size;
    const buffer = Buffer.alloc(stats.blksize);
    const fd = fs.openSync(path, 'r');

    let lines = [];
    let pos = fileSize;

    while (lines.length < n && pos > 0) {
        let bytesToRead = Math.min(stats.blksize, pos);
        pos -= bytesToRead;

        let bytesRead = fs.readSync(fd, buffer, 0, bytesToRead, pos);
        let data = buffer.toString('utf8', 0, bytesRead);

        // If we're not at the beginning of the file, we need to ignore the last line
        // because it's probably not a complete line
        if (pos > 0) {
            data = data.substring(data.indexOf('\n') + 1);
        } else {
            data = data.substring(0, data.lastIndexOf('\n'));
        }

        let linesInData = data.split('\n');

        // If we're not at the beginning of the file, we need to add the last line
        // from the previous read to the first line of this read
        if (pos > 0) {
            linesInData[0] = lines[lines.length - 1] + linesInData[0];
            lines.pop();
        } else {
            linesInData.pop();
        }

        // Add the lines to the list of lines
        lines = lines.concat(linesInData.reverse());
        lines = text ? lines.filter(line => line.includes(text)) : lines;
        lines = lines.slice(0, n);
    }

    fs.closeSync(fd);
    console.log(`Returning ${lines.length} lines from ${path}`);
    return lines;
}

