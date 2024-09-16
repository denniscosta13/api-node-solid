import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { app } from "@/app"
import request from "supertest"
import { createAuthenticateUser } from "@/utils/tests/create-authenticate-user"
import { prisma } from "@/lib/prisma"

describe('Create Check In (e2e)', () => {

    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('should be able to create check in', async () => {
        const { token } = await createAuthenticateUser(app)

        const gym = await prisma.gym.create({
            data: {
                title: 'Minha academia',
                description: 'Acadimia',
                phone:'12345678',
                latitude: -23.4578541,
                longitude: -53.3463416, 
            }
        })
            
        const response = await request(app.server)
            .post(`/gyms/${gym.id}/check-ins`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                latitude: -23.4578541,
                longitude: -53.3463416, 
            })
        
        expect(response.statusCode).toEqual(201)
        
    })
})
