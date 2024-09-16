import "@fastify/jwt"

//define tipagem da request associada ao jwt
//a partir dessa config, ele entender que sub faz parte de user na request enviada

declare module "@fastify/jwt" {
    export interface FastifyJWT {
      user: {
        sub: string
      }
    }
  }