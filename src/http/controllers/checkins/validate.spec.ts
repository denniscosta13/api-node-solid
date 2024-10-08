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
        const { token } = await createAuthenticateUser(app, true)
        const user = await prisma.user.findFirstOrThrow()

        const gym = await prisma.gym.create({
            data: {
                title: 'Minha academia',
                description: 'Acadimia',
                phone:'12345678',
                latitude: -23.4578541,
                longitude: -53.3463416, 
            }
        })
            
        let checkIn = await prisma.checkIn.create({
            data: {
                    gym_id: gym.id,
                    user_id: user.id
            }
        })

        const response = await request(app.server)
            .patch(`/check-ins/${checkIn.id}/validate`)
            .set('Authorization', `Bearer ${token}`)
            .send()
        
        expect(response.statusCode).toEqual(204)
        
        checkIn = await prisma.checkIn.findUniqueOrThrow({
            where: {
                id: checkIn.id
            }
        })

        expect(checkIn.validated_at).toEqual(expect.any(Date))
    })
})
