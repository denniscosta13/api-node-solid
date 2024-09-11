import { FastifyInstance } from "fastify"
import { register } from "./controllers/register" // importa o controller responsavel por lidar com a rota

//função ou plugin (fastify) que contem nossas rotas da aplicacao
export async function  appRoutes(app:FastifyInstance) {
    app.post('/users', register) //define cada rota e seu controller
}