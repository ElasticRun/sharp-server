const express = require("express");
const path = require("path");

// Utils
const getClientInfo = require("./utils/getClientInfo");
const getSharpParams = require("./utils/getSharpParams");
const ImageDownloader = require("./utils/ImageDownloader");
const resizeImage = require("./utils/resizeImage");

const app = express();
let { PORT } = process.env;

PORT = PORT || 8000;

process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});

app.listen(PORT);
console.log(`Sharp-Server started on port ${PORT}`);

app.get("/sharp/image", async function (req, res) {
  const imageSourceUrl = req.query.url;

  //const clientInfo = getClientInfo(req.headers)
  const sharpParams = getSharpParams(req.query);

  // Download image to originals folder
  const imageDownloader = new ImageDownloader(imageSourceUrl);

  // Check if image is cached in originals folder. Download it otherwise
  let downloadPath = imageDownloader.getCachedImagePath();
  console.log(downloadPath);

  if (!downloadPath) {
    try {
      await imageDownloader.downloadImageAsync();
      downloadPath = path.resolve(
        __dirname,
        "originals",
        imageDownloader.fileName
      );
    } catch (e) {
      console.log("in");
      res.status(404).send("Not found");
      return false;
    }
  } else {
    console.log("Image found in cache");
  }

  // Resize and return
  res.type(imageDownloader.mimeType);
  resizeImage(downloadPath, sharpParams).pipe(res);
});
