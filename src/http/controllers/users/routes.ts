import { FastifyInstance } from "fastify"
import { register } from "./register-controller" // importa o controller responsavel por lidar com a rota
import { authenticate } from "./authenticate-controller"
import { profile } from "./profile-controller"
import { verifyJwt } from "@/http/middlewares/verify-jwt"


//função ou plugin (fastify) que contem nossas rotas da aplicacao
export async function  usersRoutes(app:FastifyInstance) {
    app.post('/users', register) //define cada rota e seu controller
    app.post('/sessions', authenticate)

    /** Authenticated routes */
    app.get('/me', { onRequest: [verifyJwt] }, profile)
}