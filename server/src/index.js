/**
 * App Dependencies
 */
const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');
const { isValidFilename, isValidFilter, isValidLimit } = require('./validator');

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
 *  @param { String } filename Name of the log file to be read from the /var/log directory or local test/ directory
 *  @param { String } filter Text to filter the log file by
 *  @param { number } limit Number of lines to return from the log file
 */
app.get('/lines', (req, res) => {
    const filename = req.query.filename;
    const filter = req.query.filter;
    const limit = req.query.limit;

    try {
        // Validate the query parameters
        isValidFilename(filename).then(() => {
            isValidFilter(filter).then(() => {
                isValidLimit(limit).then(() => {
                    // Read the log file
                    const filePath = `${LOG_PATH}/${filename}`;
                    tail(filePath, filter, limit)
                        .then(lines => {
                            res.send(lines);
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(400).json({ error: err.message });
                        });
                }).catch(err => {
                    console.log(err);
                    res.status(400).json({ error: err.message });
                });
            }).catch(err => {
                console.log(err);
                res.status(400).json({ error: err.message });
            });
        }).catch(err => {
            console.log(err);
            res.status(400).json({ error: err.message });
        });
    } catch (err) {

        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

/* App Termination
*/
process.on('SIGTERM', () => {
    console.log('Termination Signal received - SIGTERM. Preparing application for shot down.');
    process.exit();
})

// Linux 'kill' command was sent
process.on('SIGUSR2', () => {
    console.log('SIGUSR2 received - killing process.');
});


function fileStats(filename) {
    console.log(`Reading file stats for ${filename}`);
    return new Promise((resolve, reject) => {
        fs.stat(filename, (err, stats) => {
            if (err) {
                reject(err);
            } else {
                resolve(stats);
            }
        });
    });
}

/**
 * 
 * @param {*} path Path to the log file to be read
 * @param {*} text Text to search for in the log file
 * @param {*} n Number of lines to return from the log file
 * 
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

module.exports = app;