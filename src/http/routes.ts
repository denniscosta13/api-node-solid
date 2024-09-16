import { FastifyInstance } from "fastify"
import { register } from "./controllers/register-controller" // importa o controller responsavel por lidar com a rota
import { authenticate } from "./controllers/authenticate-controller"
import { profile } from "./controllers/profile-controller"
import { verifyJwt } from "./middlewares/verify-jwt"

//função ou plugin (fastify) que contem nossas rotas da aplicacao
export async function  appRoutes(app:FastifyInstance) {
    app.post('/users', register) //define cada rota e seu controller
    app.post('/sessions', authenticate)

    /** Authenticated routes */
    app.get('/me', { onRequest: [verifyJwt] }, profile)
}