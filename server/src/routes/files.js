const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const authenticateToken = require('../middleware/authMiddleware');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload file
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { noteId } = req.body;
    if (!noteId) {
        return res.status(400).json({ message: 'Note ID is required' });
    }

    try {
        // Verify permission to edit note
        const [notes] = await db.execute('SELECT * FROM notes WHERE id = ?', [noteId]);
        if (notes.length === 0) return res.status(404).json({ message: 'Note not found' });

        const note = notes[0];
        let canEdit = note.user_id === req.user.id;

        if (!canEdit) {
            // Check edit permission
            const [perms] = await db.execute(
                'SELECT can_edit FROM permissions WHERE note_id = ? AND user_id = ?',
                [noteId, req.user.id]
            );
            if (perms.length > 0 && perms[0].can_edit) canEdit = true;
        }

        if (!canEdit) return res.status(403).json({ message: 'Access denied' });

        await db.execute(
            'INSERT INTO files (note_id, filename, path, original_name) VALUES (?, ?, ?, ?)',
            [noteId, req.file.filename, req.file.path, req.file.originalname]
        );

        res.json({ message: 'File uploaded successfully', file: req.file });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get files for a note - Protected endpoint (for authenticated users)
router.get('/note/:noteId', authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    try {
        // Check if user has access to the note
        const [notes] = await db.execute('SELECT * FROM notes WHERE id = ? AND deleted_at IS NULL', [noteId]);
        if (notes.length === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }

        const note = notes[0];
        
        // Check if user owns the note or has permission
        if (note.user_id !== req.user.id) {
            // Check permissions
            const [perms] = await db.execute(
                'SELECT * FROM permissions WHERE note_id = ? AND user_id = ?',
                [noteId, req.user.id]
            );
            if (perms.length === 0 && !note.is_public) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const [files] = await db.execute('SELECT * FROM files WHERE note_id = ?', [noteId]);
        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get files for a note - Public endpoint (for public notes)
router.get('/note/:noteId/public', async (req, res) => {
    const noteId = req.params.noteId;
    try {
        // Check if note is public
        const [notes] = await db.execute('SELECT is_public FROM notes WHERE id = ? AND deleted_at IS NULL', [noteId]);
        if (notes.length === 0 || !notes[0].is_public) {
            return res.status(404).json({ message: 'Note not found or not public' });
        }

        const [files] = await db.execute('SELECT * FROM files WHERE note_id = ?', [noteId]);
        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a file
router.delete('/:id', authenticateToken, async (req, res) => {
    const fileId = req.params.id;
    const fs = require('fs');

    try {
        // Get file info and verify ownership through note
        const [files] = await db.execute(
            `SELECT f.*, n.user_id 
             FROM files f 
             JOIN notes n ON f.note_id = n.id 
             WHERE f.id = ?`,
            [fileId]
        );

        if (files.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = files[0];

        // Check if user owns the note
        if (file.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete from database
        await db.execute('DELETE FROM files WHERE id = ?', [fileId]);

        // Delete physical file
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
