import { Layout } from "antd";
import CreateMeetingAttendeePanel from "@/components/organizing-committee/create-meeting-attendee/CreateMeetingAttendeePanel";

const CreateMeetingAttendee: React.FC = () => {
    return (
        <Layout style={{ background: "#F3F8F3", minHeight: "100vh", padding: "20px" }}>
            <CreateMeetingAttendeePanel />
        </Layout>
    );
};

export default CreateMeetingAttendee;
