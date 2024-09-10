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

## Fastify

Criamos 2 arquivos:

- app.ts: importa o `fastify` e o atribui a uma *const* **app**, que é exportada.
- server.ts: importa **app** e chama o seu método `listen`, passando `host: '0.0.0.0'` e a porta.

## Enviroment Variables

Instalar a biblioteca `dotenv` que expõe a variável `process.env` do nosso sistema: 

```sh
npm i dotenv
```

Para organizar melhor, criamos uma pasata `env` dentro de `src` e criamos o arquivo `index.ts`:

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
validação numa variávei, que é possível verificar se teve sucesso, em caso de erro, nos dá o erro e se passou na validação
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