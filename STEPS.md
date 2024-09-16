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

### queryRaw

Quando queremos escrever uma query mais personalizada, podemos utilizar a propriedade
`$queryRaw` do Prisma:

```js
await prisma.$queryRaw`SELECT * FROM table`
```

Como estamos utilizando uma query personalizada, o Prisma não consegue identificar
qual é o retorno da query, por isso, podemos declarar o tipo de retorno inserindo ele
entre os operadores de comparação `<` e `>`:

```js
await prisma.$queryRaw<T | T[]>`SELECT * FROM table`
```

Podendo ser o retorno um resultado único ou uma lista de vários valores.

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

## TDD - Test-Drive Development

É desenvolver as regras e casos de usos a partir dos testes. Então primeiro a gente implemente o teste de uma regra e
depois leva ela para o código de fato.

Sempre que possível, criar o teste unitário mais específico possível, mesmo que precise de vários testes.

### Red

Primeiro estágio do TDD, quando o teste da erro ou não retorna o resultado esperado.

### Green

Desenvolver o minimo de código possível para passar no teste.

### Refactor

Caso os testes alcancem o `green`, então nós refatoramos o código para melhor.

## Autenticação

### JWT

JSON Web Token(JWT) é uma das maneiras mais comuns utilizadas para autenticação de forma segura.

1. O Usuário faz login, enviando email e senha
2. O back-end verifica se a senha criptografada corresponde coma senha daquele usuário
3. Em caso afirmativo, o back-end cria um token **ÚNICO**, não modificável e `STATELESS`

`STATELESS`: Não armazenado em nenhuma estrutura de persistência de dados (banco de dados)

AO criar o token, o back-end utiliza uma *palavra-chave*, geralmente uma string. Essa palavra-chave, que só o back-end
conhece, é utilizada para assinar o token tornando praticamente impossível de alterar ele para obter um acesso malicioso.

O token é composto por: 
- header: cabeçalho da requisição com as informações de criptografia e qual tecnologia do token
- payload: informações adicionais, geralmente um `sub` com o id do usuário e outras informações necessárias
- sign: palavra-chave utilizada pelo back-end

Login => JWT
JWT => Utilizado em todas as requisições (passado no header)

`Authorization: Bearer Token`

### Camadas da aplicação

Tudo relacionado ao Token e Autenticação é utilizado nas camadas mais externas da aplicação, como os `controllers`,
que fazem a ponte para o mundo externo através das rotas HTTP.

Os **casos de uso** não devem implmentar nada relacionado a JWT, pois eles são a parte mais pura da lógica e regras de
negócio da nossa aplicação.
Dessa forma, blindamos a lógica dos métodos de entrada, tornando os casos de uso independentes. Eles se tornam independentes
a partir do momento que não temos funcionalidades das camadas mais externas amarradas a eles. Portanto, o sistema pode
ser integrado como API, integrado a um sistema interno de uma empresa, etc. Independente se vai fazer uma requisição HTTP
ou se vai acessar diretamente os use-cases num sistema integrado.

O importante aqui é separar o **core** da aplicação, que é sua lógica e regras de negócio do **use-cases**, das camadas
externas de comunicação, seja pela internet ou outra forma.

### Fastify

O fastify tem um package de jwt que nos ajuda nesse processo:

```sh
npm i @fastify/jwt
```

Após isso, antes de registrar as rotas no `app.ts`, nós registramos o jwt:

```js
app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
})
```

Além disso, ao instalarmos esse package, o request e reply ganham alguns métodos relacionados ao jwt, um deles
serve para criar o token. Estamos utilizando ele na rota de autenticação. A rota faz a validação de senha, caso dê tudo
certo, ela cria um token e o retorna no body da reply:

```js

//o primeiro parametro é o payload, podemos passar vazio ou com alguma info, aqui não tem o sub ainda
//no segundo parametros passamos o sign que tem o sub dentro deles
//NUNCA PASSAR SENHA NO PAYLOAD - o corpo do JWT é apenas encodado e não criptografado
//isso tornal possível obter a senha apenas fazendo DECODE em base64
//o que torna nosso token válido ou não é a palavra chave
const token = await reply.jwtSign({}, {
            sign: {
                sub: user.id
            }
        })

return reply.status(200).send({
            token
        })
```

### Env

Como estamos lendo o secret do .env, precisamos declarar ele no `index.ts` da pasta `env`.
No index, é feita a validação das nossas váriaveis de ambiente, o JWT_SECRET é uma variável obrigatória, pois sem ela
não podemos criar os tokens, por isso adicionamos ela na validação do zod:

```js
const envSchema = z.object({
    NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
    JWT_SECRET: z.string(),
    PORT: z.coerce.number().default(3333),
})
```

### Fluxo

Basicamente, o fluxo de autenticação funciona da seguinte forma:

- O usuário envia as informações de login (vamos considerar que sejam válidas)
- O backend valida usuário e senha com sucesso e cria um token e o devolve na reply. Passamos dentro do token o `id` do usuário logado, que vai encodado em `base64`:

```js
const token = await reply.jwtSign({}, {
          sign: {
              sub: user.id
          }
      })

return reply.status(200).send({
        token
    })
```
- O front armazena esse token: `localStorage` ou `Cookies`
- Para rotas que precisam de autenticação, nós adicionamos um middleware que irá fazer a verificação do `JWT` que será enviado no Header da request `Authorization: Bearer Token`: 

```js
  // ./middlewares/verify-jwt.ts
  try {
      await request.jwtVerify()
  } catch (error) {
      return reply.status(401).send({
          message: 'Unauthorized.'
      })
  }
  ```
- Caso o JWT seja válido, ele encaminha para a rota de destino através do controller
- Na rota de destino, nós recuperamos da request o `id` do usuário que estava encodado dentro do token, esse `id` fica disponível em `request.user.sub` além de outras informações do payload, caso passadas:
```js
// exemplo de useCase que utiliza userId como parametro
// obtemos o userId de dentro de request.user.sub como dito anteriormente

const { user } = await getUserProfileUseCase.execute({
        userId: request.user.sub
    })
```

## Test Environment - End2End

Para não utilizarmos as tabelas originais do banco de dados para realizar testes e deixa-las poluídas, precisamos criar um ambiente limpo para cada teste E2E.

Primeiro, criamos uma pasta aonde preferir (./src, ./prisma) com o nome de `vitest-environment-{environmentName}`. No nosso caso, criamos `vitest-environment-prisma`.

Dentro dessa pasta criamos um arquivo `.ts` que pode ter qualquer nome. Nesse arquivo vamos configuar o environment que estamos criando para testes.

Criamos um objeto do tipo `Environment` do `vitest/environments` com os atributos:
- name: `prisma`,
- transformMode: `ssr` (ssr para backend e codigo rodando direto do node),
- async setup(): função que irá ser executada ao iniciar os testes nesse `environment`, serve pra preparar o ambiente,
- return:
  - async teardown() {}: função que será executada ao final dos testes, serve para limpar o ambiente.

```js
import { PrismaClient } from "@prisma/client";
import { randomUUID } from 'node:crypto';
import { Environment } from 'vitest/environments';

const prisma = new PrismaClient()
const prismaEnvironment: Environment = {
    name: 'prisma',
    transformMode: 'ssr', // ou 'web', dependendo do seu caso
    async setup() {
      //...
        return {
            async teardown() {//...},
        };
    },
};
export default prismaEnvironment;
```

### setup() 

Existem diversas formas de criar um ambiente novo e limpo para cada teste E2E. Nesse caso, vamos criar um `schema` do PostgreSQL no nosso banco de dados para cada conjunto de testes.

Na `DATABASE_URL` do Postgres temos uma searchParam que define o nome do `schema`, que por padrão é o **public**.

Vamos alterar esse URL criando um novo schema aleatório com `randomUUID()` e executando as migrations nesse novo schema. Uma função personalizada é utilizada para manipular a URL: 

```js

function generateDatabaseURL(schema: string) {
  // funcao procura dentro do .env uma variavel DATABASE_URL, se não encontra da erro
    if(!process.env.DATABASE_URL) {
        throw new Error('Pleas provide a DATABASE_URL environment variable.')
    }

    //cria um novo objeto URL a partir da variavel DATABASE_URL
    //acessa o searchParams da URL e altera pelo schema recebido como parametro
    const url = new URL(process.env.DATABASE_URL)
    url.searchParams.set('schema', schema)

    //devolve a URL em formato string
    return url.toString()
}

async setup() {

        //gera um nome de schema com UUID
        const schema = randomUUID()

        //cria uma nova URL passando o schema gerado como parametro
        const databaseURL = generateDatabaseURL(schema)

        //define a variavel DATABASE_URL com o valor da nova URL
        process.env.DATABASE_URL = databaseURL

        //executa as migrations em deploy
        //quando executamos com deploy, o prisma apenas executa as etapas criadas
        /// das migrations definidas com o migrate dev
        /// nao queremos que ele crie novas etapas, apenas que execute as definidas
        /// por isso utilizamos o deploy
        execSync('npx prisma migrate deploy')

        return {
          //...
        };
    }
```

Por fim, a função `setup()` retorna uma outra função, chamada de `teardown()`. Nela, desfazemos tudo que foi criado, para manter sempre o banco de dados limpo:

```js
  return {
    async teardown() {

        // dropa o schema criado durante o setup
        //CASCADE para deletar tudo abaixo do schema
        await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)

        // fecha a conexao
        await prisma.$disconnect()
    },
};
```

### vite.config.mts

Precisamos adicionar uma configuração nesse arquivo, dessa forma ele entende que os testes de uma determinada pasta deverão utilizar nosso novo `enviroment`:

Vamos adicionar o `environmentMatchGlobs` a configuração. Esse atributo recebe uma lista, que contém outra lista dentro, primeiro com o caminho da pasta de testes que queremos utilizar nosso novo environment, segundo a pasta que contem nosso environment customizado

```js
test: {
  environmentMatchGlobs: [
      ['src/http/controllers/**', './prisma/vitest-environment-prisma/prisma-test-environment.ts']
  ],
  // pasta que deve procurar por testes
  dir: 'src',
}
```

### Scripts

Fizemos algumas alterações nos scripts para que eles executem o comando certo na pasta certa:

```json
    //testes unitarios serao os da pasta src/use-cases
    "test": "vitest run --dir src/use-cases",
    "test:watch": "vitest --dir src/use-cases",

    //testes e2e são executados somenta na pasta src/http
    //testes e2e sao demorados e nao queremos executar eles sempre
    "test:e2e": "vitest run --dir src/http",
```


### Testes e2e

Poucos testes e2e que vão do inicio ao fim e que testem as respostas positivas/sucesso de cada caso. Se formos criar
testes pra cada possível falha, teremos muitos testes.

Os testes unitários já cobrem as falhas por falta de informação ou informações enviadas erradas. Temos que tomar cuidado
ao criar os testes e2e para não exagerar.
