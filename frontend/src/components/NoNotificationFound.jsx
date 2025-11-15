import { BellIcon } from "lucide-react";

function NoNotificationsFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-16 rounded-full bg-gradient-to-t from-primary/10 to-secondary/90 flex items-center justify-center mb-4">
        <BellIcon className="size-8 text-primary  opacity-40" />
      </div>
      <h3 className="text-xl text-primary font-semibold mb-2">
        No notifications yet
      </h3>
      <p className="text-base-content text-lg opacity-70 max-w-md">
        When you recieve friend requests or messages, they will appear here.
      </p>
    </div>
  );
}

export default NoNotificationsFound;
