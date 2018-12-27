'use strict'

const fs = require('fs');
const path = require('path');
const { logger, errorLogger } = require('./logger');

let { setRuleStore, setInputFileStore, setDataObjectStore} = require('./store');

const initLoader = () => {
    logger('------------------------------------------------------------------------');
    logger('[INFO] Load Initialization');
    logger('------------------------------------------------------------------------');
    loadConfig();
}

const loadConfig = () => {
    const config = process.argv[2];
    if(config) {
        const isExistConfig = fs.existsSync(config);
        if(isExistConfig) {
            logger('[INFO] Loading Configuration file');
            let cfg = null;
            try {
                cfg = fs.readFileSync(config);
                cfg = cfg.toString();
                cfg = JSON.parse(cfg);
                const { 
                    DATA_OBJ_DIR,
                    RULES_DIR,
                    INPUT_FILE
                } = cfg;
                _loadDataObjects(DATA_OBJ_DIR);
                _loadRules(RULES_DIR);
                _loadInputFile(INPUT_FILE);
            } catch (e) {
                errorLogger('[ERROR] Failed to read configuration file');
            }
        } else {
            errorLogger('[ERROR] Configuration file not found');
        }
    } else {
        errorLogger('[ERROR] No Configuration file found');
    }
}

const _loadDataObjects = (DATA_OBJ_DIR) => {
    logger(`[INFO] Loading Data Objects: ${DATA_OBJ_DIR}`);
    const isExistDataObjDir = fs.existsSync(DATA_OBJ_DIR);
    if(isExistDataObjDir) {
        let files = [];
        try {
            files = fs.readdirSync(DATA_OBJ_DIR);
            files.map((file) => {
                const dataObjDir = path.join(DATA_OBJ_DIR, file);
                let data = null;
                try {
                    logger(`[INFO] Loading data object ${dataObjDir}`);
                    data = fs.readFileSync(dataObjDir);
                    if(data) {
                        data = data.toString();
                        data = JSON.parse(data);
                        setDataObjectStore(data);
                    }
                } catch (e) {
                    console.log(e)
                    errorLogger(`[ERROR] Failed to read data object ${dataObjDir}`);
                }
            })
        } catch (e) {
            errorLogger('[ERROR] Failed to read data object directory');
        }
    } else {
        errorLogger ('[ERROR] Data object directory not found');
    }
}

const _loadRules = (RULES_DIR) => {
    logger(`[INFO] Loading Rules ${RULES_DIR}`);
    const isExistDataObjDir = fs.existsSync(RULES_DIR);
    if(isExistDataObjDir) {
        let files = [];
        try {
            files = fs.readdirSync(RULES_DIR);
            files.map((file) => {
                const rulesDir = path.join(RULES_DIR, file);
                let data = null;
                try {
                    logger(`[INFO] Loading rule file ${rulesDir}`);
                    data = fs.readFileSync(rulesDir);
                    if(data) {
                        data = data.toString();
                        data = JSON.parse(data);
                        setRuleStore(data);
                    }
                } catch (e) {
                    errorLogger(`[ERROR] Failed to read rules ${rulesDir}`);
                }
            })
        } catch (e) {
            errorLogger('[ERROR] Failed to read rule directory');
        }
    } else {
        errorLogger ('[ERROR] Rule directory not found');
    }
}

const _loadInputFile = (INPUT_FILE) => {
    logger(`[INFO] Loading Input File ${INPUT_FILE}`);
    const isExistInputFile = fs.existsSync(INPUT_FILE);
    if(isExistInputFile) {
        let file = null;
        try {
            file = fs.readFileSync(INPUT_FILE);
            file = file.toString();
            file = JSON.parse(file);
            setInputFileStore(file);
        } catch (e) {
            errorLogger('[ERROR] Failed to read input file');
        }
    } else {
        errorLogger ('[ERROR] Input file not found');
    }
}

module.exports = {
    initLoader
}