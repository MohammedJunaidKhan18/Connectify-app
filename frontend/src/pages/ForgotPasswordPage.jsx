import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      const res = await axiosInstance.post("/auth/reset-password", { email });
      if (res.data.success) {
        toast.success("OTP sent to your email!");
        navigate("/reset-password", { state: { email } });
      } else {
        toast.error(res.data.message || "Error sending OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-l from-primary-content to-secondary-content p-4 sm:p-6">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-secondary text-center mb-4">
          Forgot Password
        </h2>
        <p className="text-md text-primary text-center mb-6">
          Enter your registered email to receive an OTP
        </p>
        <input
          type="email"
          className="input input-primary bg-primary-content w-full pl-10 mb-4"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleSendOtp}
          className="btn btn-outline hover:btn-info  w-full"
          disabled={!email}
        >
          Send OTP
        </button>
        <button
          onClick={() => navigate("/home")}
          className="btn btn-outline hover:btn-info w-full mt-4"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
