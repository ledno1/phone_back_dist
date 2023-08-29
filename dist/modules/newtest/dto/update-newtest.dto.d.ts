/// <reference types="node" />
import { CreateNewtestDto } from './create-newtest.dto';
declare const UpdateNewtestDto_base: import("@nestjs/common").Type<Partial<CreateNewtestDto>>;
export declare class UpdateNewtestDto extends UpdateNewtestDto_base {
}
export declare class SelfFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
export {};
