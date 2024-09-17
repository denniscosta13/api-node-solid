import request from 'supertest'
import { FastifyInstance } from "fastify"
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function createAuthenticateUser(app: FastifyInstance, isAdmin = false) {
    await prisma.user.create({
        data: {
            name: 'Tester e2e',
            email: 'testere2e@test.com',
            password_hash: await hash('123456', 6),
            role: isAdmin ? 'ADMIN' : 'MEMBER'
        }
    })
        
        const authResponse = await request(app.server)
            .post('/sessions')
            .send({
                email: 'testere2e@test.com',
                password: '123456'
            })

        const { token } = authResponse.body

        return {
            token,
        }
}