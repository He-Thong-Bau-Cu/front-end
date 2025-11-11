import { useState } from "react";
import AuthorizationForm from "@/components/voter/authorization/AuthorizationForm";
import "../../style/voter/Authorization.model.css";
import AuthorizationHistory from "@/components/voter/authorization/AuthorizationHIstory";
import UserSelection from "@/components/voter/authorization/UserSelection";
import AuthorizationRequestForm from "@/components/voter/authorization/AuthorizationRequestForm";
import { User } from "@/types/User.interface";
import { useLocation } from "react-router-dom";

type ViewMode = "selection" | "create" | "authorize";

const Authorization = () => {
    const [viewMode, setViewMode] = useState<ViewMode>("selection");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const location = useLocation();

    const electionId = location.state?.electionId || localStorage.getItem("currentElectionId");
    const delegatorId = localStorage.getItem("userId");

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
                    electionId={electionId}
                    delegatorId={delegatorId}
                />
            )}
            <AuthorizationHistory />
        </div>
    );
};

export default Authorization;