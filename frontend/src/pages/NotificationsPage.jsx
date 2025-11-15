import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptFriendRequest,
  getFriendRequests,
  rejectFriendRequest,
} from "../lib/api";

import {
  BellIcon,
  CircleCheck,
  ClockIcon,
  MessageSquareIcon,
  UserCheckIcon,
  XCircleIcon,
} from "lucide-react";

import NoNotificationsFound from "../components/NoNotificationFound";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function NotificationsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: friendrequests, isLoading } = useQuery({
    queryKey: ["friendrequests"],
    queryFn: getFriendRequests,
  });

  //  Memoized raw requests
  const incomingRequestsRaw = useMemo(
    () => friendrequests?.incomingReqs || [],
    [friendrequests]
  );

  const acceptedRequestsRaw = useMemo(
    () => friendrequests?.acceptedReqs || [],
    [friendrequests]
  );

  //  Local UI lists
  const [localIncoming, setLocalIncoming] = useState([]);
  const [localAccepted, setLocalAccepted] = useState([]);

  useEffect(() => {
    setLocalIncoming(incomingRequestsRaw);
    setLocalAccepted(acceptedRequestsRaw);
  }, [incomingRequestsRaw, acceptedRequestsRaw]);

  //  Load dismissed IDs
  const dismissedIds = useMemo(() => {
    return JSON.parse(localStorage.getItem("dismissedNotifications")) || [];
  }, []);

  //  Filter dismissed
  const incomingRequests = useMemo(
    () => localIncoming.filter((n) => !dismissedIds.includes(n._id)),
    [localIncoming, dismissedIds]
  );

  const acceptedRequests = useMemo(
    () => localAccepted.filter((n) => !dismissedIds.includes(n._id)),
    [localAccepted, dismissedIds]
  );

  //  Store new unread notifications
  useEffect(() => {
    if (!friendrequests) return;

    const stored = JSON.parse(localStorage.getItem("unreadNotifications")) || {
      incoming: [],
      accepted: [],
    };

    incomingRequestsRaw.forEach((req) => {
      if (!stored.incoming.includes(req._id)) {
        stored.incoming.push(req._id);
      }
    });

    acceptedRequestsRaw.forEach((req) => {
      if (!stored.accepted.includes(req._id)) {
        stored.accepted.push(req._id);
      }
    });

    localStorage.setItem("unreadNotifications", JSON.stringify(stored));
    window.dispatchEvent(new Event("notifications-updated"));
  }, [incomingRequestsRaw, acceptedRequestsRaw, friendrequests]);

  //  Dismiss notification
  const dismissNotification = (id) => {
    // Remove from unread list
    let unread = JSON.parse(localStorage.getItem("unreadNotifications")) || {
      incoming: [],
      accepted: [],
    };

    unread.incoming = unread.incoming.filter((x) => x !== id);
    unread.accepted = unread.accepted.filter((x) => x !== id);

    localStorage.setItem("unreadNotifications", JSON.stringify(unread));

    // Add to dismissed
    let dismissed =
      JSON.parse(localStorage.getItem("dismissedNotifications")) || [];

    if (!dismissed.includes(id)) dismissed.push(id);

    localStorage.setItem("dismissedNotifications", JSON.stringify(dismissed));

    // Live UI update
    setLocalIncoming((prev) => prev.filter((n) => n._id !== id));
    setLocalAccepted((prev) => prev.filter((n) => n._id !== id));

    window.dispatchEvent(new Event("notifications-updated"));
  };

  //  Accept friend request
  const { mutate: acceptRequestMutation } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: (_, requestId) => {
      dismissNotification(requestId);

      queryClient.invalidateQueries(["friends"]);
      queryClient.invalidateQueries(["recommendedusers"]);
    },
  });

  //  Reject friend request
  const { mutate: rejectRequestMutation } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: (_, requestId) => {
      dismissNotification(requestId);
      queryClient.invalidateQueries(["recommendedusers"]);
    },
  });

  return (
    <div className="min-h-screen  p-6 sm:p-6 lg:p-8 bg-gradient-to-b from-primary-content to-secondary-content">
      <div className=" container mx-auto max-w-4xl space-y-10">
        <h1 className="text-2xl text-secondary sm:text-3xl text-center font-bold tracking-tight">
          Notifications
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {/*  Accepted Requests */}
            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {acceptedRequests.map((notification) => {
                    //  Safe recipient fallback
                    const user = notification.recipient || {};

                    return (
                      <div
                        key={notification._id}
                        className="card bg-gradient-to-l from-primary/10 to-secondary/20 hover:shadow-md transition-all duration-300"
                      >
                        <div className="card-body p-6 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="avatar w-16 h-16 rounded-full overflow-hidden">
                              <img
                                src={user.profilePic || "/default-avatar.png"}
                                alt={user.fullName || "Unknown User"}
                              />
                            </div>

                            <div className="flex-1">
                              <h3 className="font-bold text-primary">
                                {user.fullName || "Unknown User"}
                              </h3>

                              <p className="text-md text-primary">
                                accepted your friend request
                              </p>

                              <p className="text-xs flex items-center text-secondary mt-1">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                Recently
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              className="btn btn-outline hover:btn-info flex-1"
                              onClick={() => {
                                dismissNotification(notification._id);
                                if (user._id) {
                                  navigate(`/chat/${user._id}`);
                                }
                              }}
                            >
                              <MessageSquareIcon className="h-4 w-4 " />
                              Message
                            </button>

                            <button
                              className="btn btn-outline hover:btn-secondary flex-1"
                              onClick={() =>
                                dismissNotification(notification._id)
                              }
                            >
                              <CircleCheck className="h-4 w-4" />
                              OK
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/*  Incoming Friend Requests */}
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl text-primary font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 " />
                  Friend Requests
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {incomingRequests.map((request) => {
                    //  Safe sender fallback
                    const sender = request.sender || {};

                    return (
                      <div
                        key={request._id}
                        className="card bg-gradient-to-l from-primary/10 to-secondary/20 hover:shadow-md transition-all duration-300"
                      >
                        <div className="card-body p-6 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="avatar size-14 rounded-full">
                              <img
                                src={sender.profilePic || "/default-avatar.png"}
                                alt={sender.fullName || "Unknown User"}
                              />
                            </div>

                            <div>
                              <h3 className="font-semibold text-lg text-primary">
                                {sender.fullName || "Unknown User"}
                              </h3>

                              <p className="text-s  mt-1 text-secondary">
                                {sender.location || "Unknown Location"}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              className="btn btn-outline hover:btn-error flex-1"
                              onClick={() => rejectRequestMutation(request._id)}
                            >
                              <XCircleIcon className="size-4" />
                              Reject
                            </button>

                            <button
                              className="btn btn-outline hover:btn-info flex-1"
                              onClick={() => acceptRequestMutation(request._id)}
                            >
                              <CircleCheck className="size-4" />
                              Accept
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <NoNotificationsFound />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
