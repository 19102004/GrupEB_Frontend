import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Usuarios from "./pages/Usuarios";
import Plastico from "./pages/Plastico";
import Cotizar from "./pages/Cotizar";
import Clientes from "./pages/Clientes"; 


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/plastico" element={<Plastico />} />
        <Route path="/cotizar" element={<Cotizar />} />
        <Route path="/clientes" element={<Clientes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
