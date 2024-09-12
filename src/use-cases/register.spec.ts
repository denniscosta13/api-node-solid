import { it, expect, describe } from "vitest"
import { RegisterUseCase } from "./register"
import { compare } from "bcryptjs"

describe('Register Use Case', () => {
    it('should hash user password on registration', async () => {
        const registerUseCase = new RegisterUseCase(
            {
                async findByEmail(email: string) {
                    return null
                },

                async create(data) {
                    return {
                        id: 'id-test-1',
                        name: data.name,
                        email: data.email,
                        password_hash: data.password_hash,
                        created_at: new Date()
                    }
                },
            }
        )

        const { user } = await registerUseCase.execute({
            name: 'Jonh Test',
            email: 'johntest@email.com',
            password: '123456'
        })

        const isPasswordHashed = await compare('123456', user.password_hash)
        expect(isPasswordHashed).toBe(true)
        
    })
})