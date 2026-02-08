const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type"), false);
    }
};

const upload = multer({ storage: storage,
     fileFilter: fileFilter ,
      limits: { fileSize: 1024 * 1024 * 5 } });

      const uploadToCloudinary = async (file, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      )
      .end(file.buffer);
  });
};

module.exports = {
  upload,
  uploadToCloudinary,
};
