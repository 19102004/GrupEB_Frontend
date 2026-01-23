import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Usuarios from "./pages/Usuarios";
import Plastico from "./pages/Plastico";
import Cotizar from "./pages/Cotizar";
import Clientes from "./pages/Clientes"; 
import PrecioPlastico from "./pages/PrecioPlastico";
import Diseno from "./pages/Diseno";
import AnticipoLiquidacion from "./pages/AnticipoLiquidacion";
import Seguimiento from "./pages/Seguimiento";
import Pedido from "./pages/Pedido";

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
        <Route path="/precioplastico" element={<PrecioPlastico />} />
        <Route path="/diseno" element={<Diseno />} />
        <Route path="/anticipolicacion" element={<AnticipoLiquidacion />} />
        <Route path="/seguimiento" element={<Seguimiento />} />
        <Route path="/pedido" element={<Pedido />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
