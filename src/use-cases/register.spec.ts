import { it, expect, describe, beforeEach } from "vitest"
import { RegisterUseCase } from "./register"
import { compare } from "bcryptjs"
import { inMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository"
import { UserAlreadyExistsError } from "./errors/user-already-exists-error"

let usersRespository: inMemoryUsersRepository
let sut: RegisterUseCase

describe('Register Use Case', () => {

    beforeEach(()=> {
        usersRespository = new inMemoryUsersRepository
        sut = new RegisterUseCase(usersRespository)
    })

    it('should hash user password on registration', async () => {


        const { user } = await sut.execute({
            name: 'Jonh Test',
            email: 'johntest@email.com',
            password: '123456'
        })

        const isPasswordHashed = await compare('123456', user.password_hash)
        expect(isPasswordHashed).toBe(true)
        
    })

    it('should not be able to register with duplicate emails', async () => {

        const email_test = 'johntest@email.com'

        await sut.execute({
            name: 'Jonh Test',
            email: email_test,
            password: '123456'
        })

        //Quando queremos testar o resultado de uma Promise, ela tem 2 retornos possíveis:
        //Resolve ou Reject
        //Nesse caso, queremos testar se a Promise vai rejeitar ao criar um usuário com o mesmo email
        //Então o expect é que a promise reject o await
        //Se não adicionarmos o .toBeInstanceOf, o teste passa, mas somos alertados de um erro sem tratativa pelo vitest
        await expect(() => 
            sut.execute({
                name: 'Jonh Test',
                email: email_test,
                password: '123456'
            })
        ).rejects.toBeInstanceOf(UserAlreadyExistsError)

        
    })

    it('should be able to register', async () => {


        const { user } = await sut.execute({
            name: 'Jonh Test',
            email: 'johntest@email.com',
            password: '123456'
        })

        expect(user.id).toEqual(expect.any(String))
        
    })
})