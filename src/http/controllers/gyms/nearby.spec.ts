import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { app } from "@/app"
import request from "supertest"
import { createAuthenticateUser } from "@/utils/tests/create-authenticate-user"

describe('Nearby Gyms (e2e)', () => {

    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('should be able to list nearby gyms', async () => {
        const { token } = await createAuthenticateUser(app)

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
                latitude: -27.2092052,
                longitude: -49.6401091, 
            })

        const response = await request(app.server)
            .get('/gyms/nearby')
            .query({
                latitude: -23.4578541,
                longitude: -53.3463416,
            })
            .set('Authorization', `Bearer ${token}`)
            .send()

        expect(response.statusCode).toEqual(200)
        expect(response.body.gyms).toHaveLength(1)
        expect(response.body.gyms).toEqual([
            expect.objectContaining({
                title: 'Minha academia',
            })
        ])
        
    })
})
