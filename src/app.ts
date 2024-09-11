import fastify from 'fastify'
import { appRoutes } from './http/routes' // importa a funcao appRoutes, plugin do fastify
import { ZodError } from 'zod'
import { env } from './env'

export const app = fastify()

//registra o plugin contendo as rotas da nossa aplicacao
//por meio desse registro, nosso server ganha acesso as rotas definadas em routes.ts
app.register(appRoutes) 

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