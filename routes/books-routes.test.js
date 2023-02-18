process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require("../db");

const app = require("../app");

afterAll(async () => {
    await db.query(`
        UPDATE books SET
        amazon_url='http://a.co/eobPtX2',
        author='Matthew Lane',
        language='english',
        pages=264,
        publisher='Princeton University Press',
        title='Power-Up: Unlocking the Hidden Mathematics in Video Games',
        year=2017
        WHERE isbn='0691161518'
    `);
    await db.query(`
        DELETE FROM books
        WHERE isbn = '90210';
    `);
    
    db.end();
})

describe("GET /books/:id", () => {
    test("Get a single book", async () => {
        const resp = await request(app).get(`/books/0691161518`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual(
            {
                "book": {
                    "isbn": "0691161518",
                    "amazon_url": "http://a.co/eobPtX2",
                    "author": "Matthew Lane",
                    "language": "english",
                    "pages": 264,
                    "publisher": "Princeton University Press",
                    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    "year": 2017
                }
            }
        );
    });
    test("Get a single book, invalid id", async() => {
        const resp = await request(app).get(`/books/1234`);
        expect(resp.statusCode).toBe(404);
    });
});

describe("POST /books", () => {
    test("Add a book", async () => {
        const newBook = {
            "isbn": "90210",
            "amazon_url": "http://a.co/congo",
            "author": "William Shartzen",
            "language": "english",
            "pages": 74,
            "publisher": "Giraffe Publishing",
            "title": "Capitalism is Efficient and Other Hilarious Lies",
            "year": 2009
        }
        const resp = await request(app).post("/books").send(newBook);
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({"book": newBook});
    });
});

describe("PUT /books/:isbn", () => {
    test("Update a book", async () => {
        const newBook = {
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017,
            "isbn": "0691161518"
        }
        const resp = await request(app).put("/books/0691161518").send(newBook);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({"book": newBook});
    });
});

describe("DELETE /:isbn", () => {
    test("Delete a book", async () => {
        // Using the book from the POST test above
        const resp = await request(app).delete("/books/90210");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({message: "Book deleted"});

        const resp2 = await request(app).get("/books/90210");
        expect(resp2.statusCode).toBe(404);
    });
});