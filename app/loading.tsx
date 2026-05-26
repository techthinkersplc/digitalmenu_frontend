export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Tailwind Animated Spinner */}
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading your menu details...</p>
    </div>
  );
}