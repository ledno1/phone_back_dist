import { OnModuleInit } from "@nestjs/common";
import { PayCodeServiceHandler } from "@/modules/code/subHandler/InerFace";
import { SysPay } from "@/modules/api/APIInterFace/interface";
import { OrderRedis } from "@/modules/api/subHandler/InerFace";
export declare class TestHandlerService implements PayCodeServiceHandler, OnModuleInit {
    checkBalanceByPhoneAndOperator(phone: string, operator: string): Promise<any>;
    isBlackPhone(orderRedis: OrderRedis): Promise<boolean>;
    onModuleInit(): any;
    result(params: SysPay, orderRedis: OrderRedis): Promise<any>;
    nameKey: string | string[];
    checkOrder(params: SysPay, orderRedis: OrderRedis): Promise<any>;
    checkBalance(orderRedis: OrderRedis): Promise<string>;
}
