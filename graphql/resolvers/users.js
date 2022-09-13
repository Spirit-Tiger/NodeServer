import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { UserInputError } from "apollo-server";
import checkAuth from "../../utils/check-auth.js";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import { sendConfirmationEmail } from "../../utils/emailValidation.js";

import User from "../../models/User.js";
import Crypto from "../../models/Crypto.js";

import { PubSub } from "graphql-subscriptions";
const pubsub = new PubSub();

const SECRET_KEY = "my secret";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../../utils/validators.js";
import Verify from "../../models/Verify.js";

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: "30d" }
  );
}
function generateConfirmationToken(username, email) {
  return jwt.sign(
    {
      email,
      username,
    },
    SECRET_KEY
  );
}

function generatePersonalId() {
  let presonalId = "";
  for (let i = 0; i < 4; i++) {
    const randomNmber = Math.floor(Math.random() * 9) + 1;
    presonalId = presonalId + randomNmber.toString();
  }
  console.log(presonalId);
  return Number(presonalId);
}

const usersResolvers = {
  Query: {
    async getUsers() {
      try {
        const users = await User.find();
        return users;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getUser(_, { userId }) {
      try {
        const user = await User.findById(userId);
        if (user) {
          return user;
        } else {
          throw new Error("User not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Upload: GraphQLUpload,
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      const user = await User.findOne({ username });

      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }

      if (user.status != "Active" && user.userRole === "user") {
        errors.general = "Pending Account. Please Verify Your Email!";
        throw new UserInputError("Pending Account. Please Verify Your Email!", {
          errors,
        });
      }

      if (password !== user.password) {
        errors.general = "Wrong credentials";
        throw new UserInputError("Wrong credentials", { errors });
      }

      if (!password) {
        errors.general = "Wrong credentials";
        throw new UserInputError("Wrong credentials", { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      {
        registerInput: {
          username,
          firstName,
          lastName,
          country,
          phone,
          email,
          password,
          ordersCounter,
          verified,
          balance,
          userRole,
        },
      }
    ) {
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }
      // password = await bcrypt.hash(password, 12);
      let confToken = "";
      if (userRole === "user") {
        confToken = generateConfirmationToken(username, email);
      }

      const newUser = new User({
        personalId: generatePersonalId(),
        email,
        username,
        firstName,
        lastName,
        country,
        phone,
        password,
        ordersCounter: 0,
        balance: 0,
        verified: false,
        wallet: "1BQ9qza7fn9snSCyJQB3ZcN46biBtkt4ee",
        userRole,
        createdAt: new Date().toISOString(),
        confirmationCode: confToken,
      });

      const res = await newUser.save();
      const token = generateToken(res);
      if (userRole === "user") {
        sendConfirmationEmail(res.username, res.email, res.confirmationCode);
      }

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
    async deleteUser(_, { userId }) {
      try {
        const user = await User.findById(userId);
        const message = "User deleted successfuly";
        if (user) {
          await user.delete();
          return { userId, message };
        } else {
          throw new Error("User not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async changeUserInfo(
      _,
      { changeUserInput: { firstName, lastName, phone, email, country } },
      context
    ) {
      const { id: userId } = checkAuth(context);
      try {
        const user = await User.findById(userId);
        if (user) {
          user.firstName = firstName;
          user.lastName = lastName;
          user.phone = phone;
          user.email = email;
          user.country = country;
          await user.save();
          return user;
        }
        throw new Error("User not found");
      } catch (err) {
        throw new Error(err);
      }
    },
    async singleUpload(_, { file }) {
      const { createReadStream, filename, mimetype, encoding } = await file;
      const stream = createReadStream();
      const out = require("fs").createWriteStream("local-file-output.txt");

      stream.pipe(out);
      await finished(out);

      return { filename, mimetype, encoding };
    },
    async updateUsers() {
      try {
        // const newId = generatePersonalId();
        let conditions = "6303947d01b6e11faa91b3be";
        let options = { multi: true, upsert: true, new: true };

        User.findByIdAndUpdate(
          conditions,
          { $set: { presonalId: generatePersonalId() } },
          options
        );

        // users.reduce((acc,user)=>{
        //   if(!user.presonalId)user.presonalId=generatePersonalId()
        //   return [...acc,]
        // },[])
        // const newUsers = users.map((user)=>
        //   !user.presonalId ? {presonalId: generatePersonalId(),...user._doc } : user._doc
        // )
        // users = new newUsers;
        // console.log("newUsers",newUsers);
        // await users.save();
      } catch (err) {
        throw new Error(err);
      }
    },
    async verifyUserEmail(_, { confirmationCode }) {
      try {
        const user = await User.findOne({
          confirmationCode,
        });

        if (!user) {
          errors.general = "User not found";
          throw new UserInputError("User not found", { errors });
        }

        user.status = "Active";
        await user.save();
        return user;
      } catch (err) {
        throw new Error(err);
      }
    },
    async createCrypto(_, { product_id, price }) {
      try {
        // const crypto = await Crypto.findOne({
        //   product_id,
        // });

        // if (!crypto) {
        const newCrypto = new Crypto({
          product_id,
          price,
        });
        await newCrypto.save();
        return newCrypto;
      } catch (err) {
        throw new Error(err);
      }
    },
    async updateCryptoInfo(_, { product_id, price }) {
      try {
        const crypto = { product_id, price };
        pubsub.publish("CRYPTO_UPDATED", {
          cryptoUpdated: crypto,
        });

        return crypto;
      } catch (err) {
        throw new Error(err);
      }
    },
    async verifyRequest(
      _,
      { userId, profileImg, firstName, lastName, createdDate }
    ) {
      try {
        const request =  await Verify.findOne({userId});
        if (!request) {
          const verify = new Verify({
            userId,
            profileImg,
            firstName,
            lastName,
            createdDate,
          });
          await verify.save();
          return verify;
        }
        if(request){
          return request;
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Subscription: {
    cryptoUpdated: {
      subscribe: () => pubsub.asyncIterator(["CRYPTO_UPDATED"]),
    },
  },
};

export default usersResolvers;
