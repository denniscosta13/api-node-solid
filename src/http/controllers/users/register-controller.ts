import { FastifyRequest, FastifyReply } from "fastify"
import { z } from "zod"
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists-error"
import { makeRegisterUseCase } from "@/use-cases/factories/make-register-use-case"

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
        const registerUseCase = makeRegisterUseCase()

        await registerUseCase.execute( { name, email, password } )
    } catch (err) {

        //criamos uma classe de erro personalizada para tratar melhor os erros e a resposta que retornamos
        //se for um erro do tipo UserAlreadyExistsError (usuário ja existente com esse email)
        //retornamos um status 409 e a mensagem de erro, caso contrário, por enquanto retornamos status 500
        if(err instanceof UserAlreadyExistsError) {
            return reply.status(409).send({ message: err.message })
        }

        throw err   
    }

    return reply.status(201).send()
}