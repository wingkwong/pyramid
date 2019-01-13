'use strict'

const { getRuleStore, getInputFileStore, getDataObjectStore } = require('./stores');
const { operators } = require('./operators');
const { logger, errorLogger } = require('./loggers');
const { constants } = require('./constants');

const initValidator = () => {
    logger('------------------------------------------------------------------------');
    logger('[INFO] Validator Initialization');
    logger('------------------------------------------------------------------------');
    _validateRules();
    _validateInput();
}

const _validateRules = () => {
    const RULES_STORE = getRuleStore();
    RULES_STORE.forEach( rule => {
        _validateProperties(rule);
        _validateId(rule);
        _validateWhen(rule);
        //_validateThen(rule);
    }); 
    logger('[INFO] Validation Finished. No errors found');
}

const _validateProperties = (rule) => {
    if(!rule.hasOwnProperty(constants.ID) ||
        !rule.hasOwnProperty(constants.NAME) || 
        !rule.hasOwnProperty(constants.DESCRIPTION) || 
        !rule.hasOwnProperty(constants.WHEN) 
        //!rule.hasOwnProperty(constants.THEN)) 
    ){
        errorLogger('[ERROR] Not enough rule fields');
    }
}

const _validateId = (rule) => {
    let id = [];
    if(!id.includes(rule.id)) {
        id.push(rule.id);
    } else {
        errorLogger(`[ERROR] Duplicated ID found in rule ${rule.id} - ${rule.name}`);
    }
}

const _validateWhen = (rule) => {
    let when = rule.when;
    if (!Array.isArray(when)) {
        errorLogger(`[ERROR] Instance type of when is not Array in rule ${rule.id} - ${rule.name}`);
    } 

    if(when.length == 0) {
        errorLogger(`[ERROR] No condition is defined in rule ${rule.id} - ${rule.name}`);
    }

    when.forEach(obj =>{
        if(obj.hasOwnProperty(constants.$AND)) {
            _validateAnd(rule.id, rule.name, obj[constants.$AND]);
        } else if(obj.hasOwnProperty(constants.$OR)) {
            _validateOr(rule.id, rule.name, obj[constants.$OR]);
        } else {
            _validateCondition(rule.id, rule.name, obj);
        }
    });
}

const _validateThen = (rule) => {
    //TODO:
}

const _validateAnd = (id, name, o) => {
    if(!Array.isArray(o)) {
        errorLogger(`[ERROR] Instance type of $and is not Array in rule ${id} - ${name}`);
    }
    
    if(o.length < 2) {
        errorLogger(`[ERROR] Instance $and should contain at least two conditions in rule ${id} - ${name}`);
    }
}

const _validateOr = (id, name, o) => {
    if(!Array.isArray(o)) {
        errorLogger(`[ERROR] Instance type of $or is not Array in rule ${id} - ${name}`);
    }

    if(o.size < 2) {
        errorLogger(`[ERROR] Instance $or should contain at least two conditions in rule ${id} - ${name}`);
    }
}

const _validateCondition = (id, name, o) => {
    if(!o.hasOwnProperty(constants.FACT) || !o.hasOwnProperty(constants.OPERATOR) || !o.hasOwnProperty(constants.VALUE) ) {
        errorLogger(`[ERROR] Not enough properties for a condition defined in rule ${id} - ${name}`);
    }
    
    if(!operators.includes(o.operator)) {
        errorLogger(`[ERROR] Invalid operator defined in rule ${id} - ${name}`)
    }

    const fact = o.fact;
    const val = o.value;
    let factSplit = fact.split('.');
    let parent = null;
    factSplit.forEach(part => {
       _validateFact(id, name, val, parent, part);
       parent = part;
    });
}

const _validateFact = (id, name, val, parent, part) => {
    if(part == undefined) {
        errorLogger(`[ERROR] Invalid fact in DATA_OBJ_DIR in rule ${id} - ${name}`);
    }

    const DATA_OBJECT_STORE  = getDataObjectStore();

    if(part.startsWith(constants.DATA_OBJECT_PREFIX)) {
        const obj = DATA_OBJECT_STORE[part];
        if(!obj) {
            errorLogger(`[ERROR] Cannot find ${part} in DATA_OBJ_DIR in rule ${id} - ${name}`);
        }
    } else {
        const obj = DATA_OBJECT_STORE[parent];
        if(obj.type == 'array') {
            _validateFact(id, name, val, obj.value, part);
        } else if (obj.type == 'object') {
            if(!obj.value.hasOwnProperty(part)) {
                errorLogger(`[ERROR] Invalid ${part} in DATA_OBJ_DIR in rule ${id} - ${name}`);
            }
            
            if(obj.value[part] != typeof val) {
                errorLogger(`[ERROR] Invalid data type for ${part} in DATA_OBJ_DIR in rule ${id} - ${name}`);
            }
        } else {
            errorLogger(`[ERROR] Invalid ${part} in DATA_OBJ_DIR in rule ${id} - ${name}`);
        }
    }
}

const _validateInput = () => {
    const INPUT_FILE = getInputFileStore();
    valdate(INPUT_FILE, null);
}

const valdate = (segment, parent) => {
    const DATA_OBJECT_STORE = getDataObjectStore()
    let arr = Array.isArray(segment) ? segment : Object.keys(segment);
    
    arr.forEach(key => {
        if(typeof segment[key] == constants.OBJECT_TYPE) {
            if(!DATA_OBJECT_STORE[constants.DATA_OBJECT_PREFIX + key]) {
                errorLogger(`[ERROR] key ${key} hasn't been defined in DATA_OBJECT_STORE`);
            }
            parent = key
            valdate(segment[key], parent);
        }
        
        if(parent != key) {
            let dataType = DATA_OBJECT_STORE[constants.DATA_OBJECT_PREFIX + parent].value[key];
            if(!dataType) {
                //errorLogger(`[ERROR] attribute ${key} hasn't been defined in DATA_OBJECT_STORE`);
            } else {
                if(dataType != typeof segment[key]) {
                    errorLogger(`[ERROR] Invalid data type for key ${key} defined in DATA_OBJECT_STORE`);
                }
            }
        }
    });
}
 
module.exports = {
    initValidator
}