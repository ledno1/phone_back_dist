import { OnModuleInit } from "@nestjs/common";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { IpBackListService } from "@/modules/resource/ipbacklist/ipBackList.service";
export declare class IpBackListController implements OnModuleInit {
    private backIpService;
    constructor(backIpService: IpBackListService);
    onModuleInit(): void;
    findOne(query: any, user: IAdminUser): Promise<{
        list: import("../../../entities/resource/backip.entity").BackIP[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    add(body: any, user: IAdminUser): Promise<number>;
    edit(body: any, user: IAdminUser): Promise<number>;
}
