const fs = require("fs");
const join = require("path").join;
const AWS = require("aws-sdk");
const s3Zip = require("s3-zip");
const XmlStream = require("xml-stream");

// EDIT THESE!
const region = "<CHANGEME>"; // e.g. us-east-1
const bucket = "<CHANGEME>";
const folder = "<CHANGEME>";
// DONT EDIT PAST THIS LINE
const s3 = new AWS.S3({ region: region });
const params = {
  Bucket: bucket,
  Prefix: folder,
};

const filesArray = [];
const files = s3.listObjects(params).createReadStream();
const xml = new XmlStream(files);
xml.collect("Key");
xml.on("endElement: Key", function (item) {
  filesArray.push(item["$text"].substr(folder.length));
});

xml.on("end", function () {
  zip(filesArray);
});

function zip(files) {
  console.log(files);
  const output = fs.createWriteStream(join(__dirname, "s3-zip.zip"));
  s3Zip
    .archive(
      { region: region, bucket: bucket, preserveFolderStructure: true },
      folder,
      files
    )
    .pipe(output);
}
