import { CheckInsRepository } from "@/repositories/interface-checkins-repository";

interface GetUserMetricsUseCaseRequest {
    userId: string
}

interface GetUserMetricsUseCaseResponse {
    checkInsCount: number
}

export class GetUserMetricsUseCase {
    constructor(
        private checkInsRepository: CheckInsRepository
    ) {}

    async execute( { userId }: GetUserMetricsUseCaseRequest): Promise<GetUserMetricsUseCaseResponse> {
        const checkInsCount = await this.checkInsRepository.metricsById(userId)

        return {
            checkInsCount,
        }
    }
}