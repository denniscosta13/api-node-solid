import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { app } from "@/app"
import request from "supertest"
import { createAuthenticateUser } from "@/utils/tests/create-authenticate-user"

describe('Search Gyms (e2e)', () => {

    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('should be able to search gyms', async () => {
        const { token } = await createAuthenticateUser(app, true)

        await request(app.server)
            .post('/gyms')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Minha academia',
                description: 'Acadimia',
                phone:'12345678',
                latitude: -23.4578541,
                longitude: -53.3463416, 
            })
        
            await request(app.server)
            .post('/gyms')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'My academy',
                description: 'academi',
                phone:'12345678',
                latitude: -23.4578541,
                longitude: -53.3463416, 
            })

        const response = await request(app.server)
            .get('/gyms/search')
            .query({
                query: 'academy'
            })
            .set('Authorization', `Bearer ${token}`)
            .send()

        expect(response.statusCode).toEqual(200)
        expect(response.body.gyms).toHaveLength(1)
        expect(response.body.gyms).toEqual([
            expect.objectContaining({
                title: 'My academy',
            })
        ])
        
    })
})
