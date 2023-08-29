import { ChannelService } from './channel.service';
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class ChannelController {
    private readonly channelService;
    constructor(channelService: ChannelService);
    page(query: any, user: IAdminUser): Promise<import("../../../entities/resource/channel.entity").Channel[] | {
        list: any;
        pagination: {
            total: any;
            page: number;
            size: number;
        };
    }>;
    add(body: any, user: IAdminUser): Promise<string>;
    edit(body: any, user: IAdminUser): Promise<void>;
}
