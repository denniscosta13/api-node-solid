import { CheckIn } from "@prisma/client";
import { CheckInsRepository } from "@/repositories/interface-checkins-repository";

interface CheckInUseCaseRequest {
    userId: string
    gymId: string
}

interface CheckInUseCaseResponse {
    checkIn: CheckIn
}

export class CheckInenticateUseCase {
    constructor(private checkInsRepository: CheckInsRepository) {}

    async execute( { userId, gymId }: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse> {
        
        const checkIn = await this.checkInsRepository.create({
            gym_id: gymId,
            user_id: userId
        })

        return {
            checkIn,
        }
    }
}