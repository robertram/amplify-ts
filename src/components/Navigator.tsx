import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "../App.css";
import Profile from "../components/Profile";

const Navigator = ({}) => {
  const ProfileItems = (props: any) => (
    <div className="Navigation">
      <a href="/" className="NavigationItem">
        Home
      </a>
      <a href="/profile" className="NavigationItem">
        Profile
      </a>
    </div>
  );

  return (
    <div className="Navigator">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProfileItems />}>
            Home
          </Route>{" "}
          <Route path="/profile" element={<ProfileItems />}>
            Profile
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default Navigator;
