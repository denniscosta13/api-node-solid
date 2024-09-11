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

