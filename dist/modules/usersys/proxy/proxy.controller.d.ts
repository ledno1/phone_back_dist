import { ProxyService } from './proxy.service';
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class ProxyController {
    private readonly proxyService;
    constructor(proxyService: ProxyService);
    page(query: any, user: IAdminUser): Promise<{
        list: any;
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    add(body: any, user: IAdminUser): Promise<void>;
    del(body: any, user: IAdminUser): Promise<void>;
    edit(body: any, user: IAdminUser): Promise<void>;
    proxyDeduction(body: any, user: IAdminUser): Promise<void>;
}
