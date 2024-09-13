import { it, expect, describe, beforeEach } from "vitest"
import { RegisterUseCase } from "./register"
import { compare } from "bcryptjs"
import { inMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository"
import { GymUseCase } from "./gym-use-case"


let gymsRespository: inMemoryGymsRepository
let sut: GymUseCase

describe('Gym Use Case', () => {

    beforeEach(()=> {
        gymsRespository = new inMemoryGymsRepository
        sut = new GymUseCase(gymsRespository)
    })

    it('should be able to create gym', async () => {

        await expect(
            sut.execute({
                title: 'Acadimia',
                description: null,
                phone: null,
                latitude: -23.4578541,
                longitude: -53.3463416
            })
        ).resolves.toBeTruthy()
        
    })
})