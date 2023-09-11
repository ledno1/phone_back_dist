import { SysPay } from "@/modules/api/APIInterFace/interface";
import { OrderRedis } from "@/modules/api/subHandler/InerFace";
export declare enum PhoneResult {
    SUCCESS = "SUCCESS",
    FAIL = "FAIL",
    TIMEOUT = "TIMEOUT"
}
export interface PayCodeServiceHandler {
    nameKey: string | string[];
    result(params: SysPay, orderRedis: OrderRedis): Promise<any>;
    checkOrder(params: SysPay, orderRedis: OrderRedis): Promise<any>;
    checkBalance(orderRedis: OrderRedis): Promise<any>;
    isBlackPhone(orderRedis: OrderRedis): Promise<any>;
}
