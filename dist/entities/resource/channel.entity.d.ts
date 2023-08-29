import { BaseEntity } from "@/entities/base.entity";
import { TakeLink } from "@/entities/resource/takeLinkAPI.entity";
export declare class Channel extends BaseEntity {
    id: number;
    name: string;
    amountType: string;
    rate: string;
    strategy: number;
    isPublic: boolean;
    isUse: boolean;
    weight: number;
    expireTime: number;
    children: Channel[];
    parent: Channel;
    takeLinks: TakeLink[];
}
