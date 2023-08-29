import { getoneNewtestDto } from "./dto/create-newtest.dto";
import { SelfFile } from "./dto/update-newtest.dto";
import { EntityManager, Repository } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { Newtest } from "@/entities/newTest/newtest.entity";
export declare class NewtestService {
    private newtestRepository;
    private redisService;
    private entityManager;
    private util;
    constructor(newtestRepository: Repository<Newtest>, redisService: RedisService, entityManager: EntityManager, util: UtilService);
    findOne(params: getoneNewtestDto): Promise<string>;
    upfile(file: SelfFile): Promise<string>;
}
