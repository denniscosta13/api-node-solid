import { Environment } from 'vitest/environments';

const prismaEnvironment: Environment = {
    name: 'prisma',
    transformMode: 'ssr', // ou 'web', dependendo do seu caso
    async setup() {
        console.log('Antes dos testes');
        return {
            teardown() {
            console.log('Depois dos testes');
            },
        };
    },
};

export default prismaEnvironment;