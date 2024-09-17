import fastify from 'fastify'
import { usersRoutes } from './http/controllers/users/routes' // importa a funcao appRoutes, plugin do fastify
import { gymsRoutes } from './http/controllers/gyms/routes'
import { ZodError } from 'zod'
import { env } from './env'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import { checkInsRoutes } from './http/controllers/checkins/routes'

export const app = fastify()

//antes das rotas, registramos o jwt do fastify passando o secret(palavra-chave) que servira para
//assinatura do nosso token
//esse token nós podemos salvar no .env e utilizar qualquer um para desenvolvimento
app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: {
        cookieName: 'refreshToken',
        signed: false,
    },
    sign: {
        expiresIn: '10m'
    }
})

app.register(fastifyCookie)

//registra o plugin contendo as rotas da nossa aplicacao
//por meio desse registro, nosso server ganha acesso as rotas definadas em routes.ts
app.register(usersRoutes)
app.register(gymsRoutes)
app.register(checkInsRoutes)

//o fastify tem uma função para tratar erros
//ela consegue capturar o erro, request e reply
//por enquanto, caso seja um erro de validação do Zod, essa função vai tratar o erro
app.setErrorHandler((error, _request, reply) => {
    if(error instanceof ZodError) {
        return reply
            .status(400)
            //issues e error.format() fazem parte da classe ZodError
            //format deixa  a mensagem de erro mais legível
            .send({ message: 'Validation error.', issues: error.format() })
    }

    //caso seja um ambiente diferente de producao, o erro vai ser mostrado no console com todo seu stack trace
    if(env.NODE_ENV !== 'production') {
        console.error(error)
    } else {
        //TODO: Aqui podemos enviar o log de erro para uma ferramenta externa como DataDog, NewRelic, Sentry
    }

    return reply.status(500).send({ message: 'Internal Server Error' })
})