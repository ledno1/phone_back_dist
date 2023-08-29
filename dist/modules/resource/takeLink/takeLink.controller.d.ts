import { TakeLinkService } from './takeLink.service';
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class TakeLinkController {
    private readonly takeLinkService;
    constructor(takeLinkService: TakeLinkService);
    page(query: any, user: IAdminUser): Promise<import("../../../entities/resource/takeLinkAPI.entity").TakeLink[] | {
        list: import("../../../entities/resource/takeLinkAPI.entity").TakeLink[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    add(body: any, user: IAdminUser): Promise<string>;
    edit(body: any, user: IAdminUser): Promise<void>;
}
