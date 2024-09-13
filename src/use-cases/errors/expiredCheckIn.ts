export class ExpiredCheckInError extends Error {

    constructor() {
        super('Check In expired. Aprove it in 20 minutes to validate.');
        
    }
}