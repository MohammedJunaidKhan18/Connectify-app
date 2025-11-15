import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { generateOtp } from "../utils/generateOtp.js";

export const signup = async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be 6 charecters.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists, Please Login or use a different Email",
      });
    }

    const idx = Math.floor(Math.random() * 100) + 1; //generate a number between 1 to 100
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    // create user in stream
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream User", error);
    }
    //--------------------------------------------------
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

//-------------------------------------------------------------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fileds are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

//----------------------------------------------------------------------------------------------------------------

export const logout = (req, res) => {
  res.clearCookie("jwt");

  res.status(200).json({
    success: true,
    message: "Logout successful ",
  });
};

// onboarding

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, location } = req.body;

    if (!fullName || !bio || !nativeLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullname",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // update in stream
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(
        `Stream user updated after onbording for ${updatedUser.fullName}`
      );
    } catch (streamError) {
      console.log(
        "Error updating stream user during onboarding:",
        streamError.message
      );
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("onboarding error", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export const sendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // 🌟 Styled Email Template (Signup OTP)
    const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f7; padding: 20px;">
      <table align="center" width="100%" style="max-width: 600px; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <tr>
          <td style="background: black; padding: 20px; text-align: center; color: white; font-size: 24px; font-weight: bold;">
            Connectify
          </td>
        </tr>

        <tr>
          <td style="padding: 30px 25px; color: #333; font-size: 16px; line-height: 1.6;">
            <h2 style="margin-top: 0; color: #4e46dc;">Verify Your Email</h2>
            <p>Use the OTP below to verify your email address:</p>

            <div style="margin: 25px 0; padding: 15px; text-align: center; background: #f0f0ff; border-left: 5px solid #4e46dc; border-radius: 6px; font-size: 24px; letter-spacing: 4px; font-weight: bold;">
              ${otp}
            </div>

            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
            <p style="margin-top: 35px">Regards,<br /><strong>Connectify Team</strong></p>
          </td>
        </tr>

        <tr>
          <td style="background: #f4f4f7; color: #777; font-size: 12px; text-align: center; padding: 15px;">
            © 2025 Connectify. All rights reserved.
          </td>
        </tr>

      </table>
    </div>
    `;

    await sendEmail(email, "Verify your email", html);

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.log("Error sending signup OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ========== VERIFY SIGNUP OTP ==========
export const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Already verified" });

    if (user.otp !== otp || Date.now() > user.otpExpires)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.log("Error verifying signup OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ========== REQUEST PASSWORD RESET ==========
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // 🌟 Styled Email Template (Password Reset OTP)
    const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f7; padding: 20px;">
      <table align="center" width="100%" style="max-width: 600px; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <tr>
          <td style="background: black; padding: 20px; text-align: center; color: white; font-size: 24px; font-weight: bold;">
            Connectify
          </td>
        </tr>

        <tr>
          <td style="padding: 30px 25px; color: #333; font-size: 16px; line-height: 1.6;">
            <h2 style="margin-top: 0; color: #4e46dc;">Password Reset Request</h2>
            <p>Use the OTP below to reset your password:</p>

            <div style="margin: 25px 0; padding: 15px; text-align: center; background: #f0f0ff; border-left: 5px solid #4e46dc; border-radius: 6px; font-size: 24px; letter-spacing: 4px; font-weight: bold;">
              ${otp}
            </div>

            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
            <p style="margin-top: 35px">Regards,<br /><strong>Connectify Team</strong></p>
          </td>
        </tr>

        <tr>
          <td style="background: #f4f4f7; color: #777; font-size: 12px; text-align: center; padding: 15px;">
            © 2025 Connectify. All rights reserved.
          </td>
        </tr>

      </table>
    </div>
    `;

    await sendEmail(email, "Password Reset OTP", html);

    res.status(200).json({ success: true, message: "Reset OTP sent to email" });
  } catch (error) {
    console.log("Error in requestPasswordReset:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyPasswordResetOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resetOtp !== otp || Date.now() > user.resetOtpExpires)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = newPassword; // pre-save hook hashes
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Error verifying reset OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
