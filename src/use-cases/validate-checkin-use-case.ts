import { CheckIn } from "@prisma/client";
import { CheckInsRepository } from "@/repositories/interface-checkins-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import dayjs from "dayjs";
import { ExpiredCheckInError } from "./errors/expiredCheckIn";

interface ValidateCheckInUseCaseRequest {
    checkInId: string
}

interface ValidateCheckInUseCaseResponse {
    checkIn: CheckIn
}

export class ValidateCheckInUseCase {
    constructor(private checkInsRepository: CheckInsRepository) {}

    async execute( { checkInId }: ValidateCheckInUseCaseRequest): Promise<ValidateCheckInUseCaseResponse> {
        const checkIn = await this.checkInsRepository.findById(checkInId)

        if(!checkIn) {
            throw new ResourceNotFoundError()
        }

        const timeDiffInMinutesFromCheckInCreations = dayjs(new Date()).diff(checkIn.created_at, 'minutes')

        if(timeDiffInMinutesFromCheckInCreations > 20) {
            throw new ExpiredCheckInError()
        }

        checkIn.validated_at = new Date()

        await this.checkInsRepository.save(checkIn)

        return {
            checkIn,
        }
    }
}