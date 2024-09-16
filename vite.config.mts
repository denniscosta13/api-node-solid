import { defineConfig } from "vitest/config"
//import do package que le os paths customizados que criamos '@\'
import tsconfigPaths from "vite-tsconfig-paths" 

//aqui definimos a config do Vitest, passando o tsconfigPaths como plugin
//dessa forma o Vitest entende os caminhos de import customizados que criamos com '@\'
export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environmentMatchGlobs: [
            ['src/http/controllers/**', './prisma/vitest-environment-prisma/prisma-test-environment.ts']
        ],
        // pasta que deve procurar por testes
        dir: 'src',
    }
})
