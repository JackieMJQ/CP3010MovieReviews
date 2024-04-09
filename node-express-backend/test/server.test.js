import app from '../src/server.js'; // Assuming your app file is named server.js
import request from 'supertest';
import assert from 'assert';

describe('Movies API', () => {
    describe('/GET movies', () => {
        it('it should GET all the movies', (done) => {
            request(app)
                .get('/api/movies')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    assert.strictEqual(res.statusCode, 200);
                    done();
                });
        });
    });
});

// Use 'npm test' without running backend server.