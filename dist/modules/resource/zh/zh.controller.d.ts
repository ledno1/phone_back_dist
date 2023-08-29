import { ZhService } from './zh.service';
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class ZhController {
    private readonly zhService;
    constructor(zhService: ZhService);
    findOne(query: any, user: IAdminUser): Promise<import("../../../entities/resource/zh.entity").ZH | import("../../../entities/resource/zh.entity").ZH[] | {
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    del(body: any, user: IAdminUser): Promise<void>;
    add(body: any, user: IAdminUser): Promise<void>;
    edit(body: any, user: IAdminUser): Promise<void>;
}
