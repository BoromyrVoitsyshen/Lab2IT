import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import NoteEditorPage from './pages/NoteEditorPage';
import NoteViewPage from './pages/NoteViewPage';
import SettingsPage from './pages/SettingsPage';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark font-display">
                <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 px-6 py-4 shadow-lg shadow-slate-900/10 dark:shadow-black/40">
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                        Checking your session, please wait...
                    </p>
                </div>
            </div>
        );
    }
    if (!user) {
        return <Navigate to="/auth" replace />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/note/:id" element={<NoteViewPage />} />

                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<DashboardPage filter="all" />} />
                    <Route path="shared" element={<DashboardPage filter="shared" />} />
                    <Route path="favorites" element={<DashboardPage filter="favorites" />} />
                    <Route path="trash" element={<DashboardPage filter="trash" />} />
                    <Route path="note/new" element={<NoteEditorPage />} />
                    <Route path="note/:id/edit" element={<NoteEditorPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
