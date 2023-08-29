import { Job } from 'bull';
import { OrderTopService } from "@/modules/api/top/orderTop.service";
import { ProxyChargingAPIService } from "@/modules/api/proxyChargingAPI.service";
import { ALiPayHandlerService } from "@/modules/api/subHandler/aLiPayHandler.service";
export declare class orderConsumer {
    private readonly orderTopService;
    private readonly proxyChargingAPIService;
    private readonly aLiPayHandlerService;
    constructor(orderTopService: OrderTopService, proxyChargingAPIService: ProxyChargingAPIService, aLiPayHandlerService: ALiPayHandlerService);
    transcode(job: Job<unknown>): Promise<void>;
    phoneOrderOutTime(job: Job<unknown>): Promise<void>;
    WXOrderOutTime(job: Job<unknown>): Promise<void>;
    proxyChargingReset(job: Job<unknown>): Promise<void>;
}
