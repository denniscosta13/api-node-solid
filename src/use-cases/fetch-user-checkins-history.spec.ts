import { it, expect, describe, beforeEach } from "vitest"
import { inMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-checkins-repository"
import {  FetchUserCheckInHistoryUseCase } from "./fetch-user-checkins-history"



let checkInRespository: inMemoryCheckInsRepository
let sut: FetchUserCheckInHistoryUseCase

describe('Fetch User Check In History Use Case', () => {

    beforeEach(()=> {
        checkInRespository = new inMemoryCheckInsRepository()
        sut = new FetchUserCheckInHistoryUseCase(checkInRespository)
    })


    it('should be able to fetch check-in history', async () => {
        await checkInRespository.create({
            gym_id: 'gym-01',
            user_id: 'user-01'
        })

        await checkInRespository.create({
            gym_id: 'gym-02',
            user_id: 'user-01'
        })

        const { checkIns } = await sut.execute({
            userId: 'user-01',
            page: 1
        })

        expect(checkIns).toHaveLength(2)
        expect(checkIns).toEqual([
            expect.objectContaining({ gym_id: 'gym-01' }),
            expect.objectContaining({ gym_id: 'gym-02' }),
        ])
    })

    it('should be able to fetch paginated check-in history', async () => {
        // criamos 22 checkins
        for(let i=1; i <= 22; i++) {
            await checkInRespository.create({
                gym_id: `gym-${i}`,
                user_id: 'user-01'
            })
        }
       
        // queremos acessar a pagina 2
        const { checkIns } = await sut.execute({
            userId: 'user-01',
            page: 2
        })

        //esperamos que na pagina 2 tenha apenas 2 checkins, ja que cada pagina terá 20 check ins
        //esperamos que os 2 itens sejam checkins na gym 21 e 22 que foram as duas ultimas
        //isso garante que estamos paginando o fetch

        expect(checkIns).toHaveLength(2)
        expect(checkIns).toEqual([
            expect.objectContaining({ gym_id: 'gym-21' }),
            expect.objectContaining({ gym_id: 'gym-22' }),
        ])
    })
    
})