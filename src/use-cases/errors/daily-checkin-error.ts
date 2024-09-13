export class DailyCheckInLimitError extends Error {

    constructor() {
        super('Daily check in limit reached.');
        
    }
}