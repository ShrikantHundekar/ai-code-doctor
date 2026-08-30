import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  Bug,
  BookOpen,
  Wand2,
  Shield,
  Layers,
  History,
  GitCompare,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const analyzeNavItems = [
    { name: 'Code Review', path: '/review/new', icon: Code2 },
    { name: 'Debug Code', path: '/debug', icon: Bug },
    { name: 'Explain Code', path: '/explain', icon: BookOpen },
    { name: 'Refactor Code', path: '/refactor', icon: Wand2 },
    { name: 'Security Scan', path: '/security', icon: Shield },
    { name: 'Compare AIs', path: '/compare', icon: Layers, highlight: true },
  ];

  const historyNavItems = [
    { name: 'All Reviews', path: '/history', icon: History },
    { name: 'Compare Reviews', path: '/history/compare', icon: GitCompare },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {state.sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => dispatch({ type: 'SET_SIDEBAR', payload: false })}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col border-r border-gray-800 ${
          state.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-md shadow-blue-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              AI Code Doctor
            </h1>
            <p className="text-[11px] text-gray-400 font-medium">Multi-AI Code Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Main */}
          <div>
            <Link
              to="/"
              onClick={() => dispatch({ type: 'SET_SIDEBAR', payload: false })}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Analyze Tools */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Analyze
            </div>
            <div className="space-y-1">
              {analyzeNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => dispatch({ type: 'SET_SIDEBAR', payload: false })}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.highlight && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-300 border border-purple-500/40">
                        Multi
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* History */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              History
            </div>
            <div className="space-y-1">
              {historyNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => dispatch({ type: 'SET_SIDEBAR', payload: false })}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Account */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Account
            </div>
            <Link
              to="/settings"
              onClick={() => dispatch({ type: 'SET_SIDEBAR', payload: false })}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === '/settings'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user ? getInitials(user.name) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors border border-gray-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
