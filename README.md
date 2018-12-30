# pyramid
JSON-based Business Rules Engine

## Configuration

- Create a file named pyramid.cfg 
- Define the paths for `DATA_OBJ_DIR`, `RULES_DIR` and `INPUT_FILE`
- Example:
``
{
    "DATA_OBJ_DIR": "../example/loan-application/data_objects/",
    "RULES_DIR": "../example/loan-application/rules/",
    "INPUT_FILE": "../example/loan-application/input.json"
}
``

## Define data object
- Create a file with an extension .data under `DATA_OBJ_DIR`

## Define rule 
- Create a file with an extension .rule under `RULES_DIR`

## Define input file 
- Create a file with an extension .json as `INPUT_FILE`

## Run
``
node index.js <PYRAMID_CFG_PATH>
``