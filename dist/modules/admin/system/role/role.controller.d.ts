import { PaginatedResponseDto } from 'src/common/class/res.class';
import SysRole from 'src/entities/admin/sys-role.entity';
import { IAdminUser } from '../../admin.interface';
import { SysMenuService } from '../menu/menu.service';
import { RoleInfo } from './role.class';
import { CreateRoleDto, DeleteRoleDto, InfoRoleDto, PageSearchRoleDto, UpdateRoleDto } from './role.dto';
import { SysRoleService } from './role.service';
export declare class SysRoleController {
    private roleService;
    private menuService;
    constructor(roleService: SysRoleService, menuService: SysMenuService);
    list(): Promise<SysRole[]>;
    page(dto: PageSearchRoleDto): Promise<PaginatedResponseDto<SysRole>>;
    delete(dto: DeleteRoleDto): Promise<void>;
    add(dto: CreateRoleDto, user: IAdminUser): Promise<void>;
    update(dto: UpdateRoleDto): Promise<void>;
    info(dto: InfoRoleDto): Promise<RoleInfo>;
}
