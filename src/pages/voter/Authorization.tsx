import AuthorizationForm from "@/components/voter/authorization/AuthorizationForm";
import '../../style/voter/Authorization.model.css'
import AuthorizationHistory from "@/components/voter/authorization/AuthorizationHIstory";

const Authorization = () => {
    return (
        <div>
            <AuthorizationForm />
            <AuthorizationHistory />
        </div>
    )
}

export default Authorization;