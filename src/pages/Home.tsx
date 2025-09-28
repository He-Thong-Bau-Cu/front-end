import { Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <Button type="primary" onClick={() => navigate("/elections")}>
        Election List
      </Button>
    </div>
  );
};

export default Home;
