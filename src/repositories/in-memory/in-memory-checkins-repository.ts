import {  Prisma, CheckIn } from "@prisma/client";
import { CheckInsRepository } from "../interface-checkins-repository";
import { randomUUID } from "crypto";
import dayjs from "dayjs";


export class inMemoryCheckInsRepository implements CheckInsRepository {
    public items: CheckIn[] = []
    

    async save(checkIn: CheckIn) {
        const checkInIndex = this.items.findIndex(item => item.id === checkIn.id)

        if(checkInIndex >= 0) {
            this.items[checkInIndex] = checkIn
        }

        return checkIn
    }
    
    async findById(id: string) {
        const checkIn = this.items.find(item => item.id === id)

        if(!checkIn) {
            return null
        }

        return checkIn
    }
    
    async metricsById(userId: string) {
        return this.items
            .filter(item => item.user_id === userId)
            .length
    }

    async findManyByUserId(userId: string, page: number) {
        return this.items
            .filter(item => item.user_id === userId)
            .slice(
                (page -1) * 20,
                page * 20
            )
    }
    
    async findByUserIdOnDate(userId: string, date: Date) {
        const startOfTheDay = dayjs(date).startOf('date')
        const EndtOfTheDay = dayjs(date).endOf('date')

        const checkInSameDate = this.items.find((checkIn) => {
            const checkInDate = dayjs(checkIn.created_at)
            const isOnSameDate = checkInDate.isAfter(startOfTheDay) && checkInDate.isBefore(EndtOfTheDay)

            return checkIn.user_id === userId && isOnSameDate
        })

        if(!checkInSameDate) {
            return null
        }

        return checkInSameDate
    }
    
    async create(data: Prisma.CheckInUncheckedCreateInput) {
        
        const checkIn = {
            id: randomUUID(),
            created_at: new Date(),
            validated_at: data.validated_at ? new Date(data.validated_at) : null,
            user_id: data.user_id,
            gym_id: data.gym_id,
        }

        this.items.push(checkIn)

        return checkIn
    }

}