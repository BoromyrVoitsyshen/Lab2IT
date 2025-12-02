import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DashboardPage = ({ filter }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotes();
    }, [filter]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/notes?filter=${filter}`);
            setNotes(res.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        if (!window.confirm('Are you sure you want to move this note to trash?')) return;
        try {
            await axios.delete(`/api/notes/${id}`);
            fetchNotes(); // Refresh list
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleRestore = async (e, id) => {
        e.preventDefault();
        try {
            await axios.put(`/api/notes/${id}/restore`);
            fetchNotes();
        } catch (error) {
            console.error('Error restoring note:', error);
        }
    };

    const handlePermanentDelete = async (e, id) => {
        e.preventDefault();
        if (!window.confirm('This action cannot be undone. Delete permanently?')) return;
        try {
            await axios.delete(`/api/notes/${id}/permanent`);
            fetchNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const getPageTitle = () => {
        switch (filter) {
            case 'shared': return 'Shared with me';
            case 'favorites': return 'Favorites';
            case 'trash': return 'Trash';
            default: return 'My Notes';
        }
    };

    return (
        <div className="mx-auto w-full max-w-5xl p-6 lg:p-8">
            {/* PageHeading */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">{getPageTitle()}</h1>
                {filter !== 'trash' && (
                    <Link to="/note/new" className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
                        <span className="material-symbols-outlined text-lg">add</span>
                        <span className="truncate">Create New Note</span>
                    </Link>
                )}
            </div>

            {/* Table */}
            <div className="w-full @container">
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="w-1/2 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</th>
                                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-slate-500">Loading...</td>
                                </tr>
                            ) : notes.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-slate-500">No notes found.</td>
                                </tr>
                            ) : (
                                notes.map(note => (
                                    <tr key={note.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="h-[72px] px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                            <Link to={`/note/${note.id}/edit`} className="hover:text-primary transition-colors flex items-center gap-2">
                                                {note.is_favorite && <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                                                {note.title || 'Untitled'}
                                            </Link>
                                            {note.owner_name && <span className="text-xs text-slate-400 block">Owner: {note.owner_name}</span>}
                                        </td>
                                        <td className="h-[72px] px-6 py-4 whitespace-nowrap text-sm">
                                            {note.is_public ? (
                                                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/50 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">Public Link</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">Private</span>
                                            )}
                                        </td>
                                        <td className="h-[72px] px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                {filter === 'trash' ? (
                                                    <>
                                                        <button onClick={(e) => handleRestore(e, note.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-green-500 dark:hover:text-green-400 transition-colors" title="Restore">
                                                            <span className="material-symbols-outlined text-xl">restore_from_trash</span>
                                                        </button>
                                                        <button onClick={(e) => handlePermanentDelete(e, note.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Delete Permanently">
                                                            <span className="material-symbols-outlined text-xl">delete_forever</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Link to={`/note/${note.id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary-300 transition-colors">
                                                            <span className="material-symbols-outlined text-xl">edit</span>
                                                        </Link>
                                                        <button onClick={(e) => handleDelete(e, note.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                                            <span className="material-symbols-outlined text-xl">delete</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
