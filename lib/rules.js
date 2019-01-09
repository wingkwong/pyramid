'use strict'

const { getRuleStore, getInputFileStore, getDataObjectStore } = require('./stores');
const { operators } = require('./operators');
const { logger, errorLogger } = require('./logger');
const { constants } = require('./constants');

const initRulesEngine = () => {
    logger('------------------------------------------------------------------------');
    logger('[INFO] Rule Engine Initialization');
    logger('------------------------------------------------------------------------');

    _execute();
}

const _execute = () => {
    const RULES_STORE = getRuleStore();
    RULES_STORE.map((rule, idx) => {
        logger(`[INFO] Processing Rule ${rule.id} : ${rule.name}`);
        _processWhen(rule.when);
    });
}

const _processWhen = (conditions) => {
    let hit = false;
    conditions.forEach(condition => {
        if(condition[constants.$AND]) {
            let objects = condition[constants.$AND];
            objects.forEach(object => {
                _processAnd(object)
            });
        } else if(condition[constants.$OR]) {
            let objects = condition[constants.$OR];
            _processOr(objects);
        } else if(condition[constants.FACT]) {
            _processCondition(condition);
        } else {
            errorLogger('[ERROR] Unexpected Conditions');
        }

    });
}

const _processAnd = (obj) => {
    _process(obj);
    //TODO:
}

const _processOr = (obj) => {
    _process(obj);
    //TODO:
}

const _process = (obj) => {
    if(obj[constants.$AND]) {
        _processAnd(obj[constants.$AND])
    } else if(obj[constants.$OR]) {
        _processOr(obj[constants.$OR])
    } else {
        if(Array.isArray(obj)) {
            obj.forEach(o => {
                _processCondition(o)
            });
        } else {
            _processCondition(obj)
        }
    }
}

const _processCondition = (obj) => {
    const { fact, operator, value } = obj;
    const DATA_OBJECT_STORE  = getDataObjectStore();
    const INPUT_FILE = getInputFileStore();
    var o = null;
    var hit = false;

    fact.split('.').forEach(part => {
        if(part.startsWith(constants.DATA_OBJECT_PREFIX)) {
            let partWithoutPrefix = part.replace(constants.DATA_OBJECT_PREFIX, '');
            o = o == null ? INPUT_FILE[partWithoutPrefix]: o[partWithoutPrefix];
        } else {
            let val = o[part];
            if(Array.isArray(o)) {
                hit = _evaluteArray(o, part, operator, value);
            } else {
                hit = _evaluate(val, operator, value);
            }
        }
    });

    //TODO:
}

const _evaluate = (val, operator, value) => {
    let hit = false;
    
    switch(operator) {
        case operators[0]: 
        // ==
        hit = val == value ? true : false;
        break;

        case operators[1]: 
        // >=
        hit = val >= value ? true : false;
        break;

        case operators[2]: 
        // <=
        hit = val <= value ? true : false;
        break;

        case operators[3]: 
        // >
        hit = val > value ? true : false;
        break;

        case operators[4]: 
        // <
        hit = val < value ? true : false;
        break;

        case operators[5]: 
        // !=
        hit = val != value ? true : false;
        break;
        
        default:
        
    }

    return hit;
}

const _evaluteArray = (objects, val, operator, value) => {
    let hit = false;
    for(var i=0; i<objects.length; i++) {
        let object = objects[i];
        hit = _evaluate(object[val], operator, value);
        if(hit) {
            break;
        }
    }
    return hit;
}

module.exports = {
    initRulesEngine
}