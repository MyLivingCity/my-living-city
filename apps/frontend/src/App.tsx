import { Route, Routes } from "react-router-dom";
import Footer from "../../frontend/src/components/ui/Footer";
import Header from "../../frontend/src/components/ui/Header";

// Pages
import LoginPage from "./pages/session/LoginPage";

function App() {
  return (
    <div className="App">
      <Header />

      <div className="main-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
