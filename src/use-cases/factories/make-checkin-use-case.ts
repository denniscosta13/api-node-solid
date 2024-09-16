import { PrismaGymsRepository } from "@/repositories/prisma/prisma-gyms-repository";
import { CheckInUseCase } from "../checkin-use-case";
import { PrismaCheckInsRepository } from "@/repositories/prisma/prisma-checkins-repository";

export function makeCheckInUseCase() {
    const checkInsRepository = new PrismaCheckInsRepository()
    const gymsRepository = new PrismaGymsRepository()
    const useCase = new CheckInUseCase(checkInsRepository, gymsRepository)

    return useCase
}