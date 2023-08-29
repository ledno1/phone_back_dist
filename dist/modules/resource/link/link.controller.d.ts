import { LinkService } from './link.service';
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class LinkController {
    private readonly linkService;
    constructor(linkService: LinkService);
    page(query: any, user: IAdminUser): Promise<import("../../../entities/resource/link.entity").Link[] | {
        list: any;
        pagination: {
            total: any;
            page: number;
            size: number;
        };
    }>;
    add(body: any, user: IAdminUser): Promise<void>;
    edit(body: any, user: IAdminUser): Promise<string>;
}
