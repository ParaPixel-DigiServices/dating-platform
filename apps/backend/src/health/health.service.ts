import { Injectable } from '@nestjs/common';
import { timeStamp } from 'console';

@Injectable()
export class HealthService {
    getHealth(){
        return{
            status: 'ok',
            timeStamp: new Date().toISOString(),
        };
    }
}
