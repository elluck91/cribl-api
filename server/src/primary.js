/**
 * App Dependencies
 */
const express = require('express');
require('dotenv').config();

if (!process.env.PRIMARY_PORT) {
    console.error('PRIMARY_PORT is not set.');
    process.exit(1);
}

const port = parseInt(process.env.PRIMARY_PORT);
const app = express();

const subscriptions = [];

/**
 * App Start
 */
app.listen(port, () => {
    console.log(`Running crible API at http://localhost:${port}`);
});

// Accept POST request at /subscribe endpoint and send back a response
app.post('/subscribe', (req, res) => {
// identify where the request is coming from
    const id = req.body.id;
    console.log(`Received subscription request from ${id}.`);

    addSubscription(id);

    // send back a response
    res.send(`Subscribed to ${id}.`);
});

// Accept GET request at /lines endpoint
app.get('/lines', async (req, res) => {
    const filename = req.query.filename;
    const filter = req.query.filter;
    const limit = req.query.limit;

    let promises = []

    for (let i = 0; i < subscriptions.length; i++) {
        promises.push(getSecondaryLogs(subscriptions[i], filename, filter, limit))
    }

    try {
        const requests = await Promise.all(promises);
        res.send(requests);
    } catch (err) {
        res.status(500).send(err);
    }
    
})

function getSecondaryLogs(uid, filename, filter, limit) {
    return new Promise((resolve, reject) => {
        http.request({
            host: 'localhost',
            port: uid,
            path: '/subscribe',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: UID,
                filename,
                filter, limit
            })
        }, (res) => {
            res.on('data', (data) => {
                resolve(data.toString());
            });
        }), (err) => {
            reject(err);
        }
    });
    
}

// Save new subscription in memory
function addSubscription(subscription) {
    // check if subscription already exists
    if (subscriptions.includes(subscription)) {
        console.log(`Subscription already exists for ${subscription}.`);
        return;
    } else {
        subscriptions.push(subscription);
        console.log(`Added new subscription for ${subscription}.`);
    }
}

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

module.exports = app;
