const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

// Get all notes (with filters) - Protected
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { filter } = req.query;
        let query = 'SELECT * FROM notes WHERE ';
        const params = [req.user.id];

        if (filter === 'trash') {
            query += 'user_id = ? AND deleted_at IS NOT NULL';
        } else if (filter === 'favorites') {
            query += 'user_id = ? AND is_favorite = TRUE AND deleted_at IS NULL';
        } else if (filter === 'shared') {
            // Complex query for shared notes
            query = `
                SELECT n.*, u.username as owner_name 
                FROM notes n 
                JOIN permissions p ON n.id = p.note_id 
                JOIN users u ON n.user_id = u.id
                WHERE p.user_id = ? AND n.deleted_at IS NULL
            `;
        } else {
            // Default: My notes (not deleted)
            query += 'user_id = ? AND deleted_at IS NULL';
        }

        query += ' ORDER BY updated_at DESC';

        const [rows] = await pool.execute(query, params);
        // Normalize boolean values for all notes
        const normalizedRows = rows.map(note => ({
            ...note,
            is_public: Boolean(note.is_public === 1 || note.is_public === true),
            is_favorite: Boolean(note.is_favorite === 1 || note.is_favorite === true)
        }));
        res.json(normalizedRows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single note - Protected
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM notes WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }

        const note = rows[0];

        // Check access
        if (note.user_id !== req.user.id && !note.is_public) {
            // Check permissions
            const [perms] = await pool.execute(
                'SELECT * FROM permissions WHERE note_id = ? AND user_id = ?',
                [note.id, req.user.id]
            );
            if (perms.length === 0) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        // Normalize boolean values (MySQL returns 0/1, convert to true/false)
        const normalizedNote = {
            ...note,
            is_public: Boolean(note.is_public === 1 || note.is_public === true),
            is_favorite: Boolean(note.is_favorite === 1 || note.is_favorite === true)
        };

        res.json(normalizedNote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get public note - No authentication required
router.get('/public/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM notes WHERE id = ? AND is_public = TRUE AND deleted_at IS NULL',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Note not found or not public' });
        }

        // Normalize boolean values
        const normalizedNote = {
            ...rows[0],
            is_public: Boolean(rows[0].is_public === 1 || rows[0].is_public === true),
            is_favorite: Boolean(rows[0].is_favorite === 1 || rows[0].is_favorite === true)
        };

        res.json(normalizedNote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create note - Protected
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, content, is_public } = req.body;
        // Ensure is_public is a boolean (convert to 0/1 for MySQL)
        const isPublicValue = is_public === true || is_public === 'true' || is_public === 1 ? 1 : 0;
        const [result] = await pool.execute(
            'INSERT INTO notes (user_id, title, content, is_public) VALUES (?, ?, ?, ?)',
            [req.user.id, title, content, isPublicValue]
        );
        res.status(201).json({ id: result.insertId, title, content, is_public: Boolean(isPublicValue) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update note - Protected
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, content, is_public } = req.body;
        
        console.log('Update note request:', { id: req.params.id, title, content, is_public, type: typeof is_public });

        // Check ownership or edit permission
        const [notes] = await pool.execute('SELECT * FROM notes WHERE id = ?', [req.params.id]);
        if (notes.length === 0) return res.status(404).json({ message: 'Note not found' });

        const note = notes[0];
        let canEdit = note.user_id === req.user.id;

        if (!canEdit) {
            const [perms] = await pool.execute(
                'SELECT can_edit FROM permissions WHERE note_id = ? AND user_id = ?',
                [req.params.id, req.user.id]
            );
            if (perms.length > 0 && perms[0].can_edit) canEdit = true;
        }

        if (!canEdit) return res.status(403).json({ message: 'Access denied' });

        // Ensure is_public is a boolean (convert to 0/1 for MySQL)
        const isPublicValue = is_public === true || is_public === 'true' || is_public === 1 || is_public === '1' ? 1 : 0;
        console.log('Converted is_public to:', isPublicValue);

        await pool.execute(
            'UPDATE notes SET title = ?, content = ?, is_public = ? WHERE id = ?',
            [title, content, isPublicValue, req.params.id]
        );
        
        // Return updated note with normalized boolean values
        const [updated] = await pool.execute('SELECT * FROM notes WHERE id = ?', [req.params.id]);
        console.log('Updated note from DB:', updated[0]);
        const normalizedNote = {
            ...updated[0],
            is_public: Boolean(updated[0].is_public === 1 || updated[0].is_public === true),
            is_favorite: Boolean(updated[0].is_favorite === 1 || updated[0].is_favorite === true)
        };
        console.log('Normalized note:', normalizedNote);
        res.json({ message: 'Note updated', note: normalizedNote });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ message: error.message });
    }
});

// Soft Delete (Move to Trash) - Protected
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const [result] = await pool.execute(
            'UPDATE notes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note moved to trash' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Restore from Trash - Protected
router.put('/:id/restore', authMiddleware, async (req, res) => {
    try {
        const [result] = await pool.execute(
            'UPDATE notes SET deleted_at = NULL WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note restored' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Toggle Favorite - Protected
router.put('/:id/favorite', authMiddleware, async (req, res) => {
    try {
        // First get current status
        const [rows] = await pool.execute('SELECT is_favorite FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Note not found' });

        const newStatus = !rows[0].is_favorite;
        await pool.execute(
            'UPDATE notes SET is_favorite = ? WHERE id = ?',
            [newStatus, req.params.id]
        );
        res.json({ message: 'Favorite status updated', is_favorite: newStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Permanent Delete - Protected
router.delete('/:id/permanent', authMiddleware, async (req, res) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM notes WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get collaborators for a note - Protected
router.get('/:id/collaborators', authMiddleware, async (req, res) => {
    try {
        // Verify ownership
        const [notes] = await pool.execute('SELECT * FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (notes.length === 0) return res.status(403).json({ message: 'Access denied' });

        // Get all collaborators with their details
        const [collaborators] = await pool.execute(
            `SELECT p.id as permission_id, p.user_id, p.can_edit, u.email, u.username 
             FROM permissions p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.note_id = ?`,
            [req.params.id]
        );

        res.json(collaborators);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove collaborator from note - Protected
router.delete('/:id/collaborators/:userId', authMiddleware, async (req, res) => {
    try {
        // Verify ownership
        const [notes] = await pool.execute('SELECT * FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (notes.length === 0) return res.status(403).json({ message: 'Only note owner can remove collaborators' });

        // Remove permission
        const [result] = await pool.execute(
            'DELETE FROM permissions WHERE note_id = ? AND user_id = ?',
            [req.params.id, req.params.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Collaborator not found' });
        }

        res.json({ message: 'Collaborator removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Share note - Protected
router.post('/:id/share', authMiddleware, async (req, res) => {
    try {
        const { targetEmail, canEdit } = req.body;

        // Verify ownership
        const [notes] = await pool.execute('SELECT * FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (notes.length === 0) return res.status(403).json({ message: 'Access denied' });

        // Find target user
        const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [targetEmail]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const targetUserId = users[0].id;

        await pool.execute(
            'INSERT INTO permissions (note_id, user_id, can_edit) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE can_edit = ?',
            [req.params.id, targetUserId, canEdit, canEdit]
        );

        res.json({ message: 'Note shared successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
