import {  Prisma, CheckIn } from "@prisma/client";
import { CheckInsRepository } from "../interface-checkins-repository";
import { randomUUID } from "crypto";


export class inMemoryCheckInsRepository implements CheckInsRepository {
    public items: CheckIn[] = []
    
    async findByUserIdOnDate(userId: string, date: Date) {
        const checkInSameDate = this.items.find(checkIn => checkIn.user_id === userId)

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