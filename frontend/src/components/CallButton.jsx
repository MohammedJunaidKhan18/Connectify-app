import { Video } from "lucide-react";
import { useState } from "react";

export default function CallButton({ onVideoCall }) {
  const [loading, setLoading] = useState(false);

  const handleCall = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await onVideoCall();
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div>
      <button
        onClick={handleCall}
        disabled={loading}
        className="btn btn-outline btn-sm text-primary hover:btn-secondary flex items-center gap-2"
      >
        {loading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <Video className="w-5 h-5" />
        )}
        {!loading && <span>Connect</span>}
      </button>
    </div>
  );
}
