import { UsersRepository } from "@/repositories/interface-users-repository";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";
import { compare } from "bcryptjs";
import { User } from "@prisma/client";

interface AuthUseCaseRequest {
    email: string
    password: string
}

interface AuthUseCaseResponse {
    user: User
}

export class AuthenticateUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute( {email, password }: AuthUseCaseRequest): Promise<AuthUseCaseResponse> {
        //buscar o usuario pelo email
        //comparar a senha enviada com a senha salva

        const user = await this.usersRepository.findByEmail(email)

        if(!user) {
            throw new InvalidCredentialsError()
        }

        const passwordMatches = await compare(password, user.password_hash)

        if(!passwordMatches) {
            throw new InvalidCredentialsError()
        }

        return {
            user,
        }
    }
}