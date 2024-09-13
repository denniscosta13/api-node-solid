import { it, expect, describe, beforeEach } from "vitest"
import { inMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository"
import { FetchNearbyGymsUseCase } from "./fetch-nearby-gyms-use-case"


let gymsRespository: inMemoryGymsRepository
let sut: FetchNearbyGymsUseCase

describe('Fetch nearby gyms Use Case', () => {

    beforeEach(()=> {
        gymsRespository = new inMemoryGymsRepository
        sut = new FetchNearbyGymsUseCase(gymsRespository)
    })

    it('should be able to fetch nearby gyms', async () => {

        await gymsRespository.create({
            id: 'gym-01',
            title: 'Near Gym',
            description: null,
            phone: null,
            latitude: -23.592899,
            longitude: -46.6790186
        })

        await gymsRespository.create({
            id: 'gym-02',
            title: 'Far Gym',
            description: null,
            phone: null,
            latitude: -27.2092052,
            longitude: -49.6401091
        })
      

        const { gyms } = await sut.execute({ 
            userLatitude: -23.592899,
            userLongitude: -46.6790186
        })

        expect(gyms).toHaveLength(1)
        expect(gyms).toEqual([
            expect.objectContaining({ title: 'Near Gym'})
        ])

        
        
    })
})    
