# Description
The Cribl-API service provides on-demand monitoring of various unix-based servers without having to log into each individual machine and opening up the log files found in /var/log.

# Design

The REST API exposes /lines endpoint.

It accepts 3 query parameters:

```
filename: {String} Text representing the filename (or relative path) to a log file in /var/log
filter: {String} Text to filter the log file(s) by (ENV variable controls the MIN/MAX_FILTER_LIMIT)
limit: {number} number of matching entries to retrieve within the log (ENV variables control the MIN and MAX_LIMIT)
```

The API checks for the existence of the log file, and performes what's essentially known as 'tail'.

We expect the results to be ordered chronologically by event datetime, with newest events returned at the top.

Efficient solution doesn't read the (potentially) very large log file into memory. Instead, we perform byte reads using offset, and a limited buffer.

The buffer size is equal to the size of the file block, or the remaining bytes to read.

## Extra challenge
**In this case, it's important to determine how the nested results should be handled**

Primary server runs as an aggregator.
Each **secondary** server sends a POST request to the **primary** server's `/subscribe` endpoint.

When a REST GET `/lines` is received by the *primary* server, it sends subsequent REST GET `lines` request the to the *secondary* servers (stored in memory).

Finally, the **primary** server, returnes JSON Object with information about the **secondary** UID, filename, filter, limit, and lines (array of strings).

# Usage

## Server (primary)
build primary server docker image: 
```
cd server
docker build --build-arg PRIMARY_PORT=3002 -t cribl-primary .
```

run primary server docker container:
```
docker run -p 3002:3002 --network="host" -d cribl-primary node src/primary.js
```

## Server (secondary #1)
build primary server docker image: 
```
cd server
docker build --build-arg PRIMARY_PORT=3002 --build-arg SECONDARY_PORT=3003 -t cribl-secondary1 .
```

run primary server docker container:
```
docker run -p 3003:3003 --network="host" -d cribl-secondary1 node src/secondary.js
```

## Server (secondary #2)
build primary server docker image: 
```
cd server
docker build --build-arg PRIMARY_PORT=3002 --build-arg SECONDARY_PORT=3004 -t cribl-secondary2 .
```

run primary server docker container:
```
docker run -p 3004:3004 --network="host" -d cribl-secondary2 node src/secondary.js
```
## Client (unfinished)

build docker image: `docker build -t cribl-client ./client`

run docker image: `docker run -p 3001:3001 cribl-client`

# Testing

There are at least 3 ways to test the REST API:

## CURL (preferred)
You may curl the api using query parameters.
Example:

`curl localhost:3002/lines?filename={filename}&filter={filter}&limit={limit}`

### Tested cases

```
Valid:

http://localhost:3002/lines?filename=logs&filter=libmagick&limit=5
http://localhost:3002/lines?filename=logs&filter=libmagick&limit=50
http://localhost:3002/lines?filename=logs&filter=libmagick
http://localhost:3002/lines?filename=logs&limit=50
http://localhost:3002/lines?filename=access.log&filter=dockerd&limit=5
http://localhost:3002/lines?filename=test.log&filter=Fedora&limit=15
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

## UI (unfinished)
With the client, and server docker containers running, access the localhost at port 3001 (default).
Enter `filename`, `filter`, and `limit` in the form input fields, and hit `Fetch Logs`.
The results will be displayed in the scrollable `div`.
