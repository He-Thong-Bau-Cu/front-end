import PermissionStats from "@/components/admin/management-permission/PermissionStats";
import ListPermissions from "@/components/admin/management-permission/ListPermissions";

const ManagementPermission = () => {
    return (
        <div style={{ padding: "20px 32px" }}>
            <PermissionStats />
            <ListPermissions />
        </div>
    );
};

export default ManagementPermission;
