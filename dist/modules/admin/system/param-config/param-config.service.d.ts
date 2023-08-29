import SysConfig from "src/entities/admin/sys-config.entity";
import { Repository } from "typeorm";
import { CreateParamConfigDto, UpdateParamConfigDto } from "./param-config.dto";
import { RedisService } from "@/shared/services/redis.service";
export declare class SysParamConfigService {
    private configRepository;
    private readonly redis;
    constructor(configRepository: Repository<SysConfig>, redis: RedisService);
    getConfigListByPage(page: number, count: number): Promise<SysConfig[]>;
    countConfigList(): Promise<number>;
    add(dto: CreateParamConfigDto): Promise<void>;
    update(dto: UpdateParamConfigDto): Promise<void>;
    updateValueByKey(key: any, value: any): Promise<void>;
    delete(ids: number[]): Promise<void>;
    findOne(id: number): Promise<SysConfig>;
    isExistKey(key: string): Promise<void | never>;
    findValueByKey(key: string): Promise<string | null>;
}
