import request from 'supertest'
import { FastifyInstance } from "fastify"

export async function createAuthenticateUser(app: FastifyInstance) {
    await request(app.server)
            .post('/users')
            .send({
                name: 'Tester e2e',
                email: 'testere2e@test.com',
                password: '123456'
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