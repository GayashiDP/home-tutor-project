import { Link, Navigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage({ role }) {
  const { user, logout } = useAuth();
  const isTutor = role === 'Tutor';

  const quickStats = isTutor
    ? [
        { label: 'Listing', value: 'Live', detail: 'Tutor profile active', icon: '✓', color: 'green' },
        { label: 'Schedule', value: 'Weekly', detail: 'Manage bookable slots', icon: '📅', color: 'blue' },
        { label: 'Bookings', value: 'Pending', detail: 'Review student requests', icon: '📋', color: 'purple' },
      ]
    : [
        { label: 'Tutors', value: '500+', detail: 'Browse our collection', icon: '👥', color: 'blue' },
        { label: 'Bookings', value: 'Ready', detail: 'Schedule your sessions', icon: '📅', color: 'green' },
        { label: 'Sessions', value: 'Secure', detail: 'Protected learning space', icon: '🔒', color: 'purple' },
      ];

  const actionCards = isTutor ? [
    { title: 'Profile', description: 'View and update your details', path: '/profile', icon: '👤' },
    { title: 'Subjects', description: 'Manage your tutor listing', path: '/tutor/subjects', icon: '📚' },
    { title: 'Availability', description: 'Set your weekly schedule', path: '/tutor/availability', icon: '📆' },
    { title: 'Bookings', description: 'View student bookings', path: '/tutor/bookings', icon: '📝' },
  ] : [
    { title: 'Browse Tutors', description: 'Find your next tutor', path: '/tutors', icon: '🔍' },
    { title: 'Profile', description: 'Manage your profile', path: '/profile', icon: '👤' },
    { title: 'My Bookings', description: 'View your sessions', path: '/student/bookings', icon: '📅' },
    { title: 'Payments', description: 'View transactions', path: '/student/payments', icon: '💳' },
  ];

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    const redirectPath = user.role === 'Tutor' ? '/tutor/dashboard' : '/student/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Welcome Back</p>
              <h1 className="text-4xl font-bold text-gray-900 mt-2">Hi, {user.name}! 👋</h1>
              <p className="text-gray-600 mt-2 text-lg">
                {isTutor
                  ? 'Manage your tutoring sessions and profile from here.'
                  : 'Find amazing tutors and book your sessions here.'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-6 w-full md:w-auto">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.role}</p>
                  <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className={`text-3xl w-12 h-12 rounded-lg flex items-center justify-center ${
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'blue' ? 'bg-blue-100' :
                  'bg-purple-100'
                }`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-gray-500 text-xs mt-2">{stat.detail}</p>
            </div>
          ))}
        </div>

        {/* Action Cards Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {actionCards.map((card) => (
              <Link
                key={card.path}
                to={card.path}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transform hover:-translate-y-1 transition duration-300 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition">{card.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
                <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition">
                  <span>Explore</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={logout}
            className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
