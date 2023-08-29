import { PageOptionsDto } from '@/common/dto/page.dto';
export declare class DeleteRoleDto {
    roleIds: number[];
}
export declare class CreateRoleDto {
    name: string;
    label: string;
    remark: string;
    menus: number[];
    depts: number[];
}
export declare class UpdateRoleDto extends CreateRoleDto {
    roleId: number;
}
export declare class InfoRoleDto {
    roleId: number;
}
export declare class PageSearchRoleDto extends PageOptionsDto {
    name: string;
    label: string;
    remark: string;
}
