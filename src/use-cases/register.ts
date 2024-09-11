import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

// typescript
// definimos a tipagem do paramentro recebido pelo useCase com uma interface
interface RegisterUseCaseRequest {
    name: string
    email: string
    password: string
}

export async function registerUseCase({ 
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
    const userWithSameEmail = await prisma.user.findUnique({
        where: {
            email,
        }
    })

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
        throw new Error('E-mail already exists.')
    }

    await prisma.user.create({
        data: {
            name,
            email,
            password_hash
        }
    })
}