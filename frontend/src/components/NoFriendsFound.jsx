import { Link } from "react-router-dom";

function NoFriendsFound() {
  return (
    <div className="card bg-primary/10 p-6 text-center">
      <h2 className="font-bold text-base-content text-2xl mb-2">
        {" "}
        No Friends yet
      </h2>

      <div className="flex justify-center gap-2">
        <p className="text-base-content text-lg font-semibold opacity-100">
          Want to connect and chat with friends...
        </p>
        <Link
          to="/connect"
          className=" text-secondary font-bold text-lg hover:underline"
        >
          Connect now
        </Link>
      </div>
    </div>
  );
}

export default NoFriendsFound;
