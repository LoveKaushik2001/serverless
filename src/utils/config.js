const path = require("path");
const sharp = require("sharp");

const resizeImage = async (file) => {
  try {
    const fileName = file.filename;
    const filePath = file.path;
    const resizedFilePath = path.resolve(
      filePath.replace(
        path.extname(fileName),
        `-resized${path.extname(fileName)}`
      )
    );
    await sharp(filePath)
      .resize(800, 600, { fit: sharp.fit.inside, withoutEnlargement: true })
      .toFile(resizedFilePath);
    const resizedFile = {
      fileName: fileName.replace(
        path.extname(fileName),
        `-resized${path.extname(fileName)}`
      ),
      filePath: resizedFilePath.toString(),
      contentType: file.contentType,
    };
    return resizedFile;
  } catch (error) {
    throw new Error(
      "Error while processing the file > " + error.message
    );
  }
};

const getBasicFileMetaData = (file) => {
  const { originalname, contentType } = file;
  return {
    UserID: process.env.USER_ID,
    OriginalFileName: originalname,
    ContentType: contentType,
  };
};

module.exports = { resizeImage, getBasicFileMetaData };
