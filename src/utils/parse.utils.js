const busboy = require("busboy");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const parseMultipartData = (event) => {
  return new Promise((resolve, reject) => {
    const bb = busboy({
      headers: {
        "content-type":
          event.headers["content-type"] || event.headers["Content-Type"],
      },
    });

    const result = {
      files: {},
      fields: {},
    };

    const tmpDir = process.env.IS_OFFLINE ? "./tmp" : "/tmp";
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const fileWritePromises = [];

    bb.on("file", (fieldname, file, info) => {
      const { filename, encoding, mimeType } = info;
      const saveTo = path.resolve(path.join(tmpDir, `${uuidv4()}-${filename}`));
      const writeStream = fs.createWriteStream(saveTo);
      let fileSize = 0;
      file.on("data", (data) => {
        fileSize += data.length;
      });
      file.pipe(writeStream);

      const filePromise = new Promise((res, rej) => {
        writeStream.on("finish", () => {
          result.files[fieldname] = {
            filename,
            contentType: mimeType,
            encoding,
            path: saveTo,
            originalname: filename,
            size: fileSize,
          };
          res();
        });

        writeStream.on("error", (err) => {
          console.error(`Error saving file in parser: ${err.message}`);
          rej(err);
        });
      });
      fileWritePromises.push(filePromise);

      result.files[fieldname] = {
        filename,
        contentType: mimeType,
        encoding,
        path: saveTo,
        originalname: filename,
      };
    });

    bb.on("field", (fieldname, value) => {
      result.fields[fieldname] = value;
    });

    bb.on("error", (error) => {
      reject(error);
    });

    bb.on("finish", async () => {
      try {
        await Promise.all(fileWritePromises);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });

    if (event.isBase64Encoded) {
      bb.write(Buffer.from(event.body, "base64"));
    } else {
      bb.write(event.body);
    }
    bb.end();
  });
};

module.exports = { parseMultipartData };
