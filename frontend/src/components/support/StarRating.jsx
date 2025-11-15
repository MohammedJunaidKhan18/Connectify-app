export default function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-2 mt-1">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < value;
        return (
          <button
            key={i}
            type="button"
            className={`text-2xl transition ${
              filled ? "text-yellow-600" : "text-gray-400 hover:text-yellow-300"
            }`}
            onClick={() => onChange(i + 1)}
          >
            {filled ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}
