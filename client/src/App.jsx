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
    if (loading) return <div>Loading...</div>;
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
