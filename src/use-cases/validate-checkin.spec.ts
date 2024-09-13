import { it, expect, describe, beforeEach, vi, afterEach } from "vitest"
import { inMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-checkins-repository"
import { ValidateCheckInUseCase } from "./validate-checkin-use-case"
import { ResourceNotFoundError } from "./errors/resource-not-found-error"
import { ExpiredCheckInError } from "./errors/expiredCheckIn"



let checkInRespository: inMemoryCheckInsRepository
let sut: ValidateCheckInUseCase

describe('Validate Check In Use Case', () => {

    beforeEach(async ()=> {
        checkInRespository = new inMemoryCheckInsRepository()
        sut = new ValidateCheckInUseCase(checkInRespository)

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should be able to validate check in', async () => {
        const createdCheckIn = await checkInRespository.create({
            gym_id: 'gym-01',
            user_id: 'user-01'
        })

        const { checkIn } = await sut.execute({
            checkInId: createdCheckIn.id
        })

        expect(checkIn.validated_at).toEqual(expect.any(Date))
        expect(checkInRespository.items[0].validated_at).toEqual(expect.any(Date))
    })

    it('should not be able to validate inexistent check in', async () => {
        
        await expect(() => 
            sut.execute({
                checkInId: 'notAnId'
            })
        ).rejects.toBeInstanceOf(ResourceNotFoundError)
    })

    it('should not be able to validate check in after 20 minutes of its creation', async () => {
        vi.setSystemTime(new Date(2024,8,13,13,20))

        const createdCheckIn = await checkInRespository.create({
            gym_id: 'gym-01',
            user_id: 'user-01'
        })

        const timeToExpiresTokenInMs = 1000 * 60 * 21 //21 minutes 
        vi.advanceTimersByTime(timeToExpiresTokenInMs)

        await expect(() => 
            sut.execute({
                checkInId: createdCheckIn.id
            })
        ).rejects.toBeInstanceOf(ExpiredCheckInError)
    })

    
})