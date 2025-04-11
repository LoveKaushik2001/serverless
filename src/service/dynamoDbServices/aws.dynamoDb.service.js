const { checkAndCreateTable } = require("./dynamoDbService");
const awsDynamo = require("../../core/aws.dynamo");

const addItemToLogDynamoTable = async (paramItem, tableName) => {
  try {
    const param = {
      TableName: tableName,
      Item: {
        ...paramItem,
        TimeStamp: new Date().toString(),
      },
    };
    await checkAndCreateTable(tableName);
    const response = await awsDynamo.createItem(param);
    return response;
  } catch (error) {
    throw new Error(
      "Error occurred in dynamoDB execution process > " + error.message
    );
  }
};

module.exports = { addItemToLogDynamoTable };
