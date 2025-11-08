import { useState } from "react";
import AuthorizationForm from "@/components/voter/authorization/AuthorizationForm";
import "../../style/voter/Authorization.model.css";
import AuthorizationHistory from "@/components/voter/authorization/AuthorizationHIstory";
import UserSelection from "@/components/voter/authorization/UserSelection";
import AuthorizationRequestForm from "@/components/voter/authorization/AuthorizationRequestForm";
import { User } from "@/types/User.interface";

type ViewMode = "selection" | "create" | "authorize";

const Authorization = () => {
    const [viewMode, setViewMode] = useState<ViewMode>("selection");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setViewMode("authorize");
    };

    const handleCreateNew = () => {
        setSelectedUser(null);
        setViewMode("create");
    };

    const handleBackToSelection = () => {
        setSelectedUser(null);
        setViewMode("selection");
    };

    return (
        <div>
            {viewMode === "selection" && (
                <UserSelection
                    onSelectUser={handleSelectUser}
                    onCreateNew={handleCreateNew}
                />
            )}
            {viewMode === "create" && (
                <div>
                    <AuthorizationForm onBack={handleBackToSelection} />
                </div>
            )}
            {viewMode === "authorize" && selectedUser && (
                <AuthorizationRequestForm
                    selectedUser={selectedUser}
                    onBack={handleBackToSelection}
                />
            )}
            <AuthorizationHistory />
        </div>
    );
};

export default Authorization;