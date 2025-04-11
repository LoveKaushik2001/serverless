"use strict";
const awsServices = require("../service/s3Services/aws.s3.service")
const bucketService = require ("../service/s3Services/bucketService")
const { addItemToLogDynamoTable } = require("../service/dynamoDbServices/aws.dynamoDb.service")
const { sendMail } = require("../utils/mailer")
const { awsConfig } = require("../config/aws.config");

module.exports.uploadFn = async (event) => {
  try {
    if (event.httpMethod === "GET") {
      await bucketService.checkAndCreateBucket(awsConfig.bucketName);
      await sendMail(`Server passed the health check`, process.env.USER_MAIL_ID, 'Status Logs');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Server is up and running!" }),
      };
    }

    if (event.httpMethod === "POST") {
      const preSignedUrl = await awsServices.handleS3Uploading(event);
      await sendMail(`Image has been successfully uploaded. Original-URL: ${preSignedUrl.original}, Processed-URL: ${preSignedUrl.edited}`, process.env.USER_MAIL_ID, 'Status Logs');
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Image has been successfully uploaded.",
          data: preSignedUrl, 
        }),
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Unsupported HTTP method" }),
    };
  } catch (error) {
    const errorLogParam = {
      UserID: process.env.USER_ID,
      error: error.message
    }
    await addItemToLogDynamoTable(errorLogParam, awsConfig.tableName);
    await sendMail(`Some error occurred while processing and uploading. Error: ${error.message}`, process.env.USER_MAIL_ID, 'Status Logs');
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `ERROR : ${error.message}`,
      }),
    };
  }
};
