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
        logger(`[INFO] Processing Rule ${rule.id} - ${rule.name}`);
        _processRule(rule);
    });
}

const _processRule = (rule) => {
    let conditions = rule.when;
    let result = true;
    for(var i=0; i<conditions.length; i++) {
        let condition = conditions[i];
        result = _evalate(condition) && result;
    }
    logger(`[INFO] The result of Rule ${rule.id} - ${rule.name} is ${result}`);
}

const _evalate = (condition) => {
    if(condition[constants.$AND]) {
        let objects = condition[constants.$AND];
        return _process(objects[0]) && _process(objects[1]);
    } else if(condition[constants.$OR]) {
        let objects = condition[constants.$OR];
        return _process(objects[0]) || _process(objects[1]);
    } else if(condition[constants.FACT]) {
        return _process(condition);
    } else {
        errorLogger('[ERROR] Unexpected Conditions');
    }
}

const _process = (obj, cond) => {
    if(obj[constants.$AND]) {
        return _process(obj[constants.$AND], constants.$AND)
    } else if(obj[constants.$OR]) {
        return _process(obj[constants.$OR], constants.$OR)
    } else {
        if(Array.isArray(obj)) {
            return cond == constants.$AND ? 
                _processCondition(obj[0]) && _processCondition(obj[1]) :
                _processCondition(obj[0]) || _processCondition(obj[1]);
        } else {
            return _processCondition(obj)
        }
    }
}

const _processCondition = (obj) => {
    const { fact, operator, value } = obj;
    const INPUT_FILE = getInputFileStore();
    var o = null;
    var result = false;

    fact.split('.').forEach(part => {
        if(part.startsWith(constants.DATA_OBJECT_PREFIX)) {
            let partWithoutPrefix = part.replace(constants.DATA_OBJECT_PREFIX, '');
            o = o == null ? INPUT_FILE[partWithoutPrefix]: o[partWithoutPrefix];
        } else {
            result = Array.isArray(o) ? 
                    _evaluteArray(o, part, operator, value) : 
                    _evaluateObject(o[part], operator, value);
        }
    });
    return result;
}

const _evaluateObject = (val, operator, value) => {
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
        hit = _evaluateObject(object[val], operator, value);
        if(hit) {
            break;
        }
    }
    return hit;
}

module.exports = {
    initRulesEngine
}