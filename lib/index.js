'use strict'

const { initLoader } = require('./loaders');
const { initValidator } = require('./validators');
const { initRulesEngine } = require('./rules');

const run = () => {
    initLoader();
    initValidator();
    initRulesEngine();
}

run();