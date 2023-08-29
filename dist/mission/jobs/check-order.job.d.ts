import { OrderTopService } from "@/modules/api/top/orderTop.service";
export declare class CheckOrderJob {
    private topOrderService;
    constructor(topOrderService: OrderTopService);
    handle(): Promise<void>;
}
