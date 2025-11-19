import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAuthUser,
  updateProfile,
  logout,
  getCloudinarySignature,
  saveUserAvatar,
} from "../lib/api";
import PageLoader from "../components/PageLoader";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Image, LogOut, Pencil, Save, X, Shuffle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
  });

  const user = data?.user ?? null;

  const [edit, setEdit] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    location: "",
    nativeLanguage: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        bio: user.bio || "",
        location: user.location || "",
        nativeLanguage: user.nativeLanguage || "",
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Profile updated");
    },
    onError: (e) => {
      toast.error(e?.response?.data?.message || "Failed to update profile");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/auth");
    },
    onError: () => toast.error("Failed to logout"),
  });

  if (isLoading) return <PageLoader />;

  if (!user || isError) {
    navigate("/auth");
    return null;
  }

  const handleSave = () => {
    updateMutation.mutate(form);
    setEdit(false);
  };

  const handleChangePhotoClick = () => fileInputRef.current?.click();

  // -----------------------------
  // FILE UPLOAD → CLOUDINARY
  // -----------------------------
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.loading("Uploading image...", { id: "upload" });

    try {
      const { cloudName, apiKey, timestamp, signature, folder } =
        await getCloudinarySignature("avatars");

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", apiKey);
      fd.append("timestamp", timestamp);
      fd.append("signature", signature);
      fd.append("folder", folder);

      const res = await fetch(uploadUrl, { method: "POST", body: fd });
      const data = await res.json();

      if (!data.secure_url) throw new Error("Upload failed");

      await saveUserAvatar({ url: data.secure_url, public_id: data.public_id });

      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Profile picture updated!", { id: "upload" });
      e.target.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload", { id: "upload" });
    }
  };

  // -----------------------------
  // RANDOM AVATAR GENERATOR
  // -----------------------------
  const handleRandomAvatar = async () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    try {
      toast.loading("Setting random avatar...", { id: "random" });

      await saveUserAvatar({ url: randomAvatar, public_id: null });

      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Random avatar set!", { id: "random" });
    } catch {
      toast.error("Failed to set avatar", { id: "random" });
    }
  };

  // -----------------------------
  // REMOVE PROFILE PIC
  // -----------------------------
  const handleRemovePhoto = async () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    try {
      toast.loading("Removing photo...", { id: "remove" });

      await saveUserAvatar({
        url: randomAvatar,
        public_id: null,
      });

      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Profile photo removed!", { id: "remove" });
    } catch {
      toast.error("Failed to remove photo", { id: "remove" });
    }
  };

  return (
    <div className="h-[88.5vh] overflow-x-hidden w-full flex justify-center bg-gradient-to-b from-primary-content to-secondary-content">
      <div className="w-full max-w-2xl mb-4 p-2">
        
        {/* Top Buttons */}
        <div className="w-full flex justify-between mb-5">
          <button
            onClick={() => navigate("/home")}
            className="btn btn-outline hover:btn-primary btn-md text-base "
          >
            <ChevronLeft className="size-5" />
            Back
          </button>

          <div>
            {edit ? (
              <div className="flex gap-4">
                <button
                  className="btn btn-outline hover:btn-error btn-md text-base"
                  onClick={() => setEdit(false)}
                >
                  <X className="size-4" />
                  Cancel
                </button>
                <button
                  className="btn btn-outline hover:btn-info btn-md text-base"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  <Save className="size-5" />
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => setEdit(true)}
              >
                <Pencil className="size-4" />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex justify-start text-center mt-10 mb-8">
          <div className="avatar relative">
            <div
              className="size-28 rounded-full overflow-hidden cursor-pointer"
              onClick={() => !edit && setShowPreview(true)}
            >
              <img src={user?.profilePic || ""} alt="Profile" />
            </div>
          </div>

          <div className="flex flex-col pl-5 items-start justify-center">
            {edit ? (
              <input
                type="text"
                className="input input-primary bg-primary-content pl-10 mt-5 w-full"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            ) : (
              <h2 className="text-3xl text-secondary font-bold">
                {user?.fullName}
              </h2>
            )}

            <p className="text-start text-lg text-base-content mt-1">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Change Photo + New Buttons */}
        <div className="flex items-start justify-start gap-3">
          {edit && (
            <>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                className="btn btn-md btn-outline hover:btn-info"
                onClick={handleChangePhotoClick}
              >
                <Image className="size-5" />
                Change Photo
              </button>

              <button
                className="btn btn-md btn-outline hover:btn-primary"
                onClick={handleRandomAvatar}
              >
                <Shuffle className="size-5" />
                Random
              </button>

              <button
                className="btn btn-md btn-outline hover:btn-error"
                onClick={handleRemovePhoto}
              >
                <Trash2 className="size-5" />
                Remove
              </button>
            </>
          )}
        </div>

        <div className="divider divider-primary"></div>

        {/* Details Section */}
        <div className="space-y-4">
          {/* Bio */}
          <div className="flex items-center gap-2 font-bold text-lg">
            <label className="text-secondary">Bio:</label>
            {edit ? (
              <textarea
                className="textarea textarea-primary bg-primary-content pl-5 w-full"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            ) : (
              <p className="text-base-content">{user?.bio || "No bio added"}</p>
            )}
          </div>

          {/* Language */}
          <div className="flex items-center gap-3 font-bold text-lg">
            <label className="text-secondary">Language:</label>
            {edit ? (
              <input
                className="input input-primary bg-primary-content pl-5 w-full"
                value={form.nativeLanguage}
                onChange={(e) =>
                  setForm({ ...form, nativeLanguage: e.target.value })
                }
              />
            ) : (
              <p className="text-base-content">
                {user?.nativeLanguage || "Not specified"}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 font-bold text-lg">
            <label className="text-secondary">Location:</label>
            {edit ? (
              <input
                className="input input-primary bg-primary-content pl-5 w-full"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            ) : (
              <p className="text-base-content">
                {user?.location || "Not specified"}
              </p>
            )}
          </div>

          {/* Joined */}
          <div className="flex items-center gap-2 font-bold text-lg">
            <label className="text-secondary">Joined:</label>
            <p className="text-base-content">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "-"}
            </p>
          </div>

          {/* Logout Buttons */}
          {!edit && (
            <div className="flex justify-end gap-5 pt-1 mb-5">
              <button
                onClick={() => navigate("/forgot-password")}
                className="btn btn-outline btn-md hover:btn-info text-base-content"
              >
                Forgot Password
              </button>

              <button
                onClick={() => logoutMutation.mutate()}
                className="btn btn-outline btn-md hover:btn-secondary text-base-content"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="size-4 mr-1" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-gradient-to-t from-primary/50 to-secondary/50 p-5 rounded-lg max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={user?.profilePic || ""}
              alt="Preview"
              className="rounded-lg max-h-[80vh] object-contain"
            />

            <button
              onClick={() => setShowPreview(false)}
              className="btn btn-md btn-outline hover:bg-gradient-to-l from-primary/80 to-secondary/85 hover:text-primary-content mt-4 w-full text-base-content text-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

