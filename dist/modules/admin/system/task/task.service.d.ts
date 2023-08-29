import { OnModuleInit } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Queue } from 'bull';
import SysTask from 'src/entities/admin/sys-task.entity';
import { LoggerService } from 'src/shared/logger/logger.service';
import { RedisService } from 'src/shared/services/redis.service';
import { Repository } from 'typeorm';
import { CreateTaskDto, UpdateTaskDto } from './task.dto';
export declare class SysTaskService implements OnModuleInit {
    private taskRepository;
    private taskQueue;
    private moduleRef;
    private reflector;
    private redisService;
    private logger;
    constructor(taskRepository: Repository<SysTask>, taskQueue: Queue, moduleRef: ModuleRef, reflector: Reflector, redisService: RedisService, logger: LoggerService);
    onModuleInit(): Promise<void>;
    initTask(): Promise<void>;
    page(page: number, count: number): Promise<SysTask[]>;
    count(): Promise<number>;
    info(id: number): Promise<SysTask>;
    delete(task: SysTask): Promise<void>;
    once(task: SysTask): Promise<void | never>;
    addOrUpdate(param: CreateTaskDto | UpdateTaskDto): Promise<void>;
    start(task: SysTask): Promise<void>;
    stop(task: SysTask): Promise<void>;
    existJob(jobId: string): Promise<boolean>;
    updateTaskCompleteStatus(tid: number): Promise<void>;
    checkHasMissionMeta(nameOrInstance: string | unknown, exec: string): Promise<void | never>;
    callService(serviceName: string, args: string): Promise<void>;
    safeParse(args: string): unknown | string;
}
