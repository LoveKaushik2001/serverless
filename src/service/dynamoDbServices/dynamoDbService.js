const { awsConfig } = require("../../config/aws.config");
const aws = require("../../core/aws.dynamo");

const checkAndCreateTable = async (tableName) => {
    if (!tableName) {
        throw new Error("Table_NAME environment variable is not defined");
    }
    try {
        const tableExist = await aws.isTablePresent(tableName);
        if (!tableExist) {
            console.log("Creating Table: ", tableName);
            await aws.createTable(tableName);
            console.log(`Table : ${tableName} Created`);
        }
    } catch(error) {
        throw new Error ("Error while excessing table > " + error.message);
    }
}

module.exports = { checkAndCreateTable };