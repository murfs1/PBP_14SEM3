const request = require('supertest');
const app = require('../index');
const conn = require('../config/connection');

describe('siswaController', () => {
    describe('GET /siswa', () => {
        test('should get list of siswa', async () => {
            const response = await request(app).get('/siswa');
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('status', true);
        });
    });
});

describe('POST /siswa', () => {
    test('should insert new siswa', async () => {
        const response = await request(app)
            .post('/siswa')
            .query({
                nama: 'Andri',
                umur: 20,
                alamat: 'Jl. Cibolang'
            });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('status', true);
    });
});

describe('Update Endpoint', () => {
    let insertedId;

    beforeAll(async () => {
        const insertQuery = 
            `INSERT INTO tbl_siswa (nama, umur, alamat) VALUES ('Samsul', 30, 'Solo')`;
        const insertResult = await new Promise((resolve) => {
            conn.query(insertQuery, (err, result) => {
                if (err) {
                    console.log('Insert Error', err);
                }
                resolve(result );
            });
        });

        insertedId = insertResult.insertId;
    });

    afterAll(async () => {
        const deleteQuery = `DELETE FROM tbl_siswa WHERE id = ${insertedId}`;
        await new Promise((resolve) => {
            conn.query(deleteQuery, () => {
                resolve();
            });
        });
    });

    it('should update a student', async () => {
        const updateData = {
            nama: 'Alun',
            umur: 20,
            alamat: 'Malang'
        };
        
        const response = await request(app)
            .put(`/siswa/${insertedId}`)
            .send(updateData);
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('status', true);
        expect(response.body).toHaveProperty('msg', 'Successfull Updated');

        const selectQuery = `SELECT * FROM tbl_siswa WHERE id = ${insertedId}`;
        const selectResult = await new Promise((resolve) => {
            conn.query(selectQuery, (err, result) => {
                resolve(result);
            });
        });

        expect(selectResult.length).toBe(1);
        expect(Array.isArray(selectResult)).toBe(true);
        expect(selectResult.length).toBeGreaterThan(0);
        expect(selectResult[0].nama == updateData.nama);
        expect(selectResult[0].umur == updateData.umur);
        expect(selectResult[0].alamat == updateData.alamat);
    });
});

describe('siswaController - Delete', () => {
    let insertedId;

    beforeAll(async () => {
        const insertQuery =
            `INSERT INTO tbl_siswa (nama, umur, alamat) VALUES ('Test', 25, 'Jl. Test')`;
        const insertResult = await new Promise((resolve) => {
            conn.query(insertQuery, (err, result) => {
                if (err) {
                    console.error('Insert Error :', err);
                }
                insertedId = result.insertId;
                resolve();
            });
        });
    });

    it('should delete a student' , async () => {
        const response = await request(app).delete(`/siswa/${insertedId}`);

        if (response.body.status) {
            expect(response.body).toHaveProperty('status', true);
            expect(response.body).toHaveProperty('msg', 'Delete Successfull');
        } else {
            expect(response.body).toHaveProperty('status', false);
            expect(response.body).toHaveProperty('msg', 'Delete Failed');
        }

        const selectQuery = `SELECT * FROM tbl_siswa WHERE id = ${insertedId}`;
        const selectResult = await new Promise((resolve) => {
            conn.query(selectQuery, (err, result) => {
                resolve(result);
            });
        });
        expect(selectResult.length).toBe(0);
    });
    afterAll(() => {
        conn.end();
    });
});




