import { Link } from "react-router-dom";
import { LANGUAGE_TO_FLAG } from "../constants";
import { MapPinIcon, MessageSquareIcon, UserMinusIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unfriendUser } from "../lib/api";

function FriendCard({ friend, onRemoved }) {
  const queryClient = useQueryClient();
  const { mutate: handleUnfriend, isLoading: isPending } = useMutation({
    mutationFn: () => unfriendUser(friend._id),
    onSuccess: () => {
      //  Remove from your UI
      onRemoved?.(friend._id);

      //  Refresh recommended list
      queryClient.invalidateQueries(["recommendedusers"]);

      //  Refresh your friends
      queryClient.invalidateQueries(["friends"]);
    },
  });

  return (
    <div className="card bg-gradient-to-l from-primary/10 to-secondary/20 hover:shadow-2xl transition-all duration-300">
      <div className="card-body p-4 space-y-2">
        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="avatar size-12 rounded-full">
            <img
              src={friend.profilePic}
              alt={friend.fullName}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <h3 className="font-bold text-xl text-secondary">
              {friend.fullName}
            </h3>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-1">
          <span className="badge badge-outline h-8">
            {getLanguageFlag(friend.nativeLanguage)}
            {capitalize(friend.nativeLanguage)}
          </span>

          <span className="badge badge-outline h-8">
            <MapPinIcon className="size-3 mr-1" />
            {friend.location || "Unknown"}
          </span>
        </div>

        {/* Bio */}
        {friend.bio && (
          <p className="text-lg  text-base-content font-semibold  opacity-100 mt-2">
            {friend.bio}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleUnfriend()}
            disabled={isPending}
            className="btn btn-outline hover:btn-error flex-1"
          >
            <UserMinusIcon className="size-4 mr-1" />
            {isPending ? "Unfriending..." : "Unfriend"}
          </button>

          <Link
            to={`/chat/${friend._id}`}
            className="btn btn-outline hover:btn-info flex-1 flex items-center justify-center"
          >
            <MessageSquareIcon className="size-4 mr-1" />
            Message
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FriendCard;

// helper functions
function getLanguageFlag(language) {
  if (!language) return null;
  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];
  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}

const capitalize = (str = "") => str.charAt(0).toUpperCase() + str.slice(1);
