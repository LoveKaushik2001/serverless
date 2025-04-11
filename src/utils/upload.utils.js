const fs = require("fs");
const aws = require("../core/aws.s3");

const uploadToS3 = async (filePath, fileName, contentType) => {
  const fileContent = fs.readFileSync(filePath);
  if (!contentType) {
    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (fileName.endsWith('.png')) {
      contentType = 'image/png';
    } else if (fileName.endsWith('.gif')) {
      contentType = 'image/gif';
    } else {
      contentType = 'application/octet-stream';
    }
  }
  const bucketName = process.env.BUCKET_NAME;
  if (!bucketName) {
    throw new Error("BUCKET_NAME environment variable is not defined.");
  }

  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: contentType
    };
    const uploadResult = await aws.uploadObjectToS3(params);
    return uploadResult;
  } catch (error) {
    throw new Error(`Error uploading file over S3 > ${error.message}`);
  }
};

const deleteLocalFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  } catch (error) {
    console.warn(
      `Warning: Error deleting temporary file (${filePath}): ${error.message}`
    );
    return false;
  }
};

module.exports = { uploadToS3, deleteLocalFile };
