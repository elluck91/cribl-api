// Path: server/src/watch.js
const express = require('express');
const fs = require('fs');
const http = require('http');
const { isValidFilename, isValidFilter, isValidLimit } = require('./validator');
require('dotenv').config();

const UID = process.env.SECONDARY_PORT;
const LOG_PATH = process.env.LOG_PATH;

const app = new express();
app.use(express.json());

if (!process.env.SECONDARY_PORT) {
    console.error('SECONDARY_PORT is not set.');
    process.exit(1);
}

app.listen(process.env.SECONDARY_PORT, () => {
    console.log(`Listening on port ${process.env.SECONDARY_PORT}.`);
    console.log(`UID: ${UID}`);
    // send POST request to localhost:3002, and send my unique id
    http.request({
        host: 'localhost',
        port: process.env.PRIMARY_PORT,
        path: `/subscribe/${UID}`,
        method: 'POST',
    }, (res) => {
        res.on('data', (data) => {
            console.log(`This is the data: ${data.toString()}`);
        });
    }, (err) => {
        console.error(err);
    }).end('watcher');
});

/**
 * GET lines
 * 
 * The endpoint returns a specified numer of lines from a given log file.
 * Returned lines are ordered by event's date/time (newest first).
 * 
 * Supported query parameters:
 *  @param { String } filename  Name of the log file to be read from
 *                              the /var/log directory or local test/ directory
 *  @param { String } filter    Text to filter the log file by
 *  @param { number } limit     Number of lines to return from the log file
 */
app.get('/lines', async (req, res) => {

    // log request
    console.log(`GET /lines?filename=${req.query.filename}&filter=${req.query.filter}&limit=${req.query.limit}`);
    const filename = req.query.filename;
    const filter = req.query.filter;
    const limit = parseInt(req.query.limit);

    const validators = await Promise.all([isValidFilename(filename),
        isValidFilter(filter), isValidLimit(limit)]);

    if (validators.includes(false)) {
        res.status(400).send('Invalid query parameters.');
        return;
    } else {
        try {
            const filePath = `${LOG_PATH}/${filename}`;
            const lines = await getLines(filePath, filter, limit);
            res.send({
                UID,
                filename,
                filter,
                limit,
                lines,
            });
        } catch (err) {
            res.status(500).send(err);
        }
    }
});

function fileStats(filename) {
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
async function getLines(path, text, n) {
    const stats = await fileStats(path);
    const fileSize = stats.size;
    const buffer = Buffer.alloc(stats.blksize);
    const fd = await new Promise((resolve, reject) => {
        fs.open(path, 'r', (err, fd) => {
            if (err) {
                reject(err);
            } else {
                resolve(fd);
            }
        });
    });

    let lines = [];
    let pos = fileSize;

    while (lines.length < n && pos > 0) {
        let bytesToRead = Math.min(stats.blksize, pos);
        pos -= bytesToRead;

        let bytesRead = await new Promise((resolve, reject) => {
            fs.read(fd, buffer, 0, bytesToRead, pos, (err, bytesRead) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(bytesRead);
                }
            });
        });

        let data = buffer.toString('utf8', 0, bytesRead);
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

    await new Promise((resolve, reject) => {
        fs.close(fd, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    return lines;
}