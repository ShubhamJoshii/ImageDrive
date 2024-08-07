const express = require("express");
const router = express.Router();

const { UsersModel, StorageModel } = require("./Database");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Authenication = require("./Authenication");

const { cloudinary, uploadImage } = require("./configCloudnary");

function formatDateToISO(date) {
  const pad = (number) => number.toString().padStart(2, "0");
  const padMilliseconds = (number) => number.toString().padStart(3, "0");

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1); // months are zero-indexed
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  const milliseconds = padMilliseconds(date.getUTCMilliseconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+00:00`;
}

// Home Route get fetch info of user if user is logged onto a webpage
router.get("/home", Authenication, async (req, res) => {
  if (req.rootUser) {
    const data = await UsersModel.findOne(
      { _id: req.userID },
      "Name Email Profile"
    );
    res.send({
      data,
      result: true,
    });
  } else {
    res.send({ result: false });
  }
});

// for Registering a New User
router.post("/register", async (req, res) => {
  const { Name, Email, Password, Confirm_Password } = req.body;
  // console.log(req.body);
  if (Password === Confirm_Password && Password.length >= 8) {
    const date = await formatDateToISO(new Date());

    const emailExist = await UsersModel.findOne({ Email });
    if (emailExist) {
      // console.log("User Email Exists");
      return res.send({
        message: "User Email is Already Exist",
        result: false,
      });
    }
    const userData = new UsersModel({
      Name,
      Email,
      Password,
    });
    const savedData = await userData.save();

    const createStorage = await StorageModel({
      UserID: savedData._id,
      Files: [
        {
          path: "/",
          FolderName: "/",
          lastUpdate: date,
        },
      ],
    });
    await createStorage.save();

    return res.send({ message: "User Email Registed Now Login", result: true });
  } else if (Password !== Confirm_Password) {
    res.send({ message: "Password should greater than 8", result: false });
  }
});

// for user Login into webpage
router.post("/login", async (req, res) => {
  const { Email, Password } = req.body;

  const Login_Date = Date().toString();
  try {
    const userExist = await UsersModel.findOne({ Email });
    if (userExist) {
      const passwordMatch = await bcrypt.compare(Password, userExist.Password);
      if (passwordMatch) {
        userExist.Login = userExist.Login.concat({ Login_Date });
        const Token = await userExist.generateAuthToken();
        // console.log(Token);
        res.cookie("JoshiStorageToken", Token, {
          expires: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
          httpOnly: true,
        });
        userExist.save();
        res.send({ message: "User logged in", result: true });
      } else {
        res.send({ message: "Password doesn't Matched", result: false });
      }
    } else {
      res.send({ message: "Entered Email is Not Exists", result: false });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post(`/updateProfileDP`, Authenication, async (req, res) => {
  // console.log(req.body.image);
  if (req.rootUser.Profile) {
    const imageID =
      "ProfileImage" +
      req.rootUser.Profile.split("/ProfileImage")[1].replace(/\.[^/.]+$/, "");
    try {
      const result = await cloudinary.uploader.destroy(imageID);
      await uploadImage(req.body.image, req.body.folder)
        .then(async (url) => {
          const updateUser = await UsersModel.updateOne(
            { _id: req.userID },
            { $set: { Profile: url } }
          );
          res.send(url);
        })
        .catch((err) => res.send(500).send(err));
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  } else {
    await uploadImage(req.body.image, req.body.folder)
      .then(async (url) => {
        const updateUser = await UsersModel.updateOne(
          { _id: req.userID },
          { $set: { Profile: url } }
        );
        res.send(url);
      })
      .catch((err) => res.send(500).send(err));
  }
});

router.post(`/uploadImage`, Authenication, async (req, res) => {
  const { path, image, ImageName } = req.body;
  const date = await formatDateToISO(new Date());

  uploadImage(image, `storage/${req.userID}`)
    .then(async (url) => {
      const storageExists = await StorageModel.findOne({ UserID: req.userID });
      if (storageExists) {
        // console.log(storageExists)
        const Files = await storageExists.Files.map((curr) => {
          if (curr.path === path) {
            console.log(curr.path === path);
            let temp = [
              ...curr.ImageURls,
              { URL: url, ImageName, createdAt: date },
            ];
            return {
              path: curr.path.replace(/ /g, "").replace(/\/\//, "/"),
              FolderName: curr.path.replace(/\/\//, "/"),
              ImageURls: temp,
              lastUpdate: date,
            };
          }
          return curr;
        });
        storageExists.Files = Files;
        await storageExists.save();

        return res.send({ message: "Image Uploaded", success: true });
      }
    })
    .catch((err) => res.send(500).send(err));
});

router.post(`/createFolder`, Authenication, async (req, res) => {
  const { path, folderName } = req.body;
  const date = await formatDateToISO(new Date());
  const storageExists = await StorageModel.findOne({ UserID: req.userID });
  if (storageExists) {
    storageExists.Files = await [
      ...storageExists.Files,
      {
        path: `${path}/${folderName}`.replace(/ /g, "").replace(/\/\//, "/"),
        FolderName: `${folderName}`,
        lastUpdate: date,
      },
    ];
    await storageExists.save();
    res.send({ message: "Folder Created" });
  } else {
    const newStorage = await StorageModel({
      UserID: req.userID,
      Files: [
        {
          path: `${path}/${folderName}`.replace(/ /g, "").replace(/\/\//, "/"),
          // path: `${path}/${folderName}`.replace(/ /g,''),
          FolderName: `${folderName}`,
          lastUpdate: date,
        },
      ],
    });
    await newStorage.save();
    res.send({ message: "Folder Created" });
  }
});

router.get(`/fetchStorage`, Authenication, async (req, res) => {
  const path = req.query.path.toString();
  let regularExp = ``;
  path === "/" ? (regularExp = `^${path}[^\/]*$`) : (regularExp = `^${path}`);
  const data = await StorageModel.aggregate([
    {
      $facet: {
        images: [
          {
            $match: {
              UserID: req.userID.toString(),
            },
          },
          {
            $project: {
              Files: 1,
              _id: 0,
            },
          },
          {
            $unwind: {
              path: "$Files",
            },
          },
          {
            $unwind: {
              path: "$Files.ImageURls",
            },
          },
          {
            $replaceRoot: {
              newRoot: "$Files",
            },
          },
          {
            $match: {
              path,
            },
          },
          {
            $addFields: {
              type: "image",
              lastUpdate: "$ImageURls.createdAt",
            },
          },
        ],
        folders: [
          {
            $match: {
              UserID: req.userID.toString(),
            },
          },
          {
            $project: {
              Files: 1,
              _id: 0,
            },
          },
          {
            $unwind: {
              path: "$Files",
            },
          },
          {
            $match: {
              "Files.path": {
                $regex: regularExp,
                // [^\/]*$
              },
            },
          },
          {
            $replaceRoot: {
              newRoot: "$Files",
            },
          },
          {
            $project: {
              path: 1,
              type: "folder",
              FolderName: 1,
              lastUpdate: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        combined: {
          $concatArrays: ["$images", "$folders"],
        },
      },
    },
    {
      $unwind: "$combined",
    },
    {
      $replaceRoot: { newRoot: "$combined" },
    },
    {
      $addFields: {
        lastUpdate: {
          $dateFromString: {
            dateString: "$lastUpdate",
          },
        },
      },
    },
    {
      $sort: {
        lastUpdate: -1,
      },
    },
  ]);
  const folderData = data.filter(
    (curr) => !(curr.type === "folder" && curr.path === path)
  );

  res.send({ folderData });
});

router.get(`/searchImage`, Authenication, async (req, res) => {
  const search = req.query.search.toLowerCase();
  // console.log(search.length)
  if (search.length > 0) {
    const searchData = await StorageModel.aggregate([
      {
        $match: {
          UserID: req.userID.toString(),
        },
      },
      {
        $project: {
          Files: 1,
          _id: 0,
        },
      },
      {
        $unwind: {
          path: "$Files",
        },
      },
      {
        $unwind: {
          path: "$Files.ImageURls",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$Files",
        },
      },
      {
        $project: {
          ImageName: "$ImageURls.ImageName",
          path: "$path",
          URL: "$ImageURls.URL",
        },
      },
    ]);
    const searchOutput = searchData.filter((curr) =>
      curr.ImageName.toLowerCase().includes(search)
    );
    // console.log(searchOutput)
    return res.send({ searchOutput });
  }
  return res.send({ searchOutput: [] });
});

router.get(`/recentPhotos`, Authenication, async (req, res) => {
  const data = await StorageModel.aggregate([
    {
      $match: {
        UserID: req.userID.toString(),
      },
    },
    {
      $project: {
        Files: 1,
        _id: 0,
      },
    },
    {
      $unwind: {
        path: "$Files",
      },
    },
    {
      $unwind: {
        path: "$Files.ImageURls",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$Files",
      },
    },
    {
      $addFields: {
        type: "image",
        lastUpdate: "$ImageURls.createdAt",
      },
    },
    {
      $sort: {
        lastUpdate: -1,
      },
    },
  ]);

  res.send({ folderData: data });
});

router.delete("/folder", Authenication, async (req, res) => {
  const id = req.query.id;
  const path = req.query.path;
  const fetchURLs = await StorageModel.aggregate([
    {
      $match: {
        UserID: req.userID.toString(),
      },
    },
    { $unwind: "$Files" },
    {
      $match: {
        "Files.path": {
          $regex: `^${path}`,
        },
      },
    },
    {
      $unwind: "$Files.ImageURls",
    },
    {
      $project: {
        URL: "$Files.ImageURls.URL",
      },
    },
    {
      $group: {
        _id: null,
        URLs: {
          $push: "$URL",
        },
      },
    },
  ]);

  const fetchStorage = await StorageModel.findOne({UserID:req.userID});
  let temp = fetchStorage.Files.filter(curr => !curr.path.startsWith(path))
  console.log(temp)

  const deleteFolder = await StorageModel.updateOne(
    { UserID: req.userID },
    {
      $set: { Files: temp },
    }
  );
  if (deleteFolder.modifiedCount > 0) {
    await fetchURLs[0]?.URLs.map(async (curr) => {
      let imageID =
        "storage" + curr.split("storage")[1].replace(/\.[^/.]+$/, "");
      await cloudinary.uploader.destroy(imageID);
    });
    return res.json({ message: "Folder Deleted Successfull", result: true });
  } else {
    return res.json({ message: "Folder Deleted UnSuccessfull", result: false });
  }
});

router.delete("/image", Authenication, async (req, res) => {
  const id = req.query.id;
  const imageID = req.query.imageID;
  const existStorage = await StorageModel.findOne({ UserID: req.userID });

  const Files = existStorage.Files.map((curr) => {
    let temp = curr.ImageURls.filter((e) => e._id.toString() !== id);
    return {
      FolderName: curr.FolderName,
      lastUpdate: curr.lastUpdate,
      path: curr.path,
      _id: curr._id,
      ImageURls: temp,
    };
  });
  const updateStorage = await StorageModel.updateOne(
    { UserID: req.userID },
    { $set: { Files } }
  );
  if (updateStorage.modifiedCount > 0) {
    const result = await cloudinary.uploader.destroy(imageID);
    return res.json({
      message: "Image Deleted Successfull",
      existStorage,
      result: true,
    });
  } else {
    return res.json({ message: "Image Deleted UnSuccessfull", result: false });
  }
});

// for logout User
router.get("/logout", Authenication, async (req, res) => {
  res.clearCookie("JoshiStorageToken", { path: "/" });
  res.status(200).send({ message: "User Logout" });
});

module.exports = router;

// {
//   "_id": {
//     "$oid": "66a638802fbe54e1ff559612"
//   },
//   "UserID": "66a6387f2fbe54e1ff559610",
//   "Files": [
//     {
//       "path": "/",
//       "FolderName": "/",
//       "ImageURls": [],
//       "lastUpdate": "2024-08-07T10:56:57.060+00:00",
//       "_id": {
//         "$oid": "66b352fb0729ced494dded32"
//       }
//     },
//     {
//       "path": "/Untitledfolder/Under",
//       "FolderName": "Under",
//       "ImageURls": [],
//       "lastUpdate": "2024-07-28T15:05:46.764+00:00",
//       "_id": {
//         "$oid": "66a65e4ad076bec0aefe917d"
//       }
//     },
//     {
//       "path": "/Untitledfolder/HelloWorld",
//       "FolderName": "HelloWorld",
//       "ImageURls": [],
//       "lastUpdate": "2024-07-28T18:06:45.684+00:00",
//       "_id": {
//         "$oid": "66a688b5ddb153bac8551af7"
//       }
//     },
//     {
//       "path": "/Untitledfolder/Under/Images",
//       "FolderName": "Images",
//       "ImageURls": [],
//       "lastUpdate": "2024-07-28T18:07:05.077+00:00",
//       "_id": {
//         "$oid": "66a688c9ddb153bac8551b32"
//       }
//     },
//     {
//       "path": "/Shubham/Untitledfolder",
//       "FolderName": "Untitled folder",
//       "ImageURls": [],
//       "lastUpdate": "2024-08-05T07:07:04.556+00:00",
//       "_id": {
//         "$oid": "66b07a1856b5045fa93e216f"
//       }
//     },
//     {
//       "path": "/Shubham/Untitledfolder2",
//       "FolderName": "Untitled folder2",
//       "ImageURls": [],
//       "lastUpdate": "2024-08-05T07:36:08.854+00:00",
//       "_id": {
//         "$oid": "66b080e856b5045fa93e2214"
//       }
//     },
//     {
//       "path": "/Shubham/Untitledfolder2/Shuhbam",
//       "FolderName": "Shuhbam",
//       "ImageURls": [],
//       "lastUpdate": "2024-08-05T07:41:41.443+00:00",
//       "_id": {
//         "$oid": "66b0823556b5045fa93e25aa"
//       }
//     },
//     {
//       "path": "/Shubham/Untitledfolder2/Untitledfolder",
//       "FolderName": "/Shubham/Untitledfolder2/Untitledfolder",
//       "ImageURls": [
//         {
//           "createdAt": "2024-08-05T07:48:36.848+00:00",
//           "URL": "https://res.cloudinary.com/dhwyjphl6/image/upload/v1722844121/storage/66a6387f2fbe54e1ff559610/kwk5rvmgl9xetu3dpona.jpg",
//           "ImageName": "linkedin-post_pradeep-sir.jpg",
//           "_id": {
//             "$oid": "66b083da56b5045fa93e2be8"
//           }
//         },
//         {
//           "createdAt": "2024-08-05T07:48:57.653+00:00",
//           "URL": "https://res.cloudinary.com/dhwyjphl6/image/upload/v1722844139/storage/66a6387f2fbe54e1ff559610/zpcu5y2cgouty5z7q9u3.jpg",
//           "ImageName": "linkedin-post_pradeep-sir_NEW-FONT.jpg",
//           "_id": {
//             "$oid": "66b083eb56b5045fa93e2ccb"
//           }
//         }
//       ],
//       "lastUpdate": "2024-08-05T07:48:57.653+00:00",
//       "_id": {
//         "$oid": "66b083eb56b5045fa93e2cc9"
//       }
//     },
//     {
//       "path": "/Shubham/Untitledfolder2/Untitledfolderfdas",
//       "FolderName": "Untitled folderfdas",
//       "ImageURls": [],
//       "lastUpdate": "2024-08-05T07:42:24.278+00:00",
//       "_id": {
//         "$oid": "66b0826056b5045fa93e280d"
//       }
//     },
//     {
//       "path": "/Untitledfolder",
//       "FolderName": "Untitled folder",
//       "lastUpdate": "2024-08-07T11:15:33.492+00:00",
//       "_id": {
//         "$oid": "66b3575554adc9b1d69f1813"
//       },
//       "ImageURls": []
//     },
//     {
//       "path": "/Untitledfolder/Shubham",
//       "FolderName": "Shubham",
//       "lastUpdate": "2024-08-07T11:21:53.243+00:00",
//       "_id": {
//         "$oid": "66b358d17806884be244ecf2"
//       },
//       "ImageURls": []
//     },
//     {
//       "path": "/Shubham",
//       "FolderName": "Shubham",
//       "lastUpdate": "2024-08-07T11:22:05.623+00:00",
//       "_id": {
//         "$oid": "66b358dd7806884be244ed48"
//       },
//       "ImageURls": []
//     }
//   ],
//   "__v": 27
// }
