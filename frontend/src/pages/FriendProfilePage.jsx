import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserFriends, unfriendUser } from "../lib/api";
import { LANGUAGE_TO_FLAG } from "../constants";
import {
  MapPinIcon,
  UserMinusIcon,
  MessageSquareIcon,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

export default function FriendProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const friend = friends.find((f) => f._id === id);

  const [showImage, setShowImage] = useState(false);

  const { mutate: handleUnfriend, isPending } = useMutation({
    mutationFn: () => unfriendUser(id),
    onSuccess: () => {
      //  Remove from UI cache
      queryClient.setQueryData(["friends"], (old = []) =>
        old.filter((f) => f._id !== id)
      );

      queryClient.invalidateQueries(["friends"]);
      queryClient.invalidateQueries(["recommendedusers"]);

      navigate("/friends"); //  Back to friends page
    },
  });

  if (!friend) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Friend not found</p>
      </div>
    );
  }

  return (
    <div className="h-[89vh] overflow-x-hidden w-full flex justify-center bg-gradient-to-b from-primary-content to-secondary-content">
      <div className="w-full max-w-2xl mb-4 p-2">
        {/* Back button */}
        <button
          className="btn btn-outline hover:btn-primary btn-md text-base mt-5"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="size-5" /> Back
        </button>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mt-10">
          <div
            className="size-36 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition"
            onClick={() => setShowImage(true)}
          >
            <img
              src={friend.profilePic}
              className="object-cover w-full h-full"
              alt="profile"
            />
          </div>

          <h2 className="text-3xl text-primary font-bold mt-5">
            {friend.fullName}
          </h2>

          {/* Language + Location */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="badge badge-outline h-12 w-28 text-lg gap-2">
              {getLanguageFlag(friend.nativeLanguage)}
              {friend.nativeLanguage}
            </span>

            <span className="badge badge-outline h-12 w-28 text-lg gap-1">
              <MapPinIcon className="size-5 " />
              {friend.location || "Unknown"}
            </span>
          </div>

          {/* Bio */}
          {friend.bio && (
            <p className="mt-4 text-center text-lg text-primary font-bold tracking-wide">
              {friend.bio}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-3 mt-6 w-full max-w-sm">
            <Link
              to={`/chat/${friend._id}`}
              className="btn btn-outline hover:btn-info "
            >
              <MessageSquareIcon className="size-4" />
              Message
            </Link>

            <button
              className="btn btn-outline btn-md hover:btn-error text-base-content"
              onClick={() => handleUnfriend()}
              disabled={isPending}
            >
              <UserMinusIcon className="size-4 " />
              {isPending ? "Removing..." : "Unfriend"}
            </button>
          </div>
        </div>
      </div>

      {/*  Fullscreen Image Modal */}
      {showImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
          onClick={() => setShowImage(false)}
        >
          <div
            className="bg-gradient-to-t from-primary/50 to-secondary/50 p-5 rounded-lg max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={friend.profilePic}
              className="rounded-lg max-h-[80vh] object-contain"
            />
            <button
              onClick={() => setShowImage(false)}
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

function getLanguageFlag(language) {
  if (!language) return null;
  const langLower = language.toLowerCase();
  const code = LANGUAGE_TO_FLAG[langLower];
  if (!code) return null;

  return (
    <img
      src={`https://flagcdn.com/24x18/${code}.png`}
      className="h-3 mr-1 inline-block"
    />
  );
}
