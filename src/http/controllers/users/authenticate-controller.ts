import { FastifyRequest, FastifyReply } from "fastify"
import { z } from "zod"
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials-error"
import { makeAuthenticateUseCase } from "@/use-cases/factories/make-authenticate-use-case"

export async function authenticate(request: FastifyRequest, reply: FastifyReply)  {

    //cria o schema que irá validar o objeto recebido pela request
    const authenticateBodySchema = z.object({
        email: z.string(),
        password: z.string().min(6)
    })

    //parse valida o request.body se está de acordo com nosso schema
    //caso nao esteja de acordo, joga um erro e para a aplicação
    const { email, password } = authenticateBodySchema.parse(request.body)

    // bloco try catch é necessário já que o use-case pode lançar um erro
    // o controller tem a responsabilidade de lidar com esse erro e decidir o que fazer com a aplicação
    try {
        const authenticateUseCase = makeAuthenticateUseCase()

        const { user } = await authenticateUseCase.execute( { email, password } )

        const token = await reply.jwtSign(
            {
                role: user.role
            }, 
            {
            sign: {
                sub: user.id
            }
        })

        const refreshToken = await reply.jwtSign(
            {
                role: user.role
            }, 
            {
            sign: {
                sub: user.id,
                expiresIn: '7d'
            }
        })

        return reply
            .setCookie('refreshToken', refreshToken, {
                path: '/',
                secure: true,
                sameSite: true,
                httpOnly: true,
            })
            .status(200)
            .send({
                token
            })

    } catch (err) {

        //criamos uma classe de erro personalizada para tratar melhor os erros e a resposta que retornamos
        //se for um erro do tipo InvalidCredentialsError (usuário com senha ou email errado)
        //retornamos um status 401 e a mensagem de erro, caso contrário, por enquanto retornamos status 500
        if(err instanceof InvalidCredentialsError) {
            return reply.status(400).send({ message: err.message })
        }

        throw err   
    }
}