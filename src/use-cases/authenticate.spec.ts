import { it, expect, describe } from "vitest"
import { compare, hash } from "bcryptjs"
import { inMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository"
import { AuthenticateUseCase } from "./authenticate-use-case"
import { InvalidCredentialsError } from "./errors/invalid-credentials-error"

describe('Authenticate Use Case', () => {
    it('should be able to authenticate', async () => {
        const usersRepository = new inMemoryUsersRepository
        //sut = system under test - assim nos ctrl c - ctrl v nao precisamos mudar nome de variaveis
        const sut = new AuthenticateUseCase(usersRepository)

        await usersRepository.create({
            name: 'Tester',
            email: 'tester@test.com',
            password_hash: await hash('123456', 6)
        })

        const { user } = await sut.execute({
            email: 'tester@test.com',
            password: '123456'
        })

        expect(user.id).toEqual(expect.any(String))
        
    })

    it('should not be able to authenticate with wrong email', async () => {
        const usersRepository = new inMemoryUsersRepository
        //sut = system under test - assim nos ctrl c - ctrl v nao precisamos mudar nome de variaveis
        const sut = new AuthenticateUseCase(usersRepository)

        

        await expect(() =>
             sut.execute({
                email: 'tester@test.com',
                password: '123456'
            })).rejects.toBeInstanceOf(InvalidCredentialsError)
        
    })

    it('should not be able to authenticate with wrong password ', async () => {
        const usersRepository = new inMemoryUsersRepository
        //sut = system under test - assim nos ctrl c - ctrl v nao precisamos mudar nome de variaveis
        const sut = new AuthenticateUseCase(usersRepository)

        await usersRepository.create({
            name: 'Tester',
            email: 'tester@test.com',
            password_hash: await hash('123456', 6)
        })

        await expect(() =>
             sut.execute({
                email: 'tester@test.com',
                password: '1234567'
            })).rejects.toBeInstanceOf(InvalidCredentialsError)
        
    })

})