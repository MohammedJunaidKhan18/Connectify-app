import { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup, login, sendSignupOtp } from "../lib/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Authpage() {
  const [isSignIn, setIsSignIn] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    agree: false,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    mutate: loginMutation,
    isPending: loginPending,
    error: loginError,
  } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries(["authUser"]);
      toast.success("Login successful!");
      navigate("/home");
    },
  });

  const {
    mutate: signupMutation,
    isPending: signupPending,
    error: signupError,
  } = useMutation({
    mutationFn: signup,
    onSuccess: async (_, variables) => {
      try {
        await sendSignupOtp(variables.email);
        toast.success("OTP sent to your email!");
      } catch {
        toast.error("Failed to send OTP");
      }

      queryClient.invalidateQueries(["authUser"]);

      navigate("/onboarding", {
        state: { password: variables.password },
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSignIn) {
      loginMutation({
        email: formData.email,
        password: formData.password,
      });
    } else {
      if (!formData.agree) {
        toast.error("Please agree to terms and privacy policy");
        return;
      }
      signupMutation(formData);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-900 p-4">
      {/* OUTER CONTAINER */}
      <div
        className="
        w-full max-w-[1000px] 
        bg-gray-900 shadow-2xl rounded-2xl overflow-hidden

       
        flex flex-col

        
        md:flex-row md:h-[650px] md:relative
      "
      >
        {/* LEFT PANEL */}
        <div
          className={`
            bg-gray-900 p-10 md:p-12 
            w-full md:w-1/2

            /* MOBILE = stacked naturally */
            relative

            /* DESKTOP = slide */
            md:absolute md:left-0 md:top-0 md:h-full
            transition-all duration-700

            ${isSignIn ? "md:translate-x-0" : "md:translate-x-full"}
          `}
        >
          <div className="flex items-center gap-2 mb-6">
            <HeartHandshake className="size-9 text-primary" />
            <span className="text-3xl font-extrabold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Connectify
            </span>
          </div>

          {(loginError || signupError) && (
            <div className="alert alert-error mb-4">
              <span>
                {loginError?.response?.data?.message ||
                  signupError?.response?.data?.message}
              </span>
            </div>
          )}

          <h2 className="text-3xl font-bold text-gray-200 mb-2">
            {isSignIn ? "Sign In" : "Create Account"}
          </h2>

          <p className="text-gray-100 mb-6">
            {isSignIn ? "Sign in to continue" : "Connect through Connectify"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isSignIn && (
              <div>
                <label className="text-gray-200">Full Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full mt-1"
                  placeholder="Your name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>
            )}

            <div>
              <label className="text-gray-200">Email</label>
              <input
                type="email"
                className="input input-bordered w-full mt-1"
                placeholder="name@gmail.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="text-gray-200">Password</label>
              <input
                type="password"
                className="input input-bordered w-full mt-1"
                placeholder="********"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              {!isSignIn && (
                <p className="text-xs opacity-70 mt-1 text-gray-50">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {!isSignIn && (
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={formData.agree}
                  onChange={(e) =>
                    setFormData({ ...formData, agree: e.target.checked })
                  }
                />
                I agree to the{" "}
                <span className="text-primary underline">terms</span> and{" "}
                <span className="text-primary underline">privacy policy</span>
              </label>
            )}

            <button
              className="btn bg-white text-black hover:bg-black hover:text-white w-full"
              type="submit"
            >
              {isSignIn
                ? loginPending
                  ? "Signing in..."
                  : "Sign In"
                : signupPending
                ? "Creating..."
                : "Create Account"}
            </button>

            {isSignIn && (
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="btn btn-ghost w-full text-gray-200"
              >
                Forgot Password?
              </button>
            )}

            <p className="text-center mt-4">
              {isSignIn ? (
                <>
                  Don’t have an account?{" "}
                  <span
                    onClick={() => setIsSignIn(false)}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Create one
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span
                    onClick={() => setIsSignIn(true)}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Sign in
                  </span>
                </>
              )}
            </p>
          </form>
        </div>

        {/* RIGHT PANEL */}
        <div
          className={`
            bg-gradient-to-r from-black to-gray-900 
            p-10 md:p-12 text-center 
            flex flex-col items-center justify-center

            w-full md:w-1/2 
            mt-10 md:mt-0

            transition-all duration-700

            md:absolute md:right-0 md:top-0 md:h-full
            ${isSignIn ? "md:translate-x-0" : "md:-translate-x-full"}
          `}
        >
          <HeartHandshake className="w-12 h-12 mb-4" />

          <h2 className="text-3xl font-semibold mb-3">
            {isSignIn ? "Hello, Friend!" : "Welcome Back!"}
          </h2>

          <p className="opacity-90 text-sm mb-6">
            {isSignIn
              ? "Enter your personal details and start your journey with us"
              : "To keep connected, please login"}
          </p>

          <button
            onClick={() => setIsSignIn(!isSignIn)}
            className="btn btn-outline border-white text-white"
          >
            {isSignIn ? "SIGN UP" : "SIGN IN"}
          </button>
        </div>
      </div>
    </div>
  );
}
