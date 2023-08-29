import SysLoginLog from 'src/entities/admin/sys-login-log.entity';
import SysTaskLog from 'src/entities/admin/sys-task-log.entity';
import SysUser from 'src/entities/admin/sys-user.entity';
import { Repository } from 'typeorm';
import { LoginLogInfo, TaskLogInfo } from './log.class';
import { UtilService } from '@/shared/services/util.service';
export declare class SysLogService {
    private loginLogRepository;
    private taskLogRepository;
    private userRepository;
    private readonly utilService;
    constructor(loginLogRepository: Repository<SysLoginLog>, taskLogRepository: Repository<SysTaskLog>, userRepository: Repository<SysUser>, utilService: UtilService);
    saveLoginLog(uid: number, ip: string, ua: string): Promise<void>;
    countLoginLog(): Promise<number>;
    pageGetLoginLog(page: number, count: number): Promise<LoginLogInfo[]>;
    clearLoginLog(): Promise<void>;
    recordTaskLog(tid: number, status: number, time?: number, err?: string): Promise<number>;
    countTaskLog(): Promise<number>;
    page(page: number, count: number): Promise<TaskLogInfo[]>;
    clearTaskLog(): Promise<void>;
}
