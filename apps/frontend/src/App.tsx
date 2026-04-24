import { Route, Routes } from "react-router-dom";
import { ROUTES } from "@/lib/constants/constants";
import Footer from "@components/ui/misc/Footer";
import Header from "@components/ui/misc/Header";
import RegisterPage from "@pages/session/RegisterPage";
import LandingPage from "@pages/home/LandingPage";

// Pages
import LoginPage from "@pages/session/LoginPage";

function App() {
  return (
    <div className="App">
      <Header />

      <div className="main-content">
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.LANDING} element={<LandingPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
