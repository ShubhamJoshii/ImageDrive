// const dotenv = require("dotenv")
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUNDINARY_CLOUD_NAME,
  api_key: process.env.CLOUNDINARY_API_KEY,
  api_secret: process.env.CLOUNDINARY_API_SECRET,
  secure:true
});

const uploadImage = async (image, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      image,
      { overwrite: true, invalidate: true, resource_type: "auto", folder : folder },
      (error, result) => {
        if (result && result.secure_url) {
          return resolve(result.secure_url);
        }
        console.log(error.message);
        return reject({ message: error.message });
      }
    );
  });
};

module.exports = {cloudinary, uploadImage}