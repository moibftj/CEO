import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Talk to My Lawyer
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-12">
          Professional legal letter generation at your fingertips. Get started with AI-powered legal assistance today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/login"
            className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 w-full sm:w-auto"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 border-2 border-indigo-600 w-full sm:w-auto"
          >
            Register
          </Link>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Letters</h3>
            <p className="text-gray-600">Generate professional legal letters using advanced AI technology.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">⚖️</div>
            <h3 className="text-xl font-semibold mb-2">Attorney Review</h3>
            <p className="text-gray-600">All letters are reviewed by qualified attorneys before delivery.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Fast & Secure</h3>
            <p className="text-gray-600">Get your legal letters quickly with enterprise-grade security.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

