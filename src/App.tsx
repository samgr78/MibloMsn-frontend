import { Route, Routes } from "react-router-dom";
import Login from "./features/auth/Login.tsx";
import Register from "./features/auth/Register.tsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
