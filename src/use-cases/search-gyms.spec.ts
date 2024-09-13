import { it, expect, describe, beforeEach } from "vitest"
import { inMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository"
import { SearchGymsUseCase } from "./search-gyms-use-case"


let gymsRespository: inMemoryGymsRepository
let sut: SearchGymsUseCase

describe('Search Gym Use Case', () => {

    beforeEach(()=> {
        gymsRespository = new inMemoryGymsRepository
        sut = new SearchGymsUseCase(gymsRespository)
    })

    it('should be able to search gym by title/name', async () => {

        await gymsRespository.create({
            id: 'gym-01',
            title: 'Bola de ferro',
            description: null,
            phone: null,
            latitude: 0,
            longitude: 0
        })

        await gymsRespository.create({
            id: 'gym-02',
            title: 'Acariani',
            description: null,
            phone: null,
            latitude: 0,
            longitude: 0
        })

        

        const { gyms } = await sut.execute({ 
            query: 'cari',
            page: 1
        })

        expect(gyms).toHaveLength(1)
        expect(gyms).toEqual([
            expect.objectContaining({ title: 'Acariani'})
        ])

        
        
    })

    it('should be able to search gym by title/name', async () => {

        for(let i=1; i <= 22; i++){
            await gymsRespository.create({
                title: `Bola de Ferro ${i}`,
                description: null,
                phone: null,
                latitude: 0,
                longitude: 0
            })
        }
        

        const { gyms } = await sut.execute({ 
            query: 'Bola de Ferro',
            page: 2
        })

        expect(gyms).toHaveLength(2)
        expect(gyms).toEqual([
            expect.objectContaining({ title: 'Bola de Ferro 21'}),
            expect.objectContaining({ title: 'Bola de Ferro 22'})
        ])
    
})
})    
