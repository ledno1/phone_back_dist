import { OrderTopService } from "@/modules/api/top/orderTop.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class OrderTopController {
    private readonly topService;
    constructor(topService: OrderTopService);
    page(query: any, user: IAdminUser): Promise<string | {
        totalAmount: any;
        totalSuccessCount: any;
        totalCount: any;
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    callback(body: any, user: IAdminUser): Promise<import("../../resource/link/dto/dto").NotifyResult>;
    statistic(query: any, user: IAdminUser): Promise<"日期格式不正确,例子:2020-01-01" | {
        查询时间: any;
        日期: any;
        成功总额: string;
        成功笔数: any;
        安卓成功率: string;
        苹果成功率: string;
        收银台成功率: string;
        总笔数: any;
        总额: string;
        合计总笔数: number;
        合计总额: string;
        失败总额: string;
        失败笔数: any;
        成功率: string;
    }>;
}
