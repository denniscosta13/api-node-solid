import { FastifyRequest, FastifyReply } from "fastify"
import { z } from "zod"
import { makeCheckInUseCase } from "@/use-cases/factories/make-checkin-use-case"
import { makeValidateCheckInUseCase } from "@/use-cases/factories/make-validate-checkin-use-case"

export async function validate(request: FastifyRequest, reply: FastifyReply)  {

    const validateCheckInParamsSchema = z.object({
        checkInId: z.string().uuid()
    })

    

    //parse valida o request.body se está de acordo com nosso schema
    //caso nao esteja de acordo, joga um erro e para a aplicação
    const { checkInId } = validateCheckInParamsSchema.parse(request.params)

    
    const validateGymUseCase = makeValidateCheckInUseCase()

    await validateGymUseCase.execute({ 
        checkInId,
    })
    

    return reply.status(204).send()
}