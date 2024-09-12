# Anotacoes e etapas do projeto

## Primeiros passos

Iniciar o projeto:

```sh
npm init -y
```

Instalar dependências iniciais:

```sh
npm i typescript @types/node tsx tsup -D
```

Inicializar typescript compiler, criar `tsconfig`:
```sh
npx tsc --init
```

Alterar target dentro de `tsconfig.json` para `es2020`: 

```js
"target": "es2020", 
```

Instalar fastify:

```sh
npm i fastify
```

### Scripts package.json

Scripts que vão nos ajudar no decorrer do projeto:

```js
"scripts": {
    "start:dev": "tsx watch src/server.ts",
    "start": "node build/server.js",
    "build": "tsup src --out-dir build"
  }
```

### npm config (.npmrc)

Essa configuracao serve para instalar os packages e mante-los na versão fixa instalada.
Dessa forma é possível saber exatamente quais recursos temos disponíveis.

Além disso, existem bots como o `renovate` que fica procurando atualizações dos nossos pacotes, caso exista, instala ele e roda os testes.
Se os testes passarem, ele abre um pull request no repo sugerindo a atualização do package.

```js
save-exact=true
```
> Uma alternativa é passar --save quando for instalar um package com npm

## Fastify

Criamos 2 arquivos:

- app.ts: importa o `fastify` e o atribui a uma *const* **app**, que é exportada.
- server.ts: importa **app** e chama o seu método `listen`, passando `host: '0.0.0.0'` e a porta.

## Enviroment Variables

Instalar a biblioteca `dotenv` que expõe a variável `process.env` do nosso sistema: 

```sh
npm i dotenv
```

Para organizar melhor, criamos uma pasta `env` dentro de `src` e criamos o arquivo `index.ts`:

```js
import 'dontenv/config'
```

Além disso, usaremos o `index.ts` para validar nossas variáveis e garantir que elas tem o valor correto.
Instalaremos o `ZOD` para fazer essa validação e outras durante o projeto:

```sh
npm i zod
```

### Validação

Definimos a estrutura do objeto para validar nossas variáveis do ambiente, para cada possível valor, adicionamos ao
objeto dentro de `z.object({})` o nome da váriavel, por exemplo `NODE_ENV` e seu valor esperado.

```js
const envSchema = z.object({
    NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'), //enum define possibles node_env values, if not use default
    PORT: z.coerce.number().default(3333) //coerce forces string to number, if not possible, uses default port
})
```

Feito isso, utilizamos a função `safeParse` do schema, que recebe como parametro nosso `process.env`. Salvamos essa
validação numa variável, que é possível verificar se teve sucesso, em caso de erro, nos dá o erro e se passou na validação
conseguimos acessar seu atributo `data` que contem as variáveis.

```js
const _env = envSchema.safeParse(process.env)

if(!_env.success) {
    console.error('Invalid enviroment variables.', _env.error.format());

    throw new Error('Invalid enviroment variables.')
}

export const env = _env.data
```

## Import paths (optional)

Dentro de `tsconfig.json` conseguimos criar um atalho para uma pasta ou demais pastas.
Nesse caso, tudo que importamos utilizando `@/` entende que iremos importar algo dentro da `src`:

```json
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"]
    }
```

## Docker

Criando imagem de `bitnami/postgres`

#### docker run
```sh
docker run --name api-solid-pg -e POSTGRESQL-USERNAME=docker -e POSTGRESQL_PASSWORD=docker -e POSTGRESQL_DATABASE=apisolid -p 5432:5432 bitnami/postgresql
```

Listar containers:

```sh
  docker ps #lista todos containers ativos

  docker ps -a #lista todos os container ativos e inativos
```

Start/pause container:

```sh
  docker run <CONTAINER ID/NAME>

  docker stop <CONTAINER ID/NAME>
```

Deletar container:

```sh
  docker rm <CONTAINER ID/NAME>
```

> É possível startar, pausar ou deletar o container no **docker desktop** 

Logs:

```sh
  docker logs <CONTAINER ID/NAME>

  docker log -f <CONTAINER ID/NAME> # follow logs
``` 

## Docker compose

Serve para definir as configurações dos containers necessários, útil para migrar o sistema.
O arquivo transcreve o comando inicial `run` com os parâmetros passados [aqui](#docker-run).

Ai quando quisermos subir o container num novo ambiente, utilizamos o comando:

```sh
docker compose up -d #-d é dettached, ou seja, no background
```

Quando quiser remover os containers - EVITAR:

```sh
docker compose down #-d é dettached, ou seja, no background
```

Para PAUSAR o container

```sh
docker compose stop #-d é dettached, ou seja, no background
```

`docker-compose.yaml`:

```yaml
version: '3'

services:
  api-solid-pg:
    image: bitnami/postgresql
    ports:
      - 5432:5432
    environment:
      - POSTGRESQL-USERNAME=postgres
      - POSTGRESQL_PASSWORD=docker
      - POSTGRESQL_DATABASE=apisolid
```

## Prisma (instalar plugin do vscode)

Para trabalhar com o prisma, primeiro isntalamos a dependencia de desenvolvimento e executamos o init.
Será criada uma pasta `prisma` e um arquivo `schema.prisma` com algumas configrações, inclusive das nossas tabelas

```sh
npm i -D prisma

npx prisma init
```

Também precisamos instalar um package para produção

```sh
npm i @prisma/client
```

Com o container do docker configurado e rodando, verificar no `.env` a variável `DATABASE_URL` e executar o seguinte comando:

```sh
npx prisma migrate dev
```
Esse comando irá gerar as migrations do banco de dados, criar as tabelas encontrados em `schema.prisma` e realizar
o que mais for necessário para migration

### Criando relationships

No arquivo `schema.prisma` teremos vários `models`, que são classes que representam as tabelas (entidades) do nosso
banco de dados.

Quando queremos criar uma relação entre tabelas, no model que queremos adicionar uma *foreign key*, digitamos o nome
que queremos dar pra relação e o nome do Model a ser relacionado.

Como temos o plugin do vscode, automaticamente ele irá criar o código quando salvarmos. Ficando do seguinte modo:

`model` com a *foreign key*

```js
model CheckIn {
  id           String    @id @default(uuid())
  created_at   DateTime  @default(now())
  validated_at DateTime?

  user    User   @relation(fields: [user_id], references: [id])
  user_id String

  gym    Gym    @relation(fields: [gym_id], references: [id])
  gym_id String

  @@map("check_ins")
}
```

`model` que é referenciado por outro, por meio da *foreign key*:

```js
model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  password_hash String
  created_at    DateTime  @default(now())
  checkIns      CheckIn[]

  @@map("users")
}
```

Perceba que o `model` que recebe as *foreign keys*, fica declarado o seguinte:

```js
model CheckIn {
  //...

  user            User   @relation(fields: [user_id], references: [id])
  user_id String

//explicacao
  {
    nome_relacao: user,
    model_referenciado: User,
    relacao: {
      foreign_key:
        fields: [user_id],
        referencia_ao_campo: [id] //nome do id da tabela User
    },
    nome_campo_na_tabela: user_id,
    tipo_dado: String
  }
}
```

Já no `model` que fornece a *foreign key*, temos apenas uma definição da relação criada:

```js
model User {
  //...

   // nome da relacao `checkIns` utilizada pelo javascript - nome do `model` relacionado `CheckIn`
  checkIns      CheckIn[] // [] indicam a relacao, nesse caso, one-to-many

  @@map("users")
}
```

## Controller

Controller lida e manipula entrada de dados de request e da uma reposta.

No caminho `src/http/controllers` criamos nosso primeiro controller, para lidar com o registro de novos usuários.

Para ter uma boa ideia do que estamos fazendo e da lógica aplicada, é bom iniciar criando toda a logica no controller:

- recebe request
- valida se os dados recebidos estão corretos
- verifica se não tem outro registro com mesmo email
- faz o hash da senha
- e por fim salva o registro válido no banco de dados

Dessa forma, fica mais fácil entender o fluxo da aplicação, porém, depois vamos separar alguns pedaços desse controler,
já que são pedaços que sempre se repetem, independente de como esse controler lida com a informação.

Esse trecho de código vai ser separado em um useCase ou Service, o que fizer mais sentido pra aplicação.

Exemplo inicial de Controller:

```js
import { FastifyRequest, FastifyReply } from "fastify"
import { z } from "zod"
import { registerUseCase } from "@/use-cases/register" //importa o use-case

export async function register(request: FastifyRequest, reply: FastifyReply)  {
    const registerBodySchema = z.object({
        name: z.string(),
        email: z.string(),
        password: z.string().min(6)
    })

    const { name, email, password } = registerBodySchema.parse(request.body)

    try {
        await registerUseCase( { name, email, password } ) // utiliza o use-case para manipular os dados de forma lógica
    } catch {
        return reply.status(409).send()
    }

    return reply.status(201).send()
}
```

## Use Case

Os use-cases contém a parte lógica de uma funcionalidade, sem depender de um contexto específico. O use-case não utiliza
de recursos de HTTP requests (fastify).

Com o use-case, não precisamos acessar uma rota para poder aplicar a logica do use-case, ela pode ser usada sempre que
preciso independente sé uma requisição HTTP, basta apenas preencher o parametros necessários.

O compromisso dele é receber os dados necessários, aplicar a lógica, persistindo ou recuperando do banco de dados e devolver
a resposta esperada.

Exemplo inicial de um use-case:

```js
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

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
    const password_hash = await hash(password, 6)

    const userWithSameEmail = await prisma.user.findUnique({
        where: {
            email,
        }
    })

    if(userWithSameEmail) {
        // nao faz sentido usar o reply, isso é de um contexto HTTP do fastify
        // a ideia do use-case é lidar com qualquer tipo de envio de dados, seja HTTP ou outros tipos
        // entao nao podemos utilizar um contexto unico, precisamos ser mais generalistas nesse caso
        // -------- return reply.status(409).send() 

        throw new Error('E-mail already exists.')
    }

    //vai ser separado para um repository mais adiante
    await prisma.user.create({
        data: {
            name,
            email,
            password_hash
        }
    })
}
```

## Repository pattern

Abstrair a comunicação com o banco de dados em um arquivo separado

Todas as transações com banco de dados, vão passar pelo repository

### Prisma types

Quando criamos nossos `models` no Prisma, ele cria também vários `types` de cada `model` que tem o formato
exato dos dados que precisamos quando estamos trabalhando com um `model` em questão.

Uma das vantagens de separar a conexão com o banco de dados nos ajuda na manutenção, caso no futuro, precisemos alterar o banco de dados ou
tecnologia usada para acessar esse banco de dados.

Fazer esse import, nos da acesso a esses types dentro de `Prisma` que pode ser usados para definir o tipo das nossas
variáveis.

```js
import { Prisma } from "@prisma/client"
```

Exemplo:

```js
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export class PrismaUsersRepository {
    async create(data: Prisma.UserCreateInput) {
        const user = await prisma.user.create({
            data
        })

        return user
    }
}
```

## SOLID

### [D]ependency Inversion Principle

O objetivo aqui é inverter a dependência.

Hoje, o use-case é responsável por criar uma instância do repository pra utilizar ele. Não queremos que a criação do
objeto fique a cargo do use-case. Isso pode ser um problema no futuro, caso seja necessário fazer alguma alteração de
repository ou algo do tipo.

Por isso, vamos transformar a função use-case em uma classe use-case. Essa classe vai receber no seu contrutor a instancia
de um repository já criada por outra classe que ficará responsável só por isso e não mais pelo use-case;

Há duas formas de fazer a classe recebendo a instancia no construtor, o modo padrão e um hack do TypeScript:

- Padrão:

```js
class registerUseCase {
    private _usersRepository: any

    constructor(usersRepository: any) {
        this._usersRepository = usersRepository
    }
}
```

- TypeScript:

```js
class registerUseCase {
    constructor(private usersRepository: any) {}
}
```

## Errors

No inicio do desenvolvimento, podemos lançar um erro genérico com:

```js
throw new Error('Error')
```

Mas, depois quando a aplicação tiver mais regras implementadas, queremos informar o erro certo e que ajude o usuário
a lidar com ele.

Para isso, podemos criar várias classes que herdam a classe `Error`. Dessa forma, podemos validar o tipo de erro e
retornar uma resposta e `statusCode` adequado.

### Fastify Global Error Handler

O fastify tem uma função para tratar erros de forma global - `setErrorHandler`
Ela consegue capturar o erro, request e reply.

Por enquanto, caso seja um erro de validação do Zod, essa função vai tratar o erro e últimos casos,
vai lançar um Internal Server Error 500.

## Testes

No backend, é ideal começar a trabalhar com os testes logo de inicio, assim já podemos testar a regra de negócio e 
adaptar nosso código para evitar erros.

```sh
npm i vitest vite-tsconfig-paths -D
```

O package `vite-tsconfig-paths` serve pra ele entender o `@/` que configuramos como apelido nas importações do src.
Passamos essa configuracao em vite.config.ts

### Testes unitário

Nos tests unitário, precisamos escrever eles sem dependências, inclusive de banco de dados. Caso o teste unitário
acesse o banco de dados para testar, já não é mais um teste unitário, pois ele testa a integração da conexão do banco
juntamente com outra funcionalidade do teste em questão.

Como nosso código está desacoplado minimamente, é realizar o teste com os dados em memória. Ao invés de fazer uma transação
no banco de dados, mantemos os dados em memória, aplicamos a lógica e testamos se a lógica manipulou o retornou o esperado.

Como os testes unitários são a base da pirâmide, ou seja, teremos muitos desses testes, eles precisam ser rápidos.
Utilizando um repository em memória aumenta muito a performance.

### Vitest Coverage

Ajuda a ter uma noção do que estamos cobrindo com os testes.
Script adicionado ao `package.json`:

```js
"test:coverage": "vitest --coverage"
```

### Vitest UI

Temos um UI do Vitest também, caso prefira algo mais visual:

Instalar:
```sh
npm i -D @vitest/ui
```

Adicionado ao `package.json`:

```js
"test:ui": "vitest --ui"
```


## Factory Design Pattern

Sempre que precisamos de um `use-case` nos controllers, além de instanciar o `use-case` também precisamos instanciar
um `repository`.

Portanto, podemos criar uma `factory` que nada mais é que um função que quando chamada, irá instanciar as duas classes e
retornar o `use-case`.

Exemplo:

```js
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { RegisterUseCase } from "../register";

export function makeRegisterUseCase() {
    const usersRepository = new PrismaUsersRepository()
    const registerUseCase = new RegisterUseCase(usersRepository)

    return registerUseCase
}
```

## Use Case pt.2

Apesar de ter dito que era melhor construir a lógica toda no controller e depois ir dividindo. O Diego sugere iniciar o
desenvolvimento do código pelos use-cases, já que é o nível mais baixo do código e já de inicio pode ter testes unitários.

O controller só permite que a gente acesse o caso de uso por uma rota, então não necessariamente precisamos dele pra testar
nossa lógica e regras de negócio.

Portanto, podemos focar em contruir os use-cases e depois mais pra frente implementamos a parte de infraestrutura http
