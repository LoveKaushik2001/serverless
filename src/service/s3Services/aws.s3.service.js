const {
  checkAndCreateBucket,
  storeAndGetImageUrl,
} = require("./bucketService");
const { parseMultipartData } = require("../../utils/parse.utils");
const { resizeImage, getBasicFileMetaData } = require("../../utils/config");
const { awsConfig } = require("../../config/aws.config");
const {
  addItemToLogDynamoTable,
} = require("../dynamoDbServices/aws.dynamoDb.service");
const { FILE_STATUS } = require("../../constants/config.constant");

const bucketName = awsConfig.bucketName;
let logFileName = '';
const handleS3Uploading = async (event) => {
  try {
    await checkAndCreateBucket(bucketName);
    const { files } = await parseMultipartData(event);
    if (!files || files.length === 0 || !files.image) {
      throw new Error("No image file provided");
    }
    const file = files.image;
    let metaData = getBasicFileMetaData(file);
    logFileName = metaData.OriginalFileName;
    const processingLogItemParams = {
      ...metaData,
      Status: FILE_STATUS.PROCESSING
    };
    await addItemToLogDynamoTable(processingLogItemParams, awsConfig.tableName);
    const { originalFileParams, resizedFileParams } = await fileProcessing(metaData, file);
    const { originalImageUrl, processedImageUrl } = await fileUploading(metaData, originalFileParams, resizedFileParams);
    return {
      original: originalImageUrl,
      edited: processedImageUrl,
    };
  } catch (error) {
    throw new Error(`Error while handling upload ${logFileName ?? 'for '+logFileName} > ` + error.message);
  }
};

const fileProcessing = async (metaData, file) => {
  const originalFileParams = {
    fileName: file.filename,
    filePath: file.path,
    contentType: file.contentType,
  };
  const resizedFileParams = await resizeImage(file);
  const processedLogItemParams = {
    ...metaData,
    Status: FILE_STATUS.PROCESSED
  };
  await addItemToLogDynamoTable(processedLogItemParams, awsConfig.tableName);
  return { originalFileParams, resizedFileParams }
}

const fileUploading = async (metaData, params, resizedFileParams) => {
  const originalKeyPrefix = process.env.ORIGINAL_FOLDER_STRUCT;
  const processedKeyPrefix = process.env.PROCESSED_FOLDER_STRUCT;
  const originalImageUrl = await storeAndGetImageUrl(
    bucketName,
    params,
    originalKeyPrefix
  );
  const processedImageUrl = await storeAndGetImageUrl(
    bucketName,
    resizedFileParams,
    processedKeyPrefix
  );
  const uploadedLogItemParams = {
    ...metaData,
    ProcessedImageUrl: processedImageUrl,
    OriginalImageUrl: originalImageUrl,
    Status: FILE_STATUS.UPLOADED,
  };
  await addItemToLogDynamoTable(uploadedLogItemParams, awsConfig.tableName);
  return { originalImageUrl, processedImageUrl }
}

module.exports = { handleS3Uploading };

/**
 * meta data consist of :
 * {
 *  originalFileName
 *  contentType
 *  url - original and processed whichever available
 *  status
 * }
 */
