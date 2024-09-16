import { ValidateCheckInUseCase } from "../validate-checkin-use-case";
import { PrismaCheckInsRepository } from "@/repositories/prisma/prisma-checkins-repository";

export function makeValidateCheckInUseCase() {
    const checkInsRepository = new PrismaCheckInsRepository()
    const useCase = new ValidateCheckInUseCase(checkInsRepository)

    return useCase
}