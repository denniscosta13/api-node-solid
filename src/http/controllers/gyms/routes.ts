import { FastifyInstance } from "fastify"
import { verifyJwt } from "@/http/middlewares/verify-jwt"


//função ou plugin (fastify) que contem nossas rotas da aplicacao
export async function  gymsRoutes(app:FastifyInstance) {
    // todas as rotas vao aplicar o verifyJwt
    app.addHook('onRequest', verifyJwt) 

    
}