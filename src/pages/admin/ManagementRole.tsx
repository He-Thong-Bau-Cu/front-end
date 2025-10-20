import ListRoles from '@/components/admin/management-role/ListRoles';
import RoleStats from '@/components/admin/management-role/RoleStats';


const ManagementRole = () => {

    return (
        <div style={{ padding: '30px 30px', minHeight: '100vh' }}>
            <RoleStats />
            <ListRoles />

        </div>
    );
};

export default ManagementRole;
