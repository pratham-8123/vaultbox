import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import { resetBrowse } from '../../store/browseSlice';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetBrowse());
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">VaultBox</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-300">{user?.username}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            {user?.role === 'ADMIN' && (
              <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
                Admin
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
