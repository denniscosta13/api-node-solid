import { FastifyInstance } from "fastify"
import { verifyJwt } from "@/http/middlewares/verify-jwt"
import { create } from "./create"
import { validate } from "./validate"
import { history } from "./history"
import { metrics } from "./metrics"
import { verifyUserRole } from "@/http/middlewares/verify-user-role"


//função ou plugin (fastify) que contem nossas rotas da aplicacao
export async function  checkInsRoutes(app:FastifyInstance) {
    // todas as rotas vao aplicar o verifyJwt
    app.addHook('onRequest', verifyJwt) 

    app.post('/gyms/:gymId/check-ins', create)
    app.patch('/check-ins/:checkInId/validate',  { onRequest: [verifyUserRole('ADMIN')] }, validate)
    app.get('/check-ins/history', history)
    app.get('/check-ins/metrics', metrics)
}