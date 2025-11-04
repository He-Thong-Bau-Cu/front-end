import HomeHeader from "@/components/head_of_the_organizing_committee/homepage/HomeHeader";
import HomeStats from "@/components/head_of_the_organizing_committee/homepage/HomeStats";
import MeetingList from "@/components/head_of_the_organizing_committee/homepage/MeetingList";
import "../../style/head-of-the-organizing-committee/Homepage.model.css"
const HomePage: React.FC = () => (
    <div className="home-container">
        <HomeHeader />
        <HomeStats />
        <MeetingList />
    </div>
);

export default HomePage;
