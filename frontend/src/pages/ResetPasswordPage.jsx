import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleVerifyReset = async () => {
    try {
      const res = await axiosInstance.post("/auth/verify-reset-otp", {
        email,
        otp,
        newPassword,
      });
      if (res.data.success) {
        toast.success("Password reset successful!");
        navigate("/auth");
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-l from-primary-content to-secondary-content p-2 sm:p-6">
      <div className="w-full max-w-md bg-gray-900 p-5 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-secondary text-center mb-4">
          Reset Password
        </h2>
        <p className="text-md text-primary text-center mb-6">
          Enter the OTP sent to your email and your new password
        </p>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          maxLength="6"
          className="input input-primary bg-primary-content w-full mb-4 text-center tracking-widest font-semibold text-lg text-base-content"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
        />

        <input
          type="password"
          placeholder="Enter new password"
          className="input input-primary bg-primary-content w-full mb-4"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button
          onClick={handleVerifyReset}
          className="btn btn-outline hover:btn-info w-full mb-4"
          disabled={!otp || !newPassword}
        >
          Verify & Reset
        </button>

        <button
          onClick={() => navigate("/auth")}
          className="btn btn-outline hover:btn-error w-full "
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
