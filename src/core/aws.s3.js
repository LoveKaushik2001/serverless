const {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { awsConfig } = require("../config/aws.config");

const s3Client = new S3Client({ region: awsConfig.region });

const isBucketPresent = async (bucketName) => {
  const bucket = await s3Client.send(
    new HeadBucketCommand({ Bucket: bucketName })
  );
  return bucket;
};

const createBucket = async (bucketName) => {
  await s3Client.send(
    new CreateBucketCommand({
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: awsConfig.region,
      },
    })
  );
};

const uploadObjectToS3 = async(params) => {
  const command = new PutObjectCommand(params);
  const s3ResponseData = await s3Client.send(command);
  return s3ResponseData;
}

const generatePreSignedUrl = async (bucketName, key) => {
  console.log(key);
  const params = {
    Bucket: bucketName,
    Key: key
  };
  const command = new GetObjectCommand(params);
  const presignedUrl = await getSignedUrl(s3Client, command);
  return presignedUrl;
};

module.exports = { isBucketPresent, createBucket, uploadObjectToS3, generatePreSignedUrl };
