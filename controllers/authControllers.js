import bcrypt from "bcrypt";
import crypto, { verify } from "node:crypto";
import { User, registerSchema } from "../schemas/usersSchemas.js";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import generator from "generate-password";
import * as tokenServices from "../services/tokenServices.js";
import axios from "axios";
import queryString from "query-string";

import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { BASE_URL } = process.env;
const cookieConfig = {
  maxAge: 30 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "none",
  secure: true,
};

export async function register(req, res, next) {
  try {
    const { password, email } = req.body;

    if (password.length < 6 || password.length > 32) {
      return res
        .status(400)
        .json({ message: "Password must be between 6 and 32 characters long" });
    }
    const user = await User.findOne({ email });
    if (user !== null) {
      return res.status(409).send({ message: "User already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = crypto.randomUUID();
    const verificationLink = `${BASE_URL}/api/users/verify/${verificationToken}`;

    const postNewUser = await User.create({
      email,
      password: passwordHash,
      avatarURL,
      verificationToken,
      token,
    });

    const msg = {
      to: email,
      from: "aanytkaa@gmail.com",
      subject: "Welcome to Agua track",
      html: `To confirm you email please click on <a href="${verificationLink}">Link</a>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    res.status(201).json({
      // token,
      user: {
        email: postNewUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user === null) {
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch === false) {
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    if (user.verify === false) {
      return res.status(404).send({ message: "User not found" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    await User.findByIdAndUpdate(user._id, { token }, { new: true });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        weight: user.weight,
        activeTimeSports: user.activeTimeSports,
        waterDrink: user.waterDrink,
        avatarURL: user.avatarURL,
        verify: user.verify,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function logout(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user._id, { token: null }, { new: true });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function current(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(401).send("Not authorized");
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        weight: user.weight,
        activeTimeSports: user.activeTimeSports,
        waterDrink: user.waterDrink,
        avatarURL: user.avatarURL,
        verify: user.verify,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      return res.status(404).json("User not found");
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { token, verify: true, verificationToken: null } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json("Failed to update user");
    }

    const redirectUrl =
      "http://localhost:5173/signin" ||
      "https://aquatrack-front-1.vercel.api/signin";

    // const redirectUrl =
    //   `http://localhost:5173/tracker?token=${token}` ||
    //   `https://aquatrack-front-1.vercel.api/tracker?token=${token}`;
    res.redirect(redirectUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function resendVerificationEmail(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "missing required field email" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.verify === true) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }
    const verificationToken = crypto.randomUUID();
    user.verificationToken = verificationToken;
    await user.save();
    const verificationLink = `${BASE_URL}/api/users/verify/${verificationToken}`;
    const msg = {
      to: email,
      from: "aanytkaa@gmail.com",
      subject: "Welcome to Agua track",
      html: `To confirm you email please click on <a href="${verificationLink}">Link</a>`,
      text: `To confirm you email please open the link ${verificationLink}`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function newPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "missing required field email" });
    }
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const password = generator.generate({ length: 10, numbers: true });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(foundUser._id, {
      password: passwordHash,
    });
    const msg = {
      to: email,
      from: "aanytkaa@gmail.com",
      subject: "Welcome to Agua track",
      html: `Congratulations, you have received a new password: ${password}`,
      text: `Congratulations, you have received a new password: ${password}`,
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    res.status(200).json("New password sent to email");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function customPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "missing required field email" });
    }
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const token = jwt.sign(
      { id: foundUser._id, email: foundUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    await User.findByIdAndUpdate(
      foundUser._id,
      { tmpToken: token },
      { new: true }
    );
    const msg = {
      to: email,
      from: "aanytkaa@gmail.com",
      subject: "Welcome to Agua track",
      html: `<a href="https://aquatrack-front-1.vercel.app/password?token=${token}">Link</a>`,
      text: `<a href="https://aquatrack-front-1.vercel.app/password?token=${token}">Link</a>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
    res.status(200).json("New password sent to email");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateCustomPassword(req, res, next) {
  try {
    const { password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(req.user._id, {
      password: passwordHash,
    });
    res.status(200).json("Password updated");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function countUsers(req, res, next) {
  try {
    const totalCount = await User.countDocuments();
    const users = await User.aggregate([
      { $sample: { size: 3 } },
      { $project: { avatarURL: 1, _id: 0 } },
    ]);
    res.json({
      userCount: totalCount,
      userAvatars: users,
    });
  } catch (error) {
    next(error);
  }
}

export const googleAuth = async (req, res, next) => {
  try {
    const clientId = process.env.GOOGLE_CLOUD_ID;
    const redirectUri = `${process.env.BASE_URL}/api/users/google-redirect`;
    const scope = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" ");
    const stringifiedParams = queryString.stringify({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
    });
    const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;
    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};

export const googleRedirect = async (req, res, next) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const urlObj = new URL(fullUrl);
    const urlParams = queryString.parse(urlObj.search);
    const code = urlParams.code;

    const tokenData = await axios({
      url: `https://oauth2.googleapis.com/token`,
      method: "post",
      data: {
        client_id: process.env.GOOGLE_CLOUD_ID,
        client_secret: process.env.GOOGLE_CLOUD_SECRET_KEY,
        redirect_uri: `${process.env.BASE_URL}/api/users/google-redirect`,
        grant_type: "authorization_code",
        code,
      },
    });

    const userData = await axios({
      url: "https://www.googleapis.com/oauth2/v2/userinfo",
      method: "get",
      headers: {
        Authorization: `Bearer ${tokenData.data.access_token}`,
      },
    });
    const email = userData.data.email;
    const name = userData.data.given_name;
    const googleId = userData.data.id;
    const avatarURL = userData.data.picture;

    let user = await User.findOne({ email });
    if (!user) {
      const hashedPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      user = new User({
        email,
        name,
        password: hashedPassword,
        avatarURL,
        googleId,
        displayName: userData.data.name,
        verify: true,
        verificationToken: null,
      });
      await user.save();
    } else {
      user = await User.findOneAndUpdate(
        { email },
        {
          displayName: userData.data.name,
          googleId,
          verify: true,
          verificationToken: null,
        },
        { new: true }
      );
    }
    const payload = { id: user._id, email: user.email };
    const { token, refreshToken } = await tokenServices.generateToken(payload);
    await tokenServices.saveToken(user._id, refreshToken);
    await User.findByIdAndUpdate(user._id, { token }, { new: true });
    res
      .cookie("refreshToken", refreshToken, cookieConfig)
      .redirect(`${process.env.FRONTEND_URL}/tracker?token=${token}`);
  } catch (error) {
    next(error);
  }
};
