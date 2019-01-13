'use strict'

const logger = (message) => {
    console.log(message)
}

const errorLogger = (message) => {
    console.error(message);
    process.exit();
}

module.exports = {
    logger,
    errorLogger
}