import { TopService } from './top.service';
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class TopController {
    private readonly topService;
    constructor(topService: TopService);
    page(query: any, user: IAdminUser): Promise<{
        list: import("../../../entities/admin/sys-user.entity").default[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    add(body: any, user: IAdminUser): Promise<void>;
    edit(body: any, user: IAdminUser): Promise<void>;
}
