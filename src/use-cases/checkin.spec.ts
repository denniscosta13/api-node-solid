import { it, expect, describe, beforeEach, vi, afterEach } from "vitest"
import { CheckInsRepository } from "@/repositories/interface-checkins-repository"
import { CheckInUseCase } from "./checkin-use-case"
import { inMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-checkins-repository"
import { log } from "console"


let checkInRespository: CheckInsRepository
let sut: CheckInUseCase

describe('Check In Use Case', () => {

    beforeEach(()=> {
        checkInRespository = new inMemoryCheckInsRepository()
        sut = new CheckInUseCase(checkInRespository)

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should be able to check in', async () => {


        const { checkIn } = await sut.execute({
            gymId: 'gym-01',
            userId: 'user-01'
        })

        expect(checkIn.id).toEqual(expect.any(String))
    })

    it('should not be able to check in twice a day', async () => {
        vi.setSystemTime(new Date(2024, 8, 12, 16, 20))

        
        await sut.execute({
            gymId: 'gym-01',
            userId: 'user-01'
        })

        

        expect(() => 
            sut.execute({
                gymId: 'gym-01',
                userId: 'user-01'
            })
        ).rejects.toBeInstanceOf(Error)
        
    })

    it('should be able to check in twice in different days', async () => {
        vi.setSystemTime(new Date(2024, 8, 12, 16, 20))

        
        await sut.execute({
            gymId: 'gym-01',
            userId: 'user-01'
        })

        const checkInPromise = await sut.execute({
            gymId: 'gym-01',
            userId: 'user-01'
        })

        await expect(
            sut.execute({
                gymId: 'gym-01',
                userId: 'user-01'
            })
        ).resolves.toBeTruthy()
        
    })
    
})