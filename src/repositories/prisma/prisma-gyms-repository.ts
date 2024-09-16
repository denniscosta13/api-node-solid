import { Gym, Prisma } from "@prisma/client";
import { FindManyNearbyParams, GymsRepository } from "../interface-gyms-repository";
import { prisma } from "@/lib/prisma";

export class PrismaGymsRepository implements GymsRepository {
    async create(data: Prisma.GymCreateInput) {
        const gym = await prisma.gym.create({
            data
        })
        return gym
    }

    async findById(id: string) {
        const gym = await prisma.gym.findUnique({
            where: {
                id,
            },
        })
        return gym
    }

    async searchManyGyms(query: string, page: number) {
        const gyms = await prisma.gym.findMany({
            where: {
                title: {
                    contains: query
                }
            },
            take: 20,
            skip: (page - 1) * 20
        })

        return gyms
    }

    async findManyNearby(params: FindManyNearbyParams) {
        const gyms = await prisma.$queryRaw<Gym[]>`
            SELECT 
                * 
            FROM gyms
            WHERE (
                6371 
                    * acos( 
                        cos( radians(${params.latitude})) 
                        * cos(radians(latitude)) 
                        * cos(radians(longitude) - radians(${params.longitude}) ) 
                        + sin(radians(${params.latitude})) 
                        * sin(radians(latitude)) 
                    )
                ) <= 10` 
        return gyms
    }

}