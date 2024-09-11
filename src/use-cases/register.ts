import { UsersRepository } from "@/repositories/interface-users-repository"
import { hash } from "bcryptjs"
import { UserAlreadyExistsError } from "./errors/user-already-exists-error"


// typescript
// definimos a tipagem do paramentro recebido pelo useCase com uma interface
interface RegisterUseCaseRequest {
    name: string
    email: string
    password: string
}

export class RegisterUseCase {
    
    constructor(private usersRepository: UsersRepository) {}

    async execute({ 
        name, 
        email,
        password 
    } : RegisterUseCaseRequest) {
    
        // o password enviado para cadastro é hasheado por 6 vezes e salvo no banco de dados dessa forma
        // no login, fazemos o hash por 6 vezes da senha informada e comparamos com a salva no banco
        // caso sejam iguais, é possível fazer a autenticação
        const password_hash = await hash(password, 6)
    
        //regra de negócio
        //antes de fazer o registro de novo usuário, precisamos verificar se já não existe um outro com o mesmo email
        //fazemos uma busca com o prisma na tabela user filtrando o email enviado na request
        const userWithSameEmail = await this.usersRepository.findByEmail(email)
        
        //se o select do prisma encontrar dados, essa variavel vai ser true, entrando no if
        //como já existe um usuario com o mesmo email cadastrado, lançamos a exceção pro controller lidar
        //caso contrário, feita a validação de que não tem outro usuário com o mesmo email cadastrado, seguimos pro registro
        if(userWithSameEmail) {
            // nao faz sentido usar o reply, isso é de um contexto HTTP do fastify
            // a ideia do use-case é lidar com qualquer tipo de envio de dados, seja HTTP ou outros tipos
            // entao nao podemos utilizar um contexto unico, precisamos ser mais generalistas nesse caso
            // -------- return reply.status(409).send() 
    
            //por isso, caso tenha um usuário com o mesmo email, lançamos um erro
            //o controller deve lidar com esse erro
            throw new UserAlreadyExistsError()
        }
    
        //agora temos um repository, ou seja, uma classe responsável pela comunicação com o banco de dados
        //atraves dela podemos realizar transacoes por meio de uma instancia dessa classe
        //futuramente não iremos criar uma instancia aqui, utilizaremos inversão de dependencia
        //const prismaUsersRepository = new PrismaUsersRepository()
    
        await this.usersRepository.create({
            name,
            email,
            password_hash
        })
    }
}
