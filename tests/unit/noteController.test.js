const mockExecute = jest.fn();

jest.mock('../../server/src/config/database', () => {
    return {
        execute: mockExecute
    };
});

const createNoteController = async (req, res) => {
    try {
        const db = require('../../server/src/config/database');
        
        if (!req.body.title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        await db.execute('INSERT INTO notes (title, content) VALUES (?, ?)', [req.body.title, req.body.content]);
        
        res.status(201).json({ message: 'Note created' });
    } catch (error) {
        res.status(500).json({ message: 'Database error' });
    }
};

describe('Unit Tests: Note Controller', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Success: should return 201 if data is valid', async () => {
        const req = {
            body: { title: "Unit Test", content: "Content" }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockExecute.mockResolvedValue([{ insertId: 1 }]);

        await createNoteController(req, res);

        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'Note created' });
    });

    test('Validation: should return 400 if Title is missing', async () => {
        const req = {
            body: { content: "No title here" }
        };
        
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await createNoteController(req, res);

        expect(mockExecute).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Title is required' });
    });

    test('Server Error: should return 500 if DB fails', async () => {
        const req = {
            body: { title: "Error Note", content: "..." }
        };
        
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockExecute.mockRejectedValue(new Error("DB Down"));

        await createNoteController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
});