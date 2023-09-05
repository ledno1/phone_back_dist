import { OnModuleInit } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { PayCodeProduct } from "@/entities/paycode/product.entity";
export declare class PayCodeProductService implements OnModuleInit {
    private redisService;
    private entityManager;
    private util;
    constructor(redisService: RedisService, entityManager: EntityManager, util: UtilService);
    onModuleInit(): any;
    page(params: any, user: IAdminUser): Promise<PayCodeProduct[] | {
        list: any;
        pagination: {
            total: any;
            page: number;
            size: number;
        };
    }>;
    add(params: any, user: IAdminUser): any;
    edit(params: any, user: IAdminUser): Promise<any>;
    delete(params: any, user: any): any;
    getProductByIds(ids: number[] | string[]): Promise<PayCodeProduct[]>;
}
