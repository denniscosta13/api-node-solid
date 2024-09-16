import { FastifyInstance } from "fastify"
import { verifyJwt } from "@/http/middlewares/verify-jwt"
import { search } from "./search"
import { nearby } from "./nearby"
import { create } from "./create"


//função ou plugin (fastify) que contem nossas rotas da aplicacao
export async function  gymsRoutes(app:FastifyInstance) {
    // todas as rotas vao aplicar o verifyJwt
    app.addHook('onRequest', verifyJwt) 

    app.get('/gyms/search', search)
    app.get('/gyms/nearby', nearby)
    app.post('/gyms', create)
    
}