const aws = require("../../core/aws.s3");
const uploadUtil = require("../../utils/upload.utils");

const checkAndCreateBucket = async (bucketName) => {
  if (!bucketName) {
    throw new Error("BUCKET_NAME environment variable is not defined");
  }
  try {
    await aws.isBucketPresent(bucketName);
    console.log(`Bucket ${bucketName} exists.`);
  } catch (error) {
    if (error.$metadata?.httpStatusCode === 404) {
      console.log(`Bucket ${bucketName} does not exist. Creating it...`);
      await aws.createBucket(bucketName);
      console.log(`Bucket ${bucketName} created successfully.`);
    } else {
      throw new Error(`Error while Checking bucket > ${error.message}`);
    }
  }
};

const storeAndGetImageUrl = async (bucketName, file, keyPrefix) => {
  try {
    const fileName = file.fileName;
    const contentType = file.contentType;
    const filePath = file.filePath;
    const key = keyPrefix + fileName;
    await uploadUtil.uploadToS3(filePath, key, contentType);
    await uploadUtil.deleteLocalFile(filePath);
    const url = await aws.generatePreSignedUrl(bucketName, key);
    return url;
  } catch (error) {
    throw new Error("Error occured while uploading the object in " + keyPrefix + " over s3 or getting presigned url > " + error.message);
  }
};

module.exports = { checkAndCreateBucket, storeAndGetImageUrl };