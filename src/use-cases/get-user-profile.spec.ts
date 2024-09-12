import { it, expect, describe, beforeEach } from "vitest"
import { inMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository"
import { GetUserProfileUseCase } from "./get-user-profile-use-case"
import { hash } from "bcryptjs"
import { ResourceNotFoundError } from "./errors/resource-not-found-error"

let usersRepository: inMemoryUsersRepository
let sut: GetUserProfileUseCase


describe('Get User Profile Use Case', () => {
    beforeEach(() => {
        usersRepository = new inMemoryUsersRepository
        //sut = system under test - assim nos ctrl c - ctrl v nao precisamos mudar nome de variaveis
        sut = new GetUserProfileUseCase(usersRepository)
    })

    it('should be able to get user profile', async () => {

        const { id } = await usersRepository.create({
            name: 'Tester',
            email: 'tester@test.com',
            password_hash: await hash('123456', 6)
        })

        const { user } = await sut.execute({
            userId: id
        })

        expect(user.id).toEqual(expect.any(String))
    })

    it('should not be able to get user profile with inexistent id', async () => {
        await expect(() =>
            sut.execute({
                userId: 'notAnId'
            }) 
        ).rejects.toBeInstanceOf(ResourceNotFoundError)
    })
    
})