require('dotenv').config();

const MIN_LIMIT = process.env.MIN_LIMIT;
const MAX_LIMIT = process.env.MAX_LIMIT;

const MIN_FILTER_LENGTH = process.env.MIN_FILTER_LENGTH;
const MAX_FILTER_LENGTH = process.env.MAX_FILTER_LENGTH;

const LOG_PATH = process.env.LOG_PATH;

// Check if the filename doesn't contain any special characters, exists, and is not empty or null 
function isValidFilename(filename) {
    return new Promise((resolve, reject) => {
        console.log(`${LOG_PATH}/${filename}`);
        if (filename === null || filename === undefined || filename === '' || filename.includes('../')) {
            reject('Invalid filename');
        }

        resolve();
    });
}


// Check if the filter is a string without special characters and length between MIN_FILTER_LENGTH AND MAX_FILTER_LENGTH
function isValidFilter(filter) {
    return new Promise((resolve, reject) => {
        if (filter === null || filter === undefined || filter === '') {
            reject('Invalid filter');
        } else if (filter.match(/[^a-zA-Z0-9-_]/)) {
            reject('Invalid filter');
        } else if (filter.length < MIN_FILTER_LENGTH || filter.length > MAX_FILTER_LENGTH) {
            reject('Invalid filter');
        } else {
            resolve(true);
        }
    });
}

// Check if the limit is a safe integer between MIN_LIMIT AND MAX_LIMIT
function isValidLimit(limit) {
    return new Promise((resolve, reject) => {
        if (!limit) {
            resolve();
        } else if (isNaN(limit) || limit % 1 !== 0) {
            reject('Invalid limit');
        } else if (limit < MIN_LIMIT || limit > MAX_LIMIT) {
            reject(`Invalid limit. Limit must be between ${MIN_LIMIT} and ${MAX_LIMIT}`);
        }
        resolve();
    });
}

// export the functions
module.exports = {
    isValidFilename,
    isValidFilter,
    isValidLimit
};