import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Learn from the
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    {' '}Best Tutors
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Connect with experienced tutors and accelerate your learning journey.
                  Get personalized 1-on-1 tutoring from the comfort of your home.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/tutors"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-200"
                >
                  Browse Tutors
                </Link>
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition duration-200"
                >
                  Get Started
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-12 border-t border-gray-200">
                <div>
                  <p className="text-3xl font-bold text-blue-600">500+</p>
                  <p className="text-gray-600">Expert Tutors</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-indigo-600">10K+</p>
                  <p className="text-gray-600">Happy Students</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-600">4.9★</p>
                  <p className="text-gray-600">Avg Rating</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Decorative Circles */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-3xl opacity-20"></div>

                {/* Main Card */}
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                      👨‍🏫
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Sarah Johnson</p>
                      <p className="text-sm text-gray-600">Math Expert</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-700">
                      "Passionate about making mathematics fun and easy to understand!"
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="flex text-yellow-400">
                        {'⭐'.repeat(5)}
                      </div>
                      <span className="text-sm text-gray-600">(248 reviews)</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Hourly Rate</p>
                    <p className="text-2xl font-bold text-blue-600">$45/hour</p>
                  </div>

                  <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Choose Home Tutor?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                ⏰
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Flexible Scheduling</h3>
              <p className="text-gray-600">
                Choose tutors based on your availability. Learn at your own pace, whenever you want.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                💰
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Affordable Rates</h3>
              <p className="text-gray-600">
                Competitive pricing with transparent billing. No hidden fees or surprise charges.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                ⭐
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Expert Tutors</h3>
              <p className="text-gray-600">
                All tutors are verified professionals with proven expertise in their subjects.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                📱
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Online Sessions</h3>
              <p className="text-gray-600">
                Learn from home via video calls. No commute, no hassle, just quality education.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                📊
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your learning progress and get personalized feedback from your tutor.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items items-center justify-center mx-auto text-3xl">
                🤝
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Community Support</h3>
              <p className="text-gray-600">
                Join a vibrant community of learners and tutors. Share resources and tips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to Start Learning?</h2>
          <p className="text-xl text-blue-100">
            Join thousands of students already transforming their education with expert tutoring.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/tutors"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition"
            >
              Browse Tutors Now
            </Link>
            <Link
              to="/signup"
              className="px-8 py-4 bg-blue-500 text-white font-semibold rounded-lg border-2 border-white hover:bg-blue-600 transition"
            >
              Sign Up Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <p className="text-lg font-semibold">🎓 Home Tutor System</p>
          <p>© 2026 Home Tutor. All rights reserved.</p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
