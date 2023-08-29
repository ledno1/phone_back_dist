import { EntityManager, Repository } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { ZH } from "@/entities/resource/zh.entity";
import { IAdminUser } from "@/modules/admin/admin.interface";
import SysUser from "@/entities/admin/sys-user.entity";
import { ZhPage } from "@/modules/resource/zh/interface";
import { Link } from "@/entities/resource/link.entity";
export declare class ZhService {
    private zhRepository;
    private linkRepository;
    private userRepository;
    private entityManager;
    private redisService;
    private util;
    constructor(zhRepository: Repository<ZH>, linkRepository: Repository<Link>, userRepository: Repository<SysUser>, entityManager: EntityManager, redisService: RedisService, util: UtilService);
    page(params: ZhPage, user: IAdminUser): Promise<ZH | ZH[] | {
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    getPageByGroup(params: ZhPage, userid: number): Promise<ZH[]>;
    getPageByStatic(params: ZhPage, userid: number): Promise<{
        list: ZH[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    getCookieByZuid(zuid: string, userid: number): Promise<ZH>;
    getInstantiationByZuid(zuid: string | string[], userid: number): Promise<ZH | ZH[]>;
    getByPage(params: ZhPage, userid: number): Promise<{
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    del(params: any, user: IAdminUser): Promise<void>;
    add(params: any, user: IAdminUser): Promise<void>;
    addByFile(filePath: any, userinfo: any): Promise<void>;
    getZhQueueById(id: string, amount: number): Promise<ZH[]>;
    updateLockLimitByZuid(zuid: string, amount: number): Promise<void>;
    edit(params: any, user: IAdminUser): Promise<void>;
    updateZhClose(accountNumber: string): Promise<void>;
    checkHaveLOid(zh: ZH, loid: string): Promise<boolean | "">;
}
