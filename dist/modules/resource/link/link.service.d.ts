import { Repository } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { Link } from "@/entities/resource/link.entity";
import SysUser from "@/entities/admin/sys-user.entity";
import { ZhService } from "@/modules/resource/zh/zh.service";
import { ZH } from "@/entities/resource/zh.entity";
import { ChannelService } from "@/modules/resource/channel/channel.service";
import { AddLink } from "@/modules/resource/link/dto/dto";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
export declare class LinkService {
    private linkRepository;
    private userRepository;
    private zhRepository;
    private paramConfigService;
    private redisService;
    private zhService;
    private channelService;
    private util;
    constructor(linkRepository: Repository<Link>, userRepository: Repository<SysUser>, zhRepository: Repository<ZH>, paramConfigService: SysParamConfigService, redisService: RedisService, zhService: ZhService, channelService: ChannelService, util: UtilService);
    page(params: any, user: IAdminUser): Promise<Link[] | {
        list: any;
        pagination: {
            total: any;
            page: number;
            size: number;
        };
    }>;
    add(params: AddLink, user: IAdminUser): Promise<void>;
    edit(params: any, user: IAdminUser): Promise<string>;
    getLinkType(): Promise<any[]>;
    getLinkByAmount(amount: number | string): Promise<boolean>;
    reSetLinkStatus(oid: string, status?: number): Promise<void>;
    setLinkStatus(oid: string, status?: number): Promise<void>;
    setLinkCallback(oid: string): Promise<void>;
}
