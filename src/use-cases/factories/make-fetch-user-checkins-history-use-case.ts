import { FetchUserCheckInHistoryUseCase } from "../fetch-user-checkins-history";
import { PrismaCheckInsRepository } from "@/repositories/prisma/prisma-checkins-repository";

export function makeFetchCheckInHistoryUseCase() {
    const checkInsRepository = new PrismaCheckInsRepository()
    const useCase = new FetchUserCheckInHistoryUseCase(checkInsRepository)

    return useCase
}