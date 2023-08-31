import { CommissionService } from './commission.service';
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class CommissionController {
    private readonly commissionService;
    constructor(commissionService: CommissionService);
    page(query: any, user: IAdminUser): Promise<{
        list: any;
        pagination: {
            total: any;
            page: number;
            size: number;
        };
    }>;
    statistics(query: any, user: IAdminUser): Promise<{
        googleCodeBind: boolean;
    } | {
        ZHCount: any;
        todayOrder: any;
        todaySale: any;
        yesterdayOrder: any;
        yesterdaySale: any;
        link: any;
        sysOpen: boolean;
        googleCodeBind: boolean;
        channelList: any;
    }>;
    edit(body: any, user: IAdminUser): Promise<string | 1>;
}
