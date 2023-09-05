import { SysPay } from "@/modules/api/APIInterFace/interface";
import { OrderRedis } from "@/modules/api/subHandler/InerFace";
export interface PayCodeServiceHandler {
    nameKey: string | string[];
    result(params: SysPay, orderRedis: OrderRedis): Promise<any>;
    checkOrder(params: SysPay, orderRedis: OrderRedis): Promise<any>;
}
