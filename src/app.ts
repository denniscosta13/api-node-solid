import fastify from 'fastify'
import { appRoutes } from './http/routes' // importa a funcao appRoutes, plugin do fastify

export const app = fastify()

//registra o plugin contendo as rotas da nossa aplicacao
//por meio desse registro, nosso server ganha acesso as rotas definadas em routes.ts
app.register(appRoutes) 
