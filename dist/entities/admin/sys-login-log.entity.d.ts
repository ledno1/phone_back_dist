import { BaseEntity } from '../base.entity';
export default class SysLoginLog extends BaseEntity {
    id: number;
    userId: number;
    ip: string;
    loginLocation: string;
    time: Date;
    ua: string;
}
