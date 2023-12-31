import { OnModuleInit } from "@nestjs/common";
import { PayCodeProductService } from "@/modules/code/product/product.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class PayCodeProductController implements OnModuleInit {
    private readonly productService;
    constructor(productService: PayCodeProductService);
    onModuleInit(): void;
    page(query: any, user: IAdminUser): Promise<import("../../../entities/paycode/product.entity").PayCodeProduct[] | {
        list: any;
        pagination: {
            total: any;
            page: number;
            size: number;
        };
    }>;
    add(body: any, user: IAdminUser): any;
    edit(body: any, user: IAdminUser): Promise<any>;
}
