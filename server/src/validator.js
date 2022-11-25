const MIN_LIMIT = 1;
const MAX_LIMIT = 1000;

const MIN_FILTER_LENGTH = 1;
const MAX_FILTER_LENGTH = 100;

const LOG_PATH = process.env.LOG_PATH;

// Check if the filename doesn't contain any special characters, exists, and is not empty or null 
function isValidFilename(filename) {
    return new Promise((resolve, reject) => {
        console.log(`${LOG_PATH}/${filename}`);
        if (filename === null || filename === undefined || filename === '') {
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