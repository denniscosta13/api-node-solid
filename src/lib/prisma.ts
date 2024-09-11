// define os parametros do client do prisma e exporta a instancia
// usamos essa instancia para realizar as transacoes do banco de dados

import { env } from "@/env";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
    log: env.NODE_ENV === 'dev' ? ['query'] : []
})