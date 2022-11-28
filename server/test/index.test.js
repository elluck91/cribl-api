// Path: server/src/test/index.test.js
const request = require('supertest');
const expect = require('chai').expect;
const app = require('../src/secondary');

// Test GET /lines endpoint
describe('GET /lines', () => {
    it('should return 400 if no filename is provided', async () => {
        const res = await request(app).get('/lines');
        expect(res.statusCode).equal(400);
    });

    it('should return 400 if an invalid filename is provided', async () => {
        const res = await request(app).get('/lines?filename=invalid');
        expect(res.statusCode).equal(400);
    });

    it('should return 400 if an invalid filter is provided', async () => {
        const res = await request(app).get('/lines?filename=access.log&filter="___/"');
        expect(res.statusCode).equal(400);
    });

    it('should return 400 if an invalid limit is provided', async () => {
        const res = await request(app).get('/lines?filename=access.log&limit=*');
        expect(res.statusCode).equal(400);

        const res2 = await request(app).get('/lines?filename=access.log&limit=0');

        expect(res2.statusCode).equal(400);
    });

    it('should return 200 if a valid filename is provided', async () => {
        const res = await request(app).get('/lines?filename=logs&limit=10&filter=localhost');
        expect(res.statusCode).equal(200);
    });


    it('should return 200 if a valid filename, filter, and limit are provided', async () => {
        const res = await request(app).get('/lines?filename=logs&filter=localhost&limit=10');
        expect(res.statusCode).equal(200);
    });

    // it('should return 500 if an error occurs', async () => {
    //     const res = await request(app).get('/lines?filename=no_access.log&filter=GET&limit=10');
    //     expect(res.statusCode).equal(500);
    // });

    it('should return the correct number of lines', async () => {
        const res = await request(app).get('/lines?filename=logs&limit=10&filter=localhost');
        expect(res.body.length).equal(10);
    });

    // it('should return the correct number of lines when a filter is provided', async () => {

    //     const res = await request(app).get('/lines?filename=access.log&filter=GET&limit=10');
    //     expect(res.body.length).equal(10);
    // });

});
