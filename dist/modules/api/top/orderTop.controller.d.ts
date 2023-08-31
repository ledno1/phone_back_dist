import { OrderTopService } from "@/modules/api/top/orderTop.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class OrderTopController {
    private readonly topService;
    constructor(topService: OrderTopService);
    page(query: any, user: IAdminUser): Promise<{
        totalAmount: any;
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    callback(body: any, user: IAdminUser): Promise<void>;
}
