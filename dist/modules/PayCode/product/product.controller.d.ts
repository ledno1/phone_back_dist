import { OnModuleInit } from "@nestjs/common";
import { PayCodeProductService } from "@/modules/payCode/product/product.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class PayCodeProductController implements OnModuleInit {
    private readonly productService;
    constructor(productService: PayCodeProductService);
    onModuleInit(): void;
    page(query: any, user: IAdminUser): Promise<{
        list: any;
        pagination: {
            total: any;
            page: number;
            size: number;
        };
    }>;
    add(body: any, user: IAdminUser): any;
    edit(body: any, user: IAdminUser): any;
}
