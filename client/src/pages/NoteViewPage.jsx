import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Создаем отдельный экземпляр axios для публичных запросов без авторизации
const publicAxios = axios.create();

const NoteViewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPublicNote();
        fetchPublicFiles();
    }, [id]);

    const fetchPublicNote = async () => {
        try {
            // Используем отдельный экземпляр axios без авторизации для публичных запросов
            const res = await publicAxios.get(`/api/notes/public/${id}`);
            setTitle(res.data.title || '');
            setContent(res.data.content || '');
        } catch (error) {
            console.error('Error fetching note:', error);
            setError('Note not found or not public');
        } finally {
            setLoading(false);
        }
    };

    const fetchPublicFiles = async () => {
        try {
            // Используем отдельный экземпляр axios без авторизации для публичных запросов
            const res = await publicAxios.get(`/api/files/note/${id}/public`);
            setFiles(res.data);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
            <div className="text-slate-600 dark:text-slate-400">Loading...</div>
        </div>
    );

    if (error) return (
        <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
            <div className="text-center">
                <p className="text-xl text-slate-800 dark:text-slate-200 mb-4">{error}</p>
                <button
                    onClick={() => navigate('/auth')}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    Go to Login
                </button>
            </div>
        </div>
    );

    return (
        <div className="relative flex min-h-screen w-full bg-background-light dark:bg-background-dark font-display">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 h-screen">
                <div className="mx-auto max-w-4xl h-full flex flex-col">
                    {/* Header */}
                    <header className="flex justify-between items-center gap-2 mb-6">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-3xl text-primary">description</span>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Public Note (Read-only)</p>
                        </div>
                        <button
                            onClick={() => navigate('/auth')}
                            className="flex items-center justify-center overflow-hidden rounded-lg h-10 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-wide min-w-0 px-4 hover:bg-primary/90 transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">login</span>
                            <span className="truncate">Sign in to Edit</span>
                        </button>
                    </header>

                    {/* Title Display */}
                    <div className="mb-4">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 p-4 bg-white dark:bg-slate-900/50 rounded-lg">
                            {title}
                        </h1>
                    </div>

                    {/* Content Display */}
                    <div className="flex items-start gap-3 flex-1 min-h-0">
                        <div className="flex flex-col min-w-40 h-full flex-1">
                            <div className="flex w-full flex-1 items-stretch rounded-lg flex-col bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                <div className="flex flex-1 flex-col p-4 overflow-y-auto">
                                    <div className="prose prose-slate dark:prose-invert max-w-none">
                                        {content ? (
                                            <pre className="whitespace-pre-wrap text-base font-normal leading-relaxed text-slate-800 dark:text-slate-200">
                                                {content}
                                            </pre>
                                        ) : (
                                            <p className="text-base font-normal leading-relaxed text-slate-500 dark:text-slate-400 italic">
                                                No content
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attachments Section */}
                    {files.length > 0 && (
                        <div className="mt-8 mb-8">
                            <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight px-0 pb-3 pt-4">Attachments</h3>
                            <div className="flex flex-col gap-3">
                                {files.map(file => (
                                    <div key={file.id} className="flex items-center p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                        <span className="material-symbols-outlined text-3xl text-primary mr-3">draft</span>
                                        <div className="flex-1">
                                            <a href={`/uploads/${file.filename}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:underline">
                                                {file.original_name}
                                            </a>
                                        </div>
                                        <a
                                            href={`/uploads/${file.filename}`}
                                            download={file.original_name}
                                            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            title="Download file"
                                        >
                                            <span className="material-symbols-outlined text-xl">download</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default NoteViewPage;
