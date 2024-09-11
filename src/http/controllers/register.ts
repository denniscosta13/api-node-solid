import { FastifyRequest, FastifyReply } from "fastify"
import { z } from "zod"
import { registerUseCase } from "@/use-cases/register"

export async function register(request: FastifyRequest, reply: FastifyReply)  {

    //cria o schema que irá validar o objeto recebido pela request
    const registerBodySchema = z.object({
        name: z.string(),
        email: z.string(),
        password: z.string().min(6)
    })

    //parse valida o request.body se está de acordo com nosso schema
    //caso nao esteja de acordo, joga um erro e para a aplicação
    const { name, email, password } = registerBodySchema.parse(request.body)

    // bloco try catch é necessário já que o use-case pode lançar um erro
    // o controller tem a responsabilidade de lidar com esse erro e decidir o que fazer com a aplicação
    try {
        await registerUseCase( { name, email, password } )
    } catch {
        return reply.status(409).send()
    }

    return reply.status(201).send()
}