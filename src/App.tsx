import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Calendar, Users, ClipboardCheck, AlertCircle, LogOut } from 'lucide-react';
import { supabase, signIn, signOut, signUp } from './lib/supabase';
import StaffList from './components/StaffList';
import ShiftSchedule from './components/ShiftSchedule';
import Attendance from './components/Attendance';

function App() {
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSupabaseError(null);
    
    if (isSigningUp) {
      const { error } = await signUp(loginData.email, loginData.password);
      if (error) {
        setSupabaseError(error.message);
      } else {
        setSupabaseError("Check your email for verification link");
        setIsSigningUp(false);
      }
    } else {
      const { error } = await signIn(loginData.email, loginData.password);
      if (error) {
        setSupabaseError(error.message);
      } else {
        setShowLogin(false);
        setSupabaseError(null);
      }
    }
  }

  async function handleLogout() {
    await signOut();
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Hospital Shift Manager</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            {supabaseError && (
              <div className="text-red-600 text-sm">{supabaseError}</div>
            )}
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSigningUp ? 'Sign Up' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setIsSigningUp(!isSigningUp)}
              className="w-full text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isSigningUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-800">Hospital Shift Manager</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Staff
                  </Link>
                  <Link
                    to="/schedule"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Link>
                  <Link
                    to="/attendance"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Attendance
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<StaffList />} />
            <Route path="/schedule" element={<ShiftSchedule />} />
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;