'use strict'

const { initLoader } = require('./loader');
const { initValidator } = require('./validator');
const { initRulesEngine } = require('./rules');

const run = () => {
    initLoader();
    initValidator();
    initRulesEngine();
}

run();