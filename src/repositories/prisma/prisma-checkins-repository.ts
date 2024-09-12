import { prisma } from "@/lib/prisma"
import { Prisma, CheckIn } from "@prisma/client"
import { CheckInsRepository } from "../interface-checkins-repository"

export class PrismaCheckInsRepository implements CheckInsRepository{
    async create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn> {
        const checkIn = await prisma.checkIn.create({
            data
        })

        return checkIn
    }

   
}