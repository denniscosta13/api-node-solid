import { FastifyRequest, FastifyReply } from "fastify"
import { z } from "zod"
import { makeCheckInUseCase } from "@/use-cases/factories/make-checkin-use-case"

export async function create(request: FastifyRequest, reply: FastifyReply)  {

    const createCheckInParamsSchema = z.object({
        gymId: z.string().uuid()
    })

    //cria o schema que irá validar o objeto recebido pela request
    const createCheckInBodySchema = z.object({
        userLatitude: z.number().refine(value => {
            return Math.abs(value) <= 90
        }),
        userLongitude: z.number().refine(value => {
            return Math.abs(value) <= 180
        }),
    })

    //parse valida o request.body se está de acordo com nosso schema
    //caso nao esteja de acordo, joga um erro e para a aplicação
    const { gymId } = createCheckInParamsSchema.parse(request.params)
    const { userLatitude, userLongitude } = createCheckInBodySchema.parse(request.body)

    
    const createGymUseCase = makeCheckInUseCase()

    await createGymUseCase.execute({ 
        userId: request.user.sub, 
        gymId, 
        userLatitude,
        userLongitude 
    })
    

    return reply.status(201).send()
}