import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import CommunityPage from "./pages/CommunityPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import JoinTeamPage from "./pages/JoinTeamPage";
import BetaTestingPage from "./pages/BetaTestingPage";
import SupportPage from "./pages/SupportPage";
import SuccessfullySubscribedPage from "./pages/SuccessfullySubscribedPage";
import BetaCredentialsPage from "./pages/BetaCredentialsPage";
import WaitingPage from "./pages/WaitingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="/join-team" element={<JoinTeamPage />} />
        <Route path="/beta-testing" element={<BetaTestingPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/waiting" element={<WaitingPage />} />
        <Route path="/successfully-subscribed" element={<SuccessfullySubscribedPage />} />
        <Route path="/beta-credentials" element={<BetaCredentialsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
