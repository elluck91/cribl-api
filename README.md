# Description
The Cribl-API service provides on-demand monitoring of various unix-based servers without having to log into each individual machine and opening up the log files found in /var/log.

# Design

The REST API exposes /lines endpoint.

It accepts 3 query parameters:

```
filename: {String} Text representing the filename (or relative path) to a log file in /var/log
filter: {String} Text to filter the log file(s) by
limit: {number} number of matching entries to retrieve within the log (default 10)
```

The API checks for the existence of the log file, and performes what's essentially known as 'tail'.

We expect the results to be ordered chronologically by event datetime, with newest events returned at the top.

Efficient solution doesn't read the (potentially) very large log file into memory. Instead, we perform byte reads using offset, and a limited buffer.

The buffer size is equal to the size of the file block, or the remaining bytes to read.

## Extra challenge
**In this case, it's important to determine how the nested results should be handled**

`Primary` - we could set up an ENV variable to denominate primary server. Such server keeps track of `secondary` servers, and aggregates the `secondary's` server's logs.

`Secondary` - secondary server uses ENV variable to denominate its nature. Such server would perform as usual - tail on logs.

# Usage

The source code is split into client/server code bases.

## Client:

build docker image: `docker build -t cribl-client ./client`

run docker image: `docker run -p 3001:3001 cribl-client`

## Server:

build docker image: `docker build -t cribl-api ./server`

run docker image: `docker run -p 3002:3002 cribl-api`

# Testing

There are at least 3 ways to test the REST API:

## UI
With the client, and server docker containers running, access the localhost at port 3001 (default).
Enter `filename`, `filter`, and `limit` in the form input fields, and hit `Fetch Logs`.
The results will be displayed in the scrollable `div`.

## CURL
You may curl the api using query parameters.
Example:

`curl localhost:3002/lines?filename={filename}&filter={filter}&limit={limit}`

### Tested cases

```
Valid:

http://localhost:3002/lines?filename=dpkg.log&filter=libmagick&limit=5
http://localhost:3002/lines?filename=dpkg.log&filter=libmagick&limit=50
http://localhost:3002/lines?filename=dpkg.log&filter=libmagick
http://localhost:3002/lines?filename=dpkg.log&limit=50
http://localhost:3002/lines?filename=apt/term.log&filter=triggers&limit=5
http://localhost:3002/lines?filename=apt/term.log&filter=libmagick&limit=15

```

```
Invalid:

http://localhost:3002/lines?filename=syslog&filter=libmagick&limit=5 (invalid filename)
http://localhost:3002/lines?filename=dpkg.log&filter=libmagick&limit=5s0 (invalid limit)

```

## Script
There is a test script in `test` directory. The scripts tests a few scenarios:
- Wrong input types/values
- Missing query parameters
- Multiple filenames, filters, limits

Execute it by running:
`node test.js`


