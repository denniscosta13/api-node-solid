import { FastifyRequest, FastifyReply } from "fastify"
import { z } from "zod"
import { makeFetchCheckInHistoryUseCase } from "@/use-cases/factories/make-fetch-user-checkins-history-use-case"

export async function history(request: FastifyRequest, reply: FastifyReply)  {

    //cria o schema que irá validar o objeto recebido pela request
    const checkInHistoryQuerySchema = z.object({
        page: z.coerce.number().min(1).default(1)
    })

    //parse valida o request.body se está de acordo com nosso schema
    //caso nao esteja de acordo, joga um erro e para a aplicação
    const { page } = checkInHistoryQuerySchema.parse(request.query)

    
    const fetchCheckInHistoryUseCase = makeFetchCheckInHistoryUseCase()

    const { checkIns } = await fetchCheckInHistoryUseCase.execute({
        userId: request.user.sub,
        page,
    })
    

    return reply.status(200).send({
        checkIns 
    })
}