import { SysPay } from "@/modules/api/APIInterFace/interface";
import { OrderRedis } from "@/modules/api/subHandler/InerFace";
export interface PayCodeServiceHandler {
    result(params: SysPay, orderRedis: OrderRedis): Promise<void>;
}
