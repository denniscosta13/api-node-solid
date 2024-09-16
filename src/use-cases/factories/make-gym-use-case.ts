import { PrismaGymsRepository } from "@/repositories/prisma/prisma-gyms-repository";
import { GymUseCase } from "../gym-use-case";

export function makeGymUseCase() {
    const gymsRepository = new PrismaGymsRepository()
    const useCase = new GymUseCase(gymsRepository)

    return useCase
}