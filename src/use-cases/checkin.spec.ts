import { it, expect, describe, beforeEach } from "vitest"
import { CheckInsRepository } from "@/repositories/interface-checkins-repository"
import { CheckInUseCase } from "./checkin-use-case"
import { inMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-checkins-repository"


let checkInRespository: CheckInsRepository
let sut: CheckInUseCase

describe('Register Use Case', () => {

    beforeEach(()=> {
        checkInRespository = new inMemoryCheckInsRepository()
        sut = new CheckInUseCase(checkInRespository)
    })

    it('should be able to check in', async () => {


        const { checkIn } = await sut.execute({
            gymId: 'gym-01',
            userId: 'user-01'
        })

        expect(checkIn.id).toEqual(expect.any(String))
    })

    
})