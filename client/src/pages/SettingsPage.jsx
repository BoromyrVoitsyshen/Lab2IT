import React from 'react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const { user } = useAuth();

    return (
        <div className="mx-auto w-full max-w-2xl p-6 lg:p-8">
            <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight mb-8">Settings</h1>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Profile Information</h2>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                        <input
                            type="text"
                            value={user?.username || ''}
                            disabled
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2.5 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2.5 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Security</h2>
                <div className="flex flex-col gap-4">
                    <button className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                        Change Password
                    </button>
                    <button className="w-full border border-red-500 text-red-500 py-2.5 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
