import { MaService } from './ma.service';
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class MaController {
    private readonly proxyService;
    constructor(proxyService: MaService);
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
