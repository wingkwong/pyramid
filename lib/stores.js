'use strict'

this.DATA_OBJECTS_STORE = {};
this.RULES_STORE = [];
this.INPUT_FILE_STORE = {};

const getInputFileStore = () => {
    return this.INPUT_FILE_STORE;
}

const setInputFileStore = (input) => {
    this.INPUT_FILE_STORE = input;
}

const getDataObjectStore = () => {
    return this.DATA_OBJECTS_STORE;
}

const setDataObjectStore = (dataObject) => {
    this.DATA_OBJECTS_STORE = {...this.DATA_OBJECTS_STORE, ...dataObject};
    console.log(this.DATA_OBJECTS_STORE)
}

const getRuleStore = () => {
    return this.RULES_STORE;
}

const setRuleStore = (rule) => {
    this.RULES_STORE.push(rule);
}


module.exports = {
    getInputFileStore,
    setInputFileStore,
    getDataObjectStore,
    setDataObjectStore,
    getRuleStore,
    setRuleStore
}