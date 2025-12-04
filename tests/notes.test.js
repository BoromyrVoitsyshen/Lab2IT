const request = require('supertest');

jest.mock('../server/src/config/database', () => {
  const mockDB = {
    execute: jest.fn().mockImplementation((sql, params) => {
      return Promise.resolve([
        [{ id: 1, title: 'Mock Note', content: 'Fake Content', user_id: 1 }]
      ]); 
    }),
    query: jest.fn().mockImplementation(() => {
      return Promise.resolve([ { insertId: 1, affectedRows: 1 } ]);
    }),
    end: jest.fn(),
  };
  return mockDB;
});

jest.mock('../server/src/middleware/authMiddleware', () => (req, res, next) => {
    req.user = { id: 1 };
    next();
});

const app = require('../server/src/app');

describe('CRUD Tests', () => {

    test('POST /api/notes', async () => {
        const res = await request(app)
            .post('/api/notes')
            .send({ title: "Test", content: "Content" });
        
        expect([200, 201]).toContain(res.statusCode);
    });

    test('GET /api/notes', async () => {
        const res = await request(app).get('/api/notes');
        
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    test('DELETE /api/notes/:id', async () => {
        const res = await request(app).delete('/api/notes/1');
        
        expect([200, 204]).toContain(res.statusCode);
    });
});