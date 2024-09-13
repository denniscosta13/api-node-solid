import { it, expect, describe, beforeEach, vi, afterEach } from "vitest"
import { inMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-checkins-repository"
import { GetUserMetricsUseCase } from "./get-user-metrics-use-case"




let checkInRespository: inMemoryCheckInsRepository
let sut: GetUserMetricsUseCase

describe('Get User Metrics Use Case', () => {

    beforeEach(()=> {
        checkInRespository = new inMemoryCheckInsRepository()
        sut = new GetUserMetricsUseCase(checkInRespository)
    })


    it('should be able to get user check in count from metrics', async () => {
        for(let i=1; i <= 2; i++) {
            await checkInRespository.create({
                gym_id: `gym-${i}`,
                user_id: 'user-01'
            })
        }
       
        const { checkInsCount } = await sut.execute({
            userId: 'user-01'
        })

        expect(checkInsCount).toEqual(2)
        
    })
    
})