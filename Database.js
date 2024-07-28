const mongoose = require("mongoose");
const SECRET_KEY = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const MONGOURI = process.env.MONGO_URI;
// "mongodb+srv://shubhamjoshii676:vlEcNkix4bUj1NyM@cluster0.o1melqn.mongodb.net/",

mongoose
  .connect(
    MONGOURI
    // {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // }
  )
  .then(() => {
    console.log("Database CONNECTED");
  })
  .catch((err) => {
    console.log("Database ERROR", err);
  });

const UserSchema = new mongoose.Schema({
  Name: {
    type: String,
    require: true,
  },
  Email: {
    type: String,
    require: true,
  },
  Password: {
    type: String,
    require: true,
  },
  Profile: {
    type: String,
    require: true,
    default:"https://res.cloudinary.com/dhwyjphl6/image/upload/v1722171796/ProfileImage/hxsfowi9jl7jqudqpktp.jpg"
  },
  Login: [
    {
      Login_Date: {
        type: String,
        require: true,
      },
    },
  ],
  RegisterDate: {
    type: Date,
    default: Date.now,
  },
  Tokens: [
    {
      Token: {
        type: String,
        require: true,
      },
    },
  ],
});

const Storage = new mongoose.Schema({
  UserID: {
    type: String,
    require: true,
  },
  Files: [
    {
      path: {
        type: String,
        require: true,
      },
      FolderName:{
        type: String,
        require: true,
      },
      ImageURls: [
        {
          Folder: {
            type: String,
            require: true,
          },
          createdAt: {
            type: String,
          },
          URL: {
            type: String,
            require: true,
          },
          ImageName: {
            type: String,
            require: true,
          },
        },
      ],
      lastUpdate:{
        type: String
      }
    },
  ],
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("Password")) {
    this.Password = await bcrypt.hash(this.Password, 12);
  }
  next();
});

UserSchema.methods.generateAuthToken = async function () {
  try {
    let Token = jwt.sign({ _id: this._id }, SECRET_KEY);
    this.Tokens = this.Tokens.concat({ Token: Token });
    await this.save();
    return Token;
  } catch (err) {
    console.log(err);
  }
};

const UsersModel = mongoose.model("RegisteredUsers", UserSchema);
const StorageModel = mongoose.model("Storage", Storage);

module.exports = { UsersModel, StorageModel };
