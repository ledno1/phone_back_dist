import { GroupService } from './group.service';
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class GroupController {
    private readonly groupService;
    constructor(groupService: GroupService);
    page(query: any, user: IAdminUser): Promise<import("../../../entities/resource/group.entity").Group[] | {
        list: import("../../../entities/resource/group.entity").Group[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    add(body: any, user: IAdminUser): Promise<void>;
    edit(body: any, user: IAdminUser): Promise<void>;
}
