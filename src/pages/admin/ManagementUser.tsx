import UserList from "@/components/admin/management-user/UserList";
import UserStats from "@/components/admin/management-user/UserStats";

const ManagementUser = () => {

    return (
        <div>
            <UserStats />
            <UserList />

        </div>
    )

}

export default ManagementUser;