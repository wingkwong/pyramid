# pyramid
JSON-based Business Rules Engine

## Installing
````
npm install pyramid-rules-engine
````

## Modules
pyramid contains serveral modules - ``loader``, `validator`, `stores`, `loggers`, `operators`, `rules`. 

### Loader
Loader is responsible for loading data files such as data objects and input json file. If data is not found, the rule engine would stop immediately and throw related errors.

### Validator 
Validator is responsible for validating the input source loaded by Loader. The scope includes rule properties, rule id and rule conditions.

### Rule Properties
Properties such as ``id``, ``name``, ``when`` are mandatory.

### Rule ID
Rule ID must be unqiue.

### Rule Conditions
Rule conditions are objects defined in ``when``. Each object can contain other nested objects.

#### $AND and $OR
If you want to define a condition with a logical operators such as AND and OR. You have to use an array with the attribute `$and` and `or`. Each array could only contain two objects. Nested objects are also supported.

#### Condition
A condition is an an object with three attributes - ``fact``, ``operator`` and ``value``

``fact``: The target attribute which is being used to evalute. It has to be started with a data object, such as ``$$bankruptcy.amountOwed``. Another example for a data object is inside another object would be ``$$applicant.$$applicantAddress.zipcode``.

``operator`: Please refer to Operators below.

``value``: The value is used to compare with the one in input file.

A condition will be evaluted and return a boolean indicating if the condition is met with the defined criteria.


### Stores
Stores is responsible for centralizing stores such as ``DATA_OBJECTS_STORE``, ``RULES_STORE``, ``INPUT_FILE_STORE`` and ``RESULT_STORE``

### Loggers
Loggers is responsible for logging. Two loggers are available. 

Normal Logger: 
````
logger('Normal Logger');
````

Error Logger: 
````
errorLogger('Normal Logger');
````

### Operators 
Operators is responsible for performing mathematical operations. Six operators are available which are ``==``, ``>=``, ``<=``, ``>``, ``<`` and ``!=``. 

### Rules
Rules is responsible for initializing the rule engine, process and evalute the defined rules based on the input file and return the result.

## Configuration

- Create a file named pyramid.cfg 
- Define the paths for `DATA_OBJ_DIR`, `RULES_DIR` and `INPUT_FILE`
- Example:
````
{
    "DATA_OBJ_DIR": "../example/loan-application/data_objects/",
    "RULES_DIR": "../example/loan-application/rules/",
    "INPUT_FILE": "../example/loan-application/input.json"
}
````

## Define data object
- Create a file with an extension .data under `DATA_OBJ_DIR`
- A data object has to be started with `$$`
- Example:
````
{
    "$$applicant": {
        "type": "object",
        "value": {
            "age": "number",
            "applicantAddress": "$$applicantAddress"
        }
    }
}
````

## Define rule 
- Create a file with an extension .rule under `RULES_DIR`
- Example: Sample Rule
````
{
    "id": 1,
    "name": "checkApplicantAge",
    "description": "Check applicant age ",
    "when": [
        {
            "fact": "$$applicant.age",
            "operator": ">=",
            "value": 25
        }
    ]
}
````
- Example 2: Complex Rule
````
{
    "id": 0,
    "name": "Loan Application",
    "description": "Check if loan application is approved or rejected ",
    "when": [
        {
            "$and": [
                {
                    "fact": "$$applicant.age",
                    "operator": "<=",
                    "value": 25
                },
                {
                    "$or": [
                         {
                            "fact": "$$bankruptcy.amountOwed",
                            "operator": "==",
                            "value": 100000
                        },
                        {
                            "fact": "$$incomeSource.amount",
                            "operator": ">=",
                            "value": 30000
                        }
                    ]
                }
            ]
        },
        {
            "fact": "$$applicant.$$applicantAddress.zipcode",
            "operator": "==",
            "value": "5223"
        },
        {
            "fact": "$$coApplicant.name",
            "operator": "==",
            "value": "Milena Sears"
        }
    ]
}
````

## Define input file 
- Create a file with an extension .json as `INPUT_FILE`
- Example:
````
{
    "applicant": {
        "name": "Zayna Wainwright",
        "age": 24,
        "occupation": "N/A",
        "applicantAddress": {
            "address": "2752  Star Route",
            "zipcode": "60634"
        }
    }, 
    "bankruptcy": {
        "amountOwed": 3000
    },
    "incomeSource": {
        "amount": 35000
    },
    "coApplicant": [
        {
            "name": "Milena Sears",
            "applicantReferralCode": "CA1234"
        },
        {
            "name": "Clement Simpson",
            "applicantReferralCode": "CA2345"
        }
    ]
}
````

## Run
````
node pyramid.js <PYRAMID_CFG_PATH>
````

## Example
The example can be found in folder [example](https://github.com/wingkwong/pyramid/tree/master/example)

## Example Result
````
------------------------------------------------------------------------
[INFO] Load Initialization
------------------------------------------------------------------------
[INFO] Loading Configuration file
[INFO] Loading Data Objects: ../example/loan-application/data_objects/
[INFO] Loading data object ../example/loan-application/data_objects/applicant.data
[INFO] Loading data object ../example/loan-application/data_objects/applicantAddress.data
[INFO] Loading data object ../example/loan-application/data_objects/bankruptcy.data
[INFO] Loading data object ../example/loan-application/data_objects/coApplicant.data
[INFO] Loading data object ../example/loan-application/data_objects/coApplicantObject.data
[INFO] Loading data object ../example/loan-application/data_objects/incomeSource.data
[INFO] Loading Rules ../example/loan-application/rules/
[INFO] Loading rule file ../example/loan-application/rules/checkApplicantAge.rule
[INFO] Loading rule file ../example/loan-application/rules/loanApplication.rule
[INFO] Loading Input File ../example/loan-application/input.json
------------------------------------------------------------------------
[INFO] Validator Initialization
------------------------------------------------------------------------
[INFO] Validation Finished. No errors found
------------------------------------------------------------------------
[INFO] Rule Engine Initialization
------------------------------------------------------------------------
[INFO] Processing Rule 1 - Check Applicant Age
[INFO] Processing Rule 0 - Loan Application
------------------------------------------------------------------------
[INFO] Rule Engine Result Summary
------------------------------------------------------------------------
[INFO] Rule 1 (Check Applicant Age) : SUCCESS
[INFO] Rule 0 (Loan Application) : FAILURE
````