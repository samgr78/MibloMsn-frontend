import { Route, Routes } from "react-router-dom";
import Login from "./features/auth/Login.tsx";
import { RegisterPage } from "./features/auth/pages/RegisterPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;
