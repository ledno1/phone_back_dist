import SysRoleDepartment from 'src/entities/admin/sys-role-department.entity';
import SysRoleMenu from 'src/entities/admin/sys-role-menu.entity';
import SysRole from 'src/entities/admin/sys-role.entity';
import SysUserRole from 'src/entities/admin/sys-user-role.entity';
import { EntityManager, Repository } from 'typeorm';
import { AdminWSService } from 'src/modules/ws/admin-ws.service';
import { CreateRoleDto, PageSearchRoleDto, UpdateRoleDto } from './role.dto';
import { CreatedRoleId, RoleInfo } from './role.class';
export declare class SysRoleService {
    private roleRepository;
    private roleMenuRepository;
    private roleDepartmentRepository;
    private userRoleRepository;
    private entityManager;
    private rootRoleId;
    private adminWSService;
    constructor(roleRepository: Repository<SysRole>, roleMenuRepository: Repository<SysRoleMenu>, roleDepartmentRepository: Repository<SysRoleDepartment>, userRoleRepository: Repository<SysUserRole>, entityManager: EntityManager, rootRoleId: number, adminWSService: AdminWSService);
    list(): Promise<SysRole[]>;
    count(): Promise<number>;
    info(rid: number): Promise<RoleInfo>;
    delete(roleIds: number[]): Promise<void>;
    add(param: CreateRoleDto, uid: number): Promise<CreatedRoleId>;
    update(param: UpdateRoleDto): Promise<SysRole>;
    page(param: PageSearchRoleDto): Promise<[SysRole[], number]>;
    getRoleIdByUser(id: number): Promise<number[]>;
    countUserIdByRole(ids: number[]): Promise<number | never>;
}
