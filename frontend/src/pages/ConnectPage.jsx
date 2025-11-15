import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api.js";

import { Link } from "react-router-dom";
import {
  CheckCircle2Icon,
  MapPinIcon,
  UserPlusIcon,
  UsersIcon,
  SearchIcon,
} from "lucide-react";

import { LANGUAGE_TO_FLAG } from "../constants/index.js";
import { capitialize } from "../lib/utils.js";
import FriendCard from "../components/FriendCard.jsx";

function ConnectPage() {
  const queryClient = useQueryClient();

  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  //  Fetch recommended users
  const { data: recData, isLoading: loadingUsers } = useQuery({
    queryKey: ["recommendedusers"],
    queryFn: getRecommendedUsers,
  });

  const recommendedUsers = recData?.recommendedUsers ?? [];

  //  Fetch friends
  const { data: friendsData = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  //  Fetch outgoing friend requests
  const { data: outgoingFriendReqs = [] } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  //  Store sent requests in a Set
  useEffect(() => {
    const outgoingIds = new Set();
    outgoingFriendReqs.forEach((req) => outgoingIds.add(req.recipient._id));
    setOutgoingRequestsIds(outgoingIds);
  }, [outgoingFriendReqs]);

  //  Combined Search Logic
  const searchLower = searchQuery.toLowerCase();

  const matchedFriends = friendsData.filter((f) =>
    f.fullName.toLowerCase().includes(searchLower)
  );

  const matchedRecommended = recommendedUsers.filter((u) =>
    u.fullName.toLowerCase().includes(searchLower)
  );

  const noMatches =
    matchedFriends.length === 0 && matchedRecommended.length === 0;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-primary-content to-secondary-content flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary">
              Meet new Friends
            </h2>
            <p className=" text-base-content text-lg mt-1">
              Discover new friends based on your profile
            </p>
          </div>

          <Link
            to="/notifications"
            className="btn btn-outline hover:btn-secondary btn-md text-primary"
          >
            <UsersIcon className="mr-1 size-4" />
            Friend Requests
          </Link>
        </div>

        {/* Search Bar */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-3.5 text-primary size-5" />
            <input
              type="text"
              placeholder="Search by name..."
              className="input input-primary bg-primary-content w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading */}
        {loadingUsers && (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}

        {/*  Search Results */}
        {searchQuery.trim() !== "" ? (
          <>
            {noMatches ? (
              <div className="card  p-6 text-center">
                <h3 className="font-semibold text-lg">
                  No users match your search.
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/*  Show Friend Cards first */}
                {matchedFriends.map((friend) => (
                  <FriendCard key={friend._id} friend={friend} />
                ))}

                {/*  Show Recommended Cards */}
                {matchedRecommended.map((user) => {
                  const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                  return (
                    <div
                      key={user._id}
                      className="card bg-gradient-to-l from-primary/10 to-secondary/20 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="card-body p-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="avatar size-12 rounded-full">
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                              <img
                                src={user.profilePic}
                                alt={user.fullName}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </div>

                          <h3 className="font-bold text-xl text-primary">
                            {user.fullName}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="badge badge-outline h-8">
                            {getLanguageFlag(user.nativeLanguage)}
                            {capitialize(user.nativeLanguage)}
                          </span>

                          <span className="badge badge-outline h-8">
                            <MapPinIcon className="size-3 mr-1" />
                            {user.location}
                          </span>
                        </div>

                        {user.bio && (
                          <p className="text-lg  text-base-content font-semibold  opacity-100 mt-2">
                            {user.bio}
                          </p>
                        )}

                        <button
                          className={` w-full mt-1 btn btn-outline hover:btn-info flex-1 ${
                            hasRequestBeenSent ? "btn-disabled" : "btn-outline "
                          }`}
                          onClick={() => sendRequestMutation(user._id)}
                          disabled={hasRequestBeenSent || isPending}
                        >
                          {hasRequestBeenSent ? (
                            <>
                              <CheckCircle2Icon className="size-4 " />
                              {/* <span className="text-primary/40">Request Sent</span> */}
                              Request Sent
                            </>
                          ) : (
                            <>
                              <UserPlusIcon className="size-4  " />
                              {/* <span className="text-base-content">Send Friend Request</span> */}
                              Send Friend Request
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /*  Default Recommended Users Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedUsers.map((user) => {
              const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

              return (
                <div
                  key={user._id}
                  className="card bg-gradient-to-l from-primary/10 to-secondary/20 hover:shadow-md transition-all duration-300"
                >
                  <div className="card-body p-6 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="avatar size-12 rounded-full">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img
                            src={user.profilePic}
                            alt={user.fullName}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>

                      <h3 className="font-bold text-xl text-primary">
                        {user.fullName}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="badge badge-outline h-8">
                        {getLanguageFlag(user.nativeLanguage)}
                        {capitialize(user.nativeLanguage)}
                      </span>

                      <span className="badge badge-outline h-8">
                        <MapPinIcon className="size-3.5 mr-1" />
                        {user.location}
                      </span>
                    </div>

                    {user.bio && (
                      <p className="text-lg text-primary font-semibold  opacity-100 mt-2">
                        {user.bio}
                      </p>
                    )}

                    <button
                      className={` w-full mt-1 btn btn-outline hover:btn-info${
                        hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                      }`}
                      onClick={() => sendRequestMutation(user._id)}
                      disabled={hasRequestBeenSent || isPending}
                    >
                      {hasRequestBeenSent ? (
                        <>
                          <CheckCircle2Icon className="size-4 mr-2" />
                          Request Sent
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="size-4 mr-2" />
                          Send Friend Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectPage;

function getLanguageFlag(language) {
  if (!language) return null;
  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];
  if (!countryCode) return null;

  return (
    <img
      src={`https://flagcdn.com/24x18/${countryCode}.png`}
      className="h-3 mr-1 inline-block"
    />
  );
}
