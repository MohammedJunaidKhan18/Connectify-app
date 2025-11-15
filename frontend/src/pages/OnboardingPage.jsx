import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";

import {
  completeOnboarding,
  getCloudinarySignature,
  saveUserAvatar,
} from "../lib/api.js";

import {
  CameraIcon,
  HeartHandshake,
  LoaderIcon,
  MapPin,
  ShuffleIcon,
  UploadCloud,
} from "lucide-react";

import { LANGUAGES } from "../constants/index.js";

function OnboardingPage() {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  //  AUTO REDIRECT IF USER IS ALREADY ONBOARDED
  useEffect(() => {
    if (authUser?.isOnboarded) {
      navigate("/home", { replace: true });
    }
  }, [authUser, navigate]);

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
    email: authUser?.email || "",
  });

  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);

  const fileInputRef = useRef(null);

  //  resend timer countdown
  useEffect(() => {
    if (resendTimer === 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  //  ONBOARDING MUTATION WITH REDIRECT
  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully!");

      queryClient.invalidateQueries({ queryKey: ["authUser"] });

      //  Redirect to Home Page
      navigate("/home", { replace: true });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  //  HANDLE SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    if (otpStatus !== "verified") {
      toast.error("Please verify your OTP before completing onboarding");
      return;
    }

    onboardingMutation(formState);
  };

  //  RANDOM AVATAR
  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random Avatar Generated!");
  };

  const handleImportClick = () => fileInputRef.current?.click();

  //  CLOUDINARY UPLOAD
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.loading("Uploading image...", { id: "upload" });

    try {
      const { cloudName, apiKey, timestamp, signature, folder } =
        await getCloudinarySignature("avatars");

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("timestamp", timestamp);
      form.append("signature", signature);
      form.append("folder", folder);

      const uploadRes = await fetch(uploadUrl, { method: "POST", body: form });
      const data = await uploadRes.json();

      if (!data.secure_url) throw new Error("Cloudinary upload failed");

      const secureUrl = data.secure_url;
      const publicId = data.public_id;

      setFormState((prev) => ({ ...prev, profilePic: secureUrl }));

      await saveUserAvatar({ url: secureUrl, public_id: publicId });

      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Profile picture updated!", { id: "upload" });
      e.target.value = "";
    } catch {
      toast.error("Image upload failed", { id: "upload" });
    }
  };

  //  VERIFY OTP
  const handleVerifyOtp = async () => {
    try {
      await axiosInstance.post("/auth/verify-otp", {
        email: formState.email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      toast.success("Email verified ");
      setOtpStatus("verified");
    } catch (error) {
      setOtpStatus("invalid");
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    }
  };

  //  RESEND OTP
  const handleResendOtp = async () => {
    setResending(true);

    try {
      await axiosInstance.post("/auth/send-otp", {
        email: formState.email.trim().toLowerCase(),
      });

      toast.success("OTP sent again");
      setResendTimer(30);
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 flex justify-center p-6">
      <div className="w-full max-w-3xl bg-black shadow-2xl rounded-xl h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 pb-0">
          <h1 className="text-3xl text-white font-bold text-center p-2">
            Complete your Profile
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PROFILE PIC */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="size-32 rounded-full bg-base-300 overflow-hidden shadow">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 opacity-40" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline bg-white text-black hover:text-white hover:bg-black"
                  onClick={handleRandomAvatar}
                >
                  <ShuffleIcon className="size-4 mr-1" /> Random
                </button>

                <button
                  type="button"
                  className="btn btn-outline bg-black text-white hover:text-black hover:bg-white"
                  onClick={handleImportClick}
                >
                  <UploadCloud className="size-4 mr-1" /> Import
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white text-lg">Full Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full text-white"
                value={formState.fullName}
                onChange={(e) =>
                  setFormState({ ...formState, fullName: e.target.value })
                }
              />
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white text-lg">Bio</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                value={formState.bio}
                onChange={(e) =>
                  setFormState({ ...formState, bio: e.target.value })
                }
              ></textarea>
            </div>

            {/* LANGUAGE + LOCATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white text-lg">
                    Language
                  </span>
                </label>
                <select
                  className="select select-bordered text-white"
                  value={formState.nativeLanguage}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      nativeLanguage: e.target.value,
                    })
                  }
                >
                  <option value="">Select Language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white text-lg">
                    Location
                  </span>
                </label>
                <div className="relative w-full">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-5 opacity-60 text-white" />
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10 text-white"
                    value={formState.location}
                    onChange={(e) =>
                      setFormState({ ...formState, location: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* OTP ROW */}
            <div className="grid grid-cols-3 gap-3 items-center">
              <input
                type="text"
                maxLength="6"
                placeholder="OTP"
                className="input input-bordered w-full text-center tracking-widest"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              />

              <button
                type="button"
                className="btn btn-outline bg-black hover:bg-white hover:text-black w-full"
                onClick={handleVerifyOtp}
              >
                Verify
              </button>

              <button
                type="button"
                className="btn btn-outline hover:bg-white hover:text-black w-full"
                disabled={resendTimer > 0 || resending}
                onClick={handleResendOtp}
              >
                {resendTimer > 0 ? `Resend (${resendTimer})` : "Resend OTP"}
              </button>
            </div>

            {otpStatus === "verified" && (
              <p className="text-green-500 font-semibold">✅ OTP Verified</p>
            )}
            {otpStatus === "invalid" && (
              <p className="text-red-500 font-semibold">❌ Invalid OTP</p>
            )}

            {/* SUBMIT */}
            <button
              className="btn bg-white text-black hover:bg-gray-800 hover:text-white w-full"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <LoaderIcon className="animate-spin mr-1" /> Onboarding...
                </>
              ) : (
                <>
                  <HeartHandshake className="mr-1" /> Complete Onboarding
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
