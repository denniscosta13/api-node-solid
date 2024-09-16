import { FastifyRequest, FastifyReply } from "fastify"
import { z } from "zod"
import { makeFetchNearbyGymsUseCase } from "@/use-cases/factories/make-fetch-nearby-gyms-use-case"

export async function nearby(request: FastifyRequest, reply: FastifyReply)  {

    //cria o schema que irá validar o objeto recebido pela request
    const nearbyGymsBodySchema = z.object({
        latitude: z.number().refine(value => {
            return Math.abs(value) <= 90
        }),
        longitude: z.number().refine(value => {
            return Math.abs(value) <= 180
        }),
    })

    //parse valida o request.body se está de acordo com nosso schema
    //caso nao esteja de acordo, joga um erro e para a aplicação
    const { latitude, longitude } = nearbyGymsBodySchema.parse(request.query)

    
    const fetchNearbyGymsUseCase = makeFetchNearbyGymsUseCase()

    const { gyms } = await fetchNearbyGymsUseCase.execute({
        userLatitude: latitude,
        userLongitude: longitude,
    })
    

    return reply.status(200).send({
        gyms 
    })
}