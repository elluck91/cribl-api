# Description
The Cribl-API service provides on-demand monitoring of various unix-based servers without having to log into each individual machine and opening up the log files found in /var/log.

# Design

Provide design documentation.

The crux of the problem, IMO, is to read the stream using small block sizes.
By default, I use 64KiB.
Files are read block by block from the end.
That way, we save a TON of time, skipping blocks at the top.

# Usage

Provide usage instructions.

build docker image: docker build -t cribl-api .

run docker image: docker run -p 3000:3000 cribl-api

# Testing

Provide testing instructions.
