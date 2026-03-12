// src/index.test.ts
import { describe, it, expect } from 'bun:test';
import { testClient } from 'hono/testing'
import app from './index';

describe('getting started', () => {
    it('GET /', async () => {
        const res = await app.request('/', { method: 'GET' });
        expect(res.status).toBe(200);
    });
});

describe('verify HTML as Text', async () => {
    const client: any = testClient(app)
    it("should return HTML content with 'Hello Hono!'", async () => {
        const res = await client.$get({})
        expect(res.status).toBe(200)
        const text = await res.text()
        //console.log(text)
        expect(text).toContain('Hello htmx!')
    })
})

describe('verify HTML as DOM', async () => {
    const client: any = testClient(app)
    it("should return HTML content with 'Hello Hono!'", async () => {
        const res = await client.$get({})
        expect(res.status).toBe(200)
        const text = await res.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/html')
        const pre = doc.querySelector('p')
        expect(pre?.textContent).toContain('Hello htmx!')
    })
})
