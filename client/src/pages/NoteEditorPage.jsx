import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const NoteEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(isNew ? 'Not saved yet' : 'All changes saved');
    const [shareEmail, setShareEmail] = useState('');
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [collaborators, setCollaborators] = useState([]);

    useEffect(() => {
        if (!isNew) {
            fetchNote();
            fetchFiles();
            fetchCollaborators();
        }
    }, [id]);

    const fetchNote = async () => {
        try {
            const res = await axios.get(`/api/notes/${id}`);
            console.log('Fetched note:', res.data);
            console.log('is_public value:', res.data.is_public, 'type:', typeof res.data.is_public);
            setTitle(res.data.title || '');
            setContent(res.data.content || '');
            // Сервер теперь всегда возвращает boolean значения
            const isPublicValue = Boolean(res.data.is_public);
            console.log('Setting isPublic to:', isPublicValue);
            setIsPublic(isPublicValue);
            setIsFavorite(Boolean(res.data.is_favorite));
        } catch (error) {
            console.error('Error fetching note:', error);
            if (error.response?.status === 404) navigate('/');
        } finally {
            setLoading(false);
            if (!isNew) {
                setSaveStatus('All changes saved');
            }
        }
    };

    const fetchFiles = async () => {
        try {
            const res = await axios.get(`/api/files/note/${id}`);
            setFiles(res.data);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const fetchCollaborators = async () => {
        if (isNew) return;
        try {
            const res = await axios.get(`/api/notes/${id}/collaborators`);
            setCollaborators(res.data);
        } catch (error) {
            console.error('Error fetching collaborators:', error);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) return alert('Title is required');
        setSaving(true);
        setSaveStatus('Saving...');
        try {
            if (isNew) {
                console.log('Creating new note with is_public:', isPublic, typeof isPublic);
                const res = await axios.post('/api/notes', { title, content, is_public: isPublic });
                console.log('Created note:', res.data);
                navigate(`/note/${res.data.id}/edit`);
            } else {
                console.log('Saving note ID:', id);
                console.log('Saving note with is_public:', isPublic, typeof isPublic);
                console.log('Full data being sent:', { title, content, is_public: isPublic });
                const res = await axios.put(`/api/notes/${id}`, { title, content, is_public: isPublic });
                console.log('Server response:', res.data);
                // Перезагружаем заметку после сохранения, чтобы убедиться, что состояние синхронизировано
                await fetchNote();
                setSaveStatus('All changes saved');
            }
        } catch (error) {
            console.error('Error saving note:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            alert('Failed to save: ' + (error.response?.data?.message || error.message));
            setSaveStatus('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        if (isNew) return alert('Please save the note first before uploading files.');
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('noteId', id);

        try {
            await axios.post('/api/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchFiles();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Upload failed');
        }
    };

    const handleShare = async () => {
        if (!shareEmail.trim()) return alert('Please enter an email address');
        try {
            await axios.post(`/api/notes/${id}/share`, { targetEmail: shareEmail, canEdit: true });
            alert('Shared successfully!');
            setShareEmail('');
            setShowShareDialog(false);
            fetchCollaborators(); // Обновить список коллабораторов
        } catch (error) {
            alert('Failed to share: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const handleRemoveCollaborator = async (userId) => {
        if (!window.confirm('Remove this collaborator?')) return;
        try {
            await axios.delete(`/api/notes/${id}/collaborators/${userId}`);
            alert('Collaborator removed successfully');
            fetchCollaborators(); // Обновить список коллабораторов
        } catch (error) {
            alert('Failed to remove collaborator: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const handleCopyLink = async () => {
        if (isNew) return alert('Please save the note first');
        const link = `${window.location.origin}/note/${id}`;
        try {
            await navigator.clipboard.writeText(link);
            alert('Link copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            alert('Failed to copy link');
        }
    };

    const handleDeleteFile = async (fileId) => {
        if (!window.confirm('Delete this file?')) return;
        try {
            await axios.delete(`/api/files/${fileId}`);
            fetchFiles();
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Failed to delete file');
        }
    };

    const toggleFavorite = async () => {
        if (isNew) return alert('Please save the note first');
        try {
            await axios.put(`/api/notes/${id}/favorite`, { is_favorite: !isFavorite });
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Failed to update favorite status');
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="relative flex min-h-screen w-full bg-background-light dark:bg-background-dark font-display">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 h-screen">
                <div className="mx-auto max-w-4xl h-full flex flex-col">
                    {/* ToolBar */}
                    <header className="flex justify-between items-center gap-2 mb-6">
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {saving ? 'Saving…' : saveStatus}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowShareDialog(!showShareDialog)} className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" title="Share">
                                <span className="material-symbols-outlined text-2xl">share</span>
                            </button>
                            <button onClick={toggleFavorite} className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                                <span className="material-symbols-outlined text-2xl" style={isFavorite ? { fontVariationSettings: "'FILL' 1", color: '#fbbf24' } : {}}>star</span>
                            </button>
                            <button onClick={() => navigate('/')} className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" title="Back to dashboard">
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center justify-center overflow-hidden rounded-lg h-10 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-wide min-w-0 px-4 hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                <span className="truncate">{saving ? 'Saving...' : 'Save'}</span>
                            </button>
                        </div>
                    </header>

                    {/* Text Field for Title */}
                    <div className="mb-4">
                        <label className="flex flex-col w-full">
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-50 focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white dark:bg-slate-900/50 h-16 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-4 text-3xl font-bold leading-tight"
                                placeholder="Enter note title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </label>
                    </div>

                    {/* Composer / Rich Text Editor */}
                    <div className="flex items-center gap-3 flex-1 min-h-0">
                        <label className="flex flex-col min-w-40 h-full flex-1">
                            <div className="flex w-full flex-1 items-stretch rounded-lg flex-col bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800">
                                    <button className="flex items-center justify-center p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-xl">format_bold</span>
                                    </button>
                                    <button className="flex items-center justify-center p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-xl">format_italic</span>
                                    </button>
                                    <button className="flex items-center justify-center p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-xl">format_underlined</span>
                                    </button>
                                    <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                    <button className="flex items-center justify-center p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-xl">format_list_bulleted</span>
                                    </button>
                                    <button className="flex items-center justify-center p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-xl">format_list_numbered</span>
                                    </button>
                                    <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                    <button className="flex items-center justify-center p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-xl">image</span>
                                    </button>
                                    <button className="flex items-center justify-center p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-xl">link</span>
                                    </button>
                                </div>
                                <div className="flex flex-1 flex-col">
                                    <textarea
                                        className="form-input flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-b-lg text-slate-800 dark:text-slate-200 focus:outline-0 focus:ring-0 border-none bg-transparent min-h-96 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-4 text-base font-normal leading-relaxed"
                                        placeholder="Start writing here..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Attachments Section */}
                    <div className="mt-8 mb-8">
                        <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight px-0 pb-3 pt-4">Attachments</h3>
                        <div className="flex flex-col gap-3">
                            {!isNew && (
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg cursor-pointer bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 mb-2">cloud_upload</span>
                                            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        </div>
                                        <input type="file" className="hidden" onChange={handleFileUpload} multiple />
                                    </label>
                                </div>
                            )}

                            {files.map(file => (
                                <div key={file.id} className="flex items-center p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                    <span className="material-symbols-outlined text-3xl text-primary mr-3">draft</span>
                                    <div className="flex-1">
                                        <a href={`/uploads/${file.filename}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:underline">
                                            {file.original_name}
                                        </a>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">128 KB</p>
                                    </div>
                                    <button onClick={() => handleDeleteFile(file.id)} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="Delete file">
                                        <span className="material-symbols-outlined text-xl">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Right Sidebar for Access Settings */}
            <aside className="w-80 h-screen border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shrink-0 overflow-y-auto sticky top-0">
                <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight mb-4">Access Settings</h3>
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer" onClick={() => setIsPublic(false)}>Private</label>
                            <input
                                type="radio"
                                name="access"
                                className="form-radio h-4 w-4 text-primary border-slate-300 dark:border-slate-600 focus:ring-primary bg-transparent cursor-pointer"
                                checked={!isPublic}
                                onChange={async (e) => {
                                    console.log('Private selected, setting isPublic to false');
                                    setIsPublic(false);
                                    // Автоматически сохраняем при изменении, если заметка уже создана
                                    if (!isNew && id) {
                                        try {
                                            console.log('Auto-saving with is_public: false');
                                            await axios.put(`/api/notes/${id}`, { title, content, is_public: false });
                                            await fetchNote();
                                        } catch (error) {
                                            console.error('Error auto-saving:', error);
                                        }
                                    }
                                }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Only you can see this note.</p>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer" onClick={() => setIsPublic(true)}>Public Link</label>
                            <input
                                type="radio"
                                name="access"
                                className="form-radio h-4 w-4 text-primary border-slate-300 dark:border-slate-600 focus:ring-primary bg-transparent cursor-pointer"
                                checked={isPublic}
                                onChange={async (e) => {
                                    console.log('Public selected, setting isPublic to true');
                                    setIsPublic(true);
                                    // Автоматически сохраняем при изменении, если заметка уже создана
                                    if (!isNew && id) {
                                        try {
                                            console.log('Auto-saving with is_public: true');
                                            await axios.put(`/api/notes/${id}`, { title, content, is_public: true });
                                            await fetchNote();
                                        } catch (error) {
                                            console.error('Error auto-saving:', error);
                                        }
                                    }
                                }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Anyone with the link can view.</p>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-300">Allow editing</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <button onClick={handleCopyLink} disabled={isNew || !isPublic} className="mt-4 flex w-full items-center justify-center text-sm font-medium h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <span className="material-symbols-outlined text-lg mr-2">link</span>
                            Copy Link
                        </button>
                    </div>
                </div>
                <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-6"></div>
                <div>
                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">Collaborators</h4>
                    {collaborators.length > 0 ? (
                        <div className="space-y-2 mb-4">
                            {collaborators.map(collab => (
                                <div key={collab.permission_id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                            {collab.username || collab.email}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{collab.email}</p>
                                        {collab.can_edit && (
                                            <span className="text-xs text-primary">Can edit</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRemoveCollaborator(collab.user_id)}
                                        className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        title="Remove collaborator"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">No collaborators yet</p>
                    )}
                </div>
                {showShareDialog && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">Invite Users</h4>
                        <div className="flex gap-2">
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-50 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-transparent h-10 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2 text-sm"
                                placeholder="Enter email"
                                type="email"
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                            />
                            <button
                                onClick={handleShare}
                                disabled={isNew}
                                className="flex items-center justify-center overflow-hidden rounded-lg h-10 bg-primary text-white text-sm font-bold min-w-0 px-4 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="truncate">Send</span>
                            </button>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setShowShareDialog(!showShareDialog)}
                    disabled={isNew}
                    className="mt-4 flex w-full items-center justify-center text-sm font-medium h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-lg mr-2">{showShareDialog ? 'close' : 'person_add'}</span>
                    {showShareDialog ? 'Cancel' : 'Invite Users'}
                </button>
            </aside>
        </div>
    );
};

export default NoteEditorPage;
