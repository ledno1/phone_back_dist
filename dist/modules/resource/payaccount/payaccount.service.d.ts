import { OnModuleInit } from "@nestjs/common";
import { EntityManager, Repository } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
import SysUser from "@/entities/admin/sys-user.entity";
import { ZhPage } from "@/modules/resource/zh/interface";
import { PayAccount } from "@/entities/resource/payaccount.entity";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
declare enum CheckStatus {
    "success" = "success",
    "deny" = "deny",
    "failed" = "failed",
    "error" = "error"
}
export declare class PayAccountService implements OnModuleInit {
    private payAccountRepository;
    private userRepository;
    private entityManager;
    private paramConfigService;
    private redisService;
    private util;
    private revisionInfo;
    private task_page_map;
    private mainFrameUrl;
    private pupHost;
    constructor(payAccountRepository: Repository<PayAccount>, userRepository: Repository<SysUser>, entityManager: EntityManager, paramConfigService: SysParamConfigService, redisService: RedisService, util: UtilService);
    onModuleInit(): Promise<void>;
    page(params: ZhPage, user: IAdminUser): Promise<1 | {
        list: any;
        pagination: {
            total: any;
            page: number;
            size: number;
        };
    }>;
    getByPage(params: any, userid: number): Promise<{
        list: any;
        pagination: {
            total: any;
            page: number;
            size: number;
        };
    }>;
    del(params: any, user: IAdminUser): Promise<void>;
    add(params: any, user: IAdminUser): Promise<1 | 0 | {
        image: any;
        id: any;
        cookies?: undefined;
        uid?: undefined;
    } | {
        cookies: string;
        uid: any;
        image?: undefined;
        id?: undefined;
    } | {
        cookies: string;
        image?: undefined;
        id?: undefined;
        uid?: undefined;
    }>;
    addAppid(params: any, user: IAdminUser): Promise<number>;
    edit(params: any, user: IAdminUser): Promise<{
        code: number;
        msg: string;
        address?: undefined;
    } | {
        code: number;
        address: string;
        msg?: undefined;
    }>;
    requestApi(uid: string, cookies: string, ctoken: string): Promise<boolean | Array<any> | CheckStatus>;
}
export {};
