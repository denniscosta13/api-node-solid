import { it, expect, describe, beforeEach, vi, afterEach } from "vitest"
import { CheckInsRepository } from "@/repositories/interface-checkins-repository"
import { CheckInUseCase } from "./checkin-use-case"
import { inMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-checkins-repository"
import { inMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository"
import { GymsRepository } from "@/repositories/interface-gyms-repository"

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


        // vi.useFakeTimers()
    })

    afterEach(() => {
        // vi.useRealTimers()
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

    
})