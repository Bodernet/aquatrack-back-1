import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { User, registerSchema } from "../schemas/usersSchemas.js";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
// import mail from "../mailtrap/mail.js";
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { BASE_URL } = process.env;

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

    const postNewUser = await User.create({
      email,
      password: passwordHash,
      avatarURL,
      verificationToken,
    });

    res.status(201).json({
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
      { expiresIn: 5000 }
    );
    await User.findByIdAndUpdate(user._id, { token }, { new: true });

    res.status(200).json({
      token: token,
      user: { email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function logout(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null }, { new: true });
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
    res.status(200).json({ email: user.email });
  } catch (error) {
    res.status(401).json("Not authorized");
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (user === null) {
      return res.status(404).json("User not found");
    }
    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });
    res.status(200).json("Verification successful");
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
