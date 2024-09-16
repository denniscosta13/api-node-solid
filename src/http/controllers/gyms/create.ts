import { FastifyRequest, FastifyReply } from "fastify"
import { z } from "zod"
import { makeGymUseCase } from "@/use-cases/factories/make-gym-use-case"

export async function create(request: FastifyRequest, reply: FastifyReply)  {

    //cria o schema que irá validar o objeto recebido pela request
    const createGymBodySchema = z.object({
        title: z.string(),
        description: z.string().nullable(),
        phone: z.string().nullable(),
        latitude: z.coerce.number().refine(value => {
            return Math.abs(value) <= 90
        }),
        longitude: z.coerce.number().refine(value => {
            return Math.abs(value) <= 180
        }),
    })

    //parse valida o request.body se está de acordo com nosso schema
    //caso nao esteja de acordo, joga um erro e para a aplicação
    const { title, description, phone, latitude, longitude } = createGymBodySchema.parse(request.body)

    
    const createGymUseCase = makeGymUseCase()

    await createGymUseCase.execute( { title, description, phone, latitude, longitude } )
    

    return reply.status(201).send()
}