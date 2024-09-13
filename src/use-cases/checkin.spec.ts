import { it, expect, describe, beforeEach, vi, afterEach } from "vitest"
import { CheckInUseCase } from "./checkin-use-case"
import { inMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-checkins-repository"
import { inMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository"
import { Decimal } from "@prisma/client/runtime/library"
import { DailyCheckInLimitError } from "./errors/daily-checkin-error"
import { MaxDistanceError } from "./errors/max-distance-error"



let checkInRespository: inMemoryCheckInsRepository
let gymsRepository: inMemoryGymsRepository
let sut: CheckInUseCase

describe('Check In Use Case', () => {

    beforeEach(async ()=> {
        checkInRespository = new inMemoryCheckInsRepository()
        gymsRepository = new inMemoryGymsRepository()
        sut = new CheckInUseCase(checkInRespository, gymsRepository)
        
        await gymsRepository.create({
            id: 'gym-01',
            title: 'Academia Bola de Ferro',
            description: '',
            phone: '',
            latitude: new Decimal(-23.592899),
            longitude: new Decimal(-46.6790186)
        })


        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should be able to check in', async () => {
        

        const { checkIn } = await sut.execute({
            gymId: 'gym-01',
            userId: 'user-01',
            userLatitude: -23.592899,
            userLongitude: -46.6790186
        })

        expect(checkIn.id).toEqual(expect.any(String))
    })

    it('should not be able to check in twice a day', async () => {
        vi.setSystemTime(new Date(2024, 8, 12, 16, 20))

        
        await sut.execute({
            gymId: 'gym-01',
            userId: 'user-01',
            userLatitude: -23.592899,
            userLongitude: -46.6790186
        })

        

        expect(() => 
            sut.execute({
                gymId: 'gym-01',
                userId: 'user-01',
                userLatitude: -23.592899,
                userLongitude: -46.6790186
            })
        ).rejects.toBeInstanceOf(DailyCheckInLimitError)
        
    })

    it('should be able to check in twice in different days', async () => {
        vi.setSystemTime(new Date(2024, 8, 12, 16, 20))

        
        await sut.execute({
            gymId: 'gym-01',
            userId: 'user-01',
            userLatitude: -23.592899,
            userLongitude: -46.6790186
        })

        vi.setSystemTime(new Date(2024, 8, 13, 16, 20))

        await expect(
            sut.execute({
                gymId: 'gym-01',
                userId: 'user-01',
                userLatitude: -23.592899,
                userLongitude: -46.6790186
            })
        ).resolves.toBeTruthy()
        
    })

    it('should not be able to check in far from gym', async () => {
        

        await expect(() => 
            sut.execute({
                gymId: 'gym-01',
                userId: 'user-01',
                userLatitude: -23.5903343,
                userLongitude: -46.6784011
            }),
        ).rejects.toBeInstanceOf(MaxDistanceError)

    })
    
})