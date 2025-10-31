import { Avatar, Tag } from "antd";
import VerifyDelegateActions from "./VerifyDelegateActions";


// 💡 Tạo interface Delegate
interface Delegate {
    id: string;
    name: string;
    code: string;
    unit: string;
    email: string;
    type: string;
    status: string;
}

// 💡 Tạo interface cho props
interface DelegateDetailProps {
    delegate: Delegate | null;
}

const DelegateDetail: React.FC<DelegateDetailProps> = ({ delegate }) => {
    if (!delegate) return <div className="delegate-detail">Chưa chọn đại biểu</div>;

    return (
        <div className="delegate-detail">
            <Avatar size={120} style={{ backgroundColor: "#f0f0f0" }} />
            <h2 className="delegate-name">{delegate.name}</h2>
            <Tag
                color={delegate.status === "ĐÃ CHECK-IN" ? "green" : "orange"}
                className="delegate-status"
            >
                {delegate.status}
            </Tag>

            <table className="delegate-info">
                <tbody>
                    <tr>
                        <td>Mã Đại biểu</td>
                        <td>{delegate.code}</td>
                    </tr>
                    <tr>
                        <td>Đơn vị</td>
                        <td>{delegate.unit}</td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td>{delegate.email}</td>
                    </tr>
                    <tr>
                        <td>Loại vé</td>
                        <td>{delegate.type}</td>
                    </tr>
                </tbody>
            </table>

            <VerifyDelegateActions />
        </div>
    );
};

export default DelegateDetail;
