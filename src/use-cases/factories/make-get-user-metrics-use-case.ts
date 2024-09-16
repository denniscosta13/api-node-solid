import { GetUserMetricsUseCase } from "../get-user-metrics-use-case";
import { PrismaCheckInsRepository } from "@/repositories/prisma/prisma-checkins-repository";

export function makeGetUserMetricsUseCase() {
    const checkInsRepository = new PrismaCheckInsRepository()
    const useCase = new GetUserMetricsUseCase(checkInsRepository)

    return useCase
}