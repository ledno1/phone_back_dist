import { OnModuleInit } from "@nestjs/common";
import { PayCodeServiceHandler } from "@/modules/code/subHandler/InerFace";
import { SysPay } from "@/modules/api/APIInterFace/interface";
import { OrderRedis } from "@/modules/api/subHandler/InerFace";
import { UtilService } from "@/shared/services/util.service";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { ProxyCharging } from "@/entities/resource/proxyChargin.entity";
import { EntityManager } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
export declare class KaKaCheckPhoneHandlerService implements PayCodeServiceHandler, OnModuleInit {
    private paramConfigService;
    private entityManager;
    private redis;
    private util;
    constructor(paramConfigService: SysParamConfigService, entityManager: EntityManager, redis: RedisService, util: UtilService);
    private user_id;
    private timeout;
    private retryCount;
    private retryOptions;
    private PhoneBlackListJoin;
    private redlock;
    onModuleInit(): Promise<void>;
    result(params: SysPay, orderRedis: OrderRedis): Promise<string>;
    nameKey: string | string[];
    checkOrder(params: SysPay, orderRedis: OrderRedis): Promise<KaKaCheckResult | KaKaCheckResult[]>;
    checkBalanceBase(pc: ProxyCharging): Promise<KaKaCheckResult>;
    checkBalance(orderRedis: OrderRedis): Promise<KaKaCheckResult>;
    isBlackPhoneBase(orderRedis: OrderRedis): Promise<BlackPhoneResult>;
    isBlackPhone(orderRedis: OrderRedis): Promise<BlackPhoneResult>;
    checkBalanceByPhoneAndOperator(phone: string, operator: string): Promise<any>;
}
export declare enum KaKaBalancePhoneOperator {
    DIANXIN = 33,
    YIDONG = 23,
    LIANTONG = 13
}
export declare enum BalanceCode {
    SUCCESS = 10000,
    SYSERROR = 10001,
    IPNOTINWHITELIST = 10013,
    SELFERROR = 10014
}
export declare class KaKaCheckResult {
    is: boolean;
    balance: number;
    msg?: string;
    errDate?: Date;
}
export declare class BlackPhone {
    code: BalanceCode;
    data: string;
}
export declare class BlackPhoneResult {
    is: boolean;
    msg?: string;
}
export declare class PhoneBalance {
    code: BalanceCode;
    msg: string;
    data: PhoneBalanceData;
}
export declare enum BlackType {
    LIANTONG = 1,
    YIDONG = 2,
    DIANXIN = 3
}
export declare class PhoneBalanceData {
    charge_num_type: string;
    curFee: number;
}
