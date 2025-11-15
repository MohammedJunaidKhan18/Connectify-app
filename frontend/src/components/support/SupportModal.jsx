import { useState } from "react";
import { X } from "lucide-react";
import StarRating from "./StarRating";
import toast from "react-hot-toast";

export default function SupportModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          message,
          rating,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("Feedback sent successfully");

      // reset values
      setEmail("");
      setUsername("");
      setMessage("");
      setRating(0);

      onClose();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 bg-black/150 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
    >
      <div className="bg-white bg-gradient-to-tl from-black to-gray-800 rounded-xl p-6 w-full max-w-md shadow-lg animate-scaleIn">
        {/* HEADER */}
        <div className="flex justify-between items-center  mb-4">
          <h2 className="text-lg font-mono">Support & Feedback</h2>
          <button
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-md font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-black focus:ring-0 focus:ring-black outline-none"
              placeholder="name@gmail.com"
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-md font-medium">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700  dark:border-black focus:ring-0 focus:ring-black outline-none"
              placeholder="Enter your username"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-md font-medium">Updates / Suggestions</label>
            <textarea
              required
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700  dark:border-black focus:ring-0 focus:ring-black outline-none"
              placeholder="What improvements would you like to see?"
            ></textarea>
          </div>

          {/* Rating */}
          <div>
            <label className="text-md font-medium">Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
