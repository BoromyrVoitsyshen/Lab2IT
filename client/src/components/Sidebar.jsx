import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shrink-0 h-screen sticky top-0">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-slate-900 dark:text-white text-base font-medium leading-normal">{user?.username || 'User'}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">{user?.email || 'email@example.com'}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-1 mt-4">
                    <Link to="/" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/') ? 'bg-primary/10 dark:bg-primary/20 text-primary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <span className="material-symbols-outlined text-xl" style={isActive('/') ? { fontVariationSettings: "'FILL' 1" } : {}}>description</span>
                        <p className="text-sm font-medium leading-normal">My Notes</p>
                    </Link>
                    <Link to="/shared" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/shared') ? 'bg-primary/10 dark:bg-primary/20 text-primary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <span className="material-symbols-outlined text-xl">group</span>
                        <p className="text-sm font-medium leading-normal">Shared with me</p>
                    </Link>
                    <Link to="/favorites" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/favorites') ? 'bg-primary/10 dark:bg-primary/20 text-primary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <span className="material-symbols-outlined text-xl">star</span>
                        <p className="text-sm font-medium leading-normal">Favorites</p>
                    </Link>
                    <Link to="/trash" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/trash') ? 'bg-primary/10 dark:bg-primary/20 text-primary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <span className="material-symbols-outlined text-xl">delete</span>
                        <p className="text-sm font-medium leading-normal">Trash</p>
                    </Link>
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-1">
                <Link to="/settings" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/settings') ? 'bg-primary/10 dark:bg-primary/20 text-primary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <span className="material-symbols-outlined text-xl">settings</span>
                    <p className="text-sm font-medium leading-normal">Settings</p>
                </Link>
                <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left">
                    <span className="material-symbols-outlined text-xl">logout</span>
                    <p className="text-sm font-medium leading-normal">Logout</p>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
