import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api.js";
import { Link } from "react-router-dom";
import { UsersIcon, SearchIcon } from "lucide-react";
import NoFriendsFound from "../components/NoFriendsFound.jsx";
import FriendCard from "../components/FriendCard.jsx";

function FriendsPage() {
  const { data: friendsData = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  //  Local state
  const [friends, setFriends] = useState(friendsData);
  const [searchQuery, setSearchQuery] = useState("");

  //  Update local friends when fetched
  useEffect(() => {
    setFriends(friendsData);
  }, [friendsData]);

  //  Remove friend instantly when unfriended
  const handleFriendRemoved = (friendId) => {
    setFriends((prev) => prev.filter((f) => f._id !== friendId));
  };

  //  Live filtering of friends
  const filteredFriends = friends.filter((friend) =>
    friend.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-primary-content to-secondary-content flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary">
              Your Friends
            </h2>
            <p className="text-base-content text-lg mt-2">
              Chat with your friends
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

        {/*  Search Bar */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-3.5 text-primary  size-5" />

            <input
              type="text"
              placeholder="Search your friends..."
              className="input input-primary bg-primary-content w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/*  Content */}
        {loadingFriends ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : filteredFriends.length === 0 ? (
          <div className="card  p-6 text-center">
            <h3 className="font-semibold text-lg">
              You have no friends with that name.
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFriends.map((friend) => (
              <FriendCard
                key={friend._id}
                friend={friend}
                onRemoved={handleFriendRemoved}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FriendsPage;
