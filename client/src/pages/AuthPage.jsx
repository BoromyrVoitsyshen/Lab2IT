import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const res = await login(email, password);
            if (res.success) {
                navigate('/');
            } else {
                setError(res.message);
            }
        } else {
            const res = await register(username, email, password);
            if (res.success) {
                const loginRes = await login(email, password);
                if (loginRes.success) {
                    navigate('/');
                } else {
                    setIsLogin(true);
                    setError('Registration successful. Please login.');
                }
            } else {
                setError(res.message);
            }
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4 font-display">
            <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl bg-white dark:bg-slate-900/50 p-6 shadow-xl md:p-10">
                {/* Logo Placeholder */}
                <div className="flex items-center gap-2">
                    <svg className="text-primary" fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg"><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M3 15h6"></path><path d="M6 12v6"></path></svg>
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">NotesApp</span>
                </div>
                {/* Page Heading */}
                <div className="flex w-full flex-col gap-2 text-center">
                    <p className="text-[#0d141b] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Your ideas in one place</p>
                    <p className="text-[#4c739a] dark:text-slate-400 text-base font-normal leading-normal">Log in or create an account to start</p>
                </div>
                {/* Segmented Buttons */}
                <div className="flex w-full p-1">
                    <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-[#e7edf3] dark:bg-slate-800 p-1">
                        <label className={`flex h-full grow cursor-pointer items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-medium leading-normal transition-all ${isLogin ? 'bg-white dark:bg-slate-900 text-[#0d141b] dark:text-white shadow-[0_0_4px_rgba(0,0,0,0.1)]' : 'text-[#4c739a] dark:text-slate-400'}`}>
                            <span className="truncate">Login</span>
                            <input
                                type="radio"
                                name="auth-toggle"
                                className="invisible w-0"
                                checked={isLogin}
                                onChange={() => setIsLogin(true)}
                            />
                        </label>
                        <label className={`flex h-full grow cursor-pointer items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-medium leading-normal transition-all ${!isLogin ? 'bg-white dark:bg-slate-900 text-[#0d141b] dark:text-white shadow-[0_0_4px_rgba(0,0,0,0.1)]' : 'text-[#4c739a] dark:text-slate-400'}`}>
                            <span className="truncate">Register</span>
                            <input
                                type="radio"
                                name="auth-toggle"
                                className="invisible w-0"
                                checked={!isLogin}
                                onChange={() => setIsLogin(false)}
                            />
                        </label>
                    </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
                    {!isLogin && (
                        <label className="flex flex-col flex-1">
                            <p className="text-[#0d141b] dark:text-slate-200 text-base font-medium leading-normal pb-2">Username</p>
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141b] dark:text-white dark:placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary dark:focus:border-primary h-14 placeholder:text-[#4c739a] p-[15px] text-base font-normal leading-normal"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </label>
                    )}
                    <label className="flex flex-col flex-1">
                        <p className="text-[#0d141b] dark:text-slate-200 text-base font-medium leading-normal pb-2">Email</p>
                        <input
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141b] dark:text-white dark:placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary dark:focus:border-primary h-14 placeholder:text-[#4c739a] p-[15px] text-base font-normal leading-normal"
                            placeholder="E-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            type="email"
                        />
                    </label>
                    <label className="flex flex-col flex-1">
                        <p className="text-[#0d141b] dark:text-slate-200 text-base font-medium leading-normal pb-2">Password</p>
                        <div className="flex w-full flex-1 items-stretch rounded-lg">
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-[#0d141b] dark:text-white dark:placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary dark:focus:border-primary h-14 placeholder:text-[#4c739a] p-[15px] border-r-0 pr-2 text-base font-normal leading-normal"
                                placeholder="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="flex cursor-pointer items-center justify-center rounded-r-lg border border-l-0 border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-[15px] text-[#4c739a] dark:text-slate-400">
                                <span className="material-symbols-outlined">visibility</span>
                            </div>
                        </div>
                    </label>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <p className="text-[#4c739a] dark:text-slate-400 hover:text-primary dark:hover:text-primary cursor-pointer text-sm font-normal leading-normal self-start underline">Forgot password?</p>

                    {/* Primary Button */}
                    <button className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <span>{isLogin ? 'Login' : 'Create Account'}</span>
                    </button>
                </form>

                {/* Social Logins */}
                <div className="flex w-full flex-col items-center gap-4">
                    <div className="flex w-full items-center gap-4">
                        <hr className="w-full border-slate-200 dark:border-slate-700" />
                        <span className="text-sm text-[#4c739a] dark:text-slate-400">Or</span>
                        <hr className="w-full border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:flex-row">
                        <button className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21.35 11.1H12.18V13.83H18.68C18.43 15.63 17.52 17.1 16.21 17.98V20.18H18.63C20.32 18.65 21.35 16.14 21.35 13.08C21.35 12.39 21.35 11.73 21.35 11.1Z" fill="#4285F4"></path>
                                <path d="M12.18 21.98C15.02 21.98 17.42 21.03 19.01 19.45L16.6 17.35C15.68 18.01 14.36 18.48 12.18 18.48C9.57 18.48 7.33 16.71 6.54 14.29H3.96V16.5C5.55 19.68 8.61 21.98 12.18 21.98Z" fill="#34A853"></path>
                                <path d="M6.54 14.29C6.34 13.72 6.24 13.13 6.24 12.53C6.24 11.93 6.34 11.34 6.54 10.77V8.57H3.96C3.17 10.01 2.72 11.56 2.72 13.13C2.72 14.7 3.17 16.25 3.96 17.69L6.54 15.49V14.29Z" fill="#FBBC05"></path>
                                <path d="M12.18 6.58C13.56 6.58 14.71 7.03 15.61 7.89L17.99 5.54C16.34 4.02 14.21 3 11.58 3C8.01 3 4.95 5.29 3.36 8.47L5.94 10.67C6.73 8.25 8.97 6.58 11.58 6.58H12.18Z" fill="#EA4335"></path>
                            </svg>
                            <span>Google</span>
                        </button>
                        <button className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.252 12.016C17.252 11.23 17.33 10.51 17.45 9.84H12.13V12.9H15.9C15.71 13.88 15.12 14.93 14.12 15.64V17.55H16.03C17.02 16.57 17.55 15.08 17.89 13.43C17.48 12.98 17.252 12.44 17.252 12.016ZM12.12 18.001C10.51 18.001 9.07 17.43 8.01 16.31L6.1 17.55C7.43 18.91 9.4 20 12.12 20C14.88 20 17.15 18.82 18.42 16.9L16.48 15.64C15.69 16.14 14.61 17.07 12.93 17.44C13.11 17.65 13.06 17.85 12.12 18.001Z" fill="#000"></path>
                                <path d="M20.24 12.83C20.24 12.15 19.59 11.64 18.88 11.64C18.17 11.64 17.55 12.15 17.55 12.83C17.55 13.51 18.17 14.02 18.88 14.02C19.59 14.02 20.24 13.51 20.24 12.83Z" fill="#000"></path>
                                <path d="M12 2.01998C10.13 2.01998 8.4 3.74998 8.4 5.61998C8.4 7.48998 10.13 9.21998 12 9.21998C13.87 9.21998 15.6 7.48998 15.6 5.61998C15.6 3.74998 13.87 2.01998 12 2.01998Z" fill="#000"></path>
                            </svg>
                            <span>Apple</span>
                        </button>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="pt-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        By registering, you agree to our
                        <a href="#" className="font-medium text-primary hover:underline"> Terms of Service</a> and
                        <a href="#" className="font-medium text-primary hover:underline"> Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
