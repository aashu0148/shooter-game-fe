import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Oops! Page not found</p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
