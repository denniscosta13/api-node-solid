import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { app } from "@/app"
import request from "supertest"
import { createAuthenticateUser } from "@/utils/tests/create-authenticate-user"

describe('Create Gym (e2e)', () => {

    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('should be able to create gym', async () => {
        const { token } = await createAuthenticateUser(app, true)

        const response = await request(app.server)
            .post('/gyms')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Minha academia',
                description: 'Acadimia',
                phone:'12345678',
                latitude: -23.4578541,
                longitude: -53.3463416, 
            })
            

        expect(response.statusCode).toEqual(201)
        
    })
})
