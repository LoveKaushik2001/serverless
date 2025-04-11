const { DynamoDBClient, DescribeTableCommand, CreateTableCommand, waitUntilTableExists } = require("@aws-sdk/client-dynamodb")
const { awsConfig } = require("../config/aws.config");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const ddbClient = new DynamoDBClient({ region: awsConfig.region });

const isTablePresent = async (tableName) => {
    try {
        const command = new DescribeTableCommand({
            TableName: tableName,
        })
        const response = await ddbClient.send(command);
        return response;
    } catch (error) {
        if (error.name === "ResourceNotFoundException") {
            console.log("Table Not found");
            return false;;
        }
        throw new Error("Error while checking for table");
    }
}

const createTable = async (tableName) => {
    try {
        const command = new CreateTableCommand({
            TableName: tableName,
            AttributeDefinitions: [
                { AttributeName: "TimeStamp", AttributeType: "S" },
                { AttributeName: "UserID", AttributeType: "S" }
            ],
            KeySchema: [
                { AttributeName: "UserID", KeyType: "HASH" },
                { AttributeName: "TimeStamp", KeyType: "RANGE" }
            ],
            BillingMode: "PAY_PER_REQUEST"
        });
        await ddbClient.send(command);
        await waitUntilTableExists({ client: ddbClient, maxWaitTime: 60 }, { TableName: tableName });
    } catch (error) {
        throw new Error("Error while creating table > " + error.message)
    }
}

const createItem = async (params) => {
    try {
        const command = new PutCommand(params);
        const response = await ddbClient.send(command);
        return response;
    } catch (error) {
        throw new Error("Error while adding item to DynamoDb > " + error.message);
    }
}

module.exports = { isTablePresent, createTable, createItem };