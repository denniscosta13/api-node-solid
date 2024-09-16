import { FastifyRequest, FastifyReply } from "fastify"
import { z } from "zod"
import { makeSearchGymsUseCase } from "@/use-cases/factories/make-search-gym-use-case"

export async function search(request: FastifyRequest, reply: FastifyReply)  {

    //cria o schema que irá validar o objeto recebido pela request
    const searchGymBodySchema = z.object({
        query: z.string(),
        page: z.coerce.number().min(1).default(1)
    })

    //parse valida o request.body se está de acordo com nosso schema
    //caso nao esteja de acordo, joga um erro e para a aplicação
    const { query, page } = searchGymBodySchema.parse(request.body)

    
    const createGymUseCase = makeSearchGymsUseCase()

    const { gyms } = await createGymUseCase.execute( { query, page } )
    

    return reply.status(200).send({
        gyms 
    })
}