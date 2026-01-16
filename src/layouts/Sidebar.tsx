import { useState, useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/grupeblanco.png";

interface DashboardProps {
  userName: string;
  children: ReactNode;
}

interface MenuItem {
  name: string;
  path?: string;
  subItems: { name: string; path: string }[];
}

export default function Dashboard({ userName, children }: DashboardProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setOpen(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Expandir menú automáticamente si un subItem está activo
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems.some((sub) => location.pathname.startsWith(sub.path))) {
        setExpandedMenus((prev) =>
          prev.includes(item.name) ? prev : [...prev, item.name]
        );
      }
    });
  }, [location.pathname]);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    );
  };

  const menuItems: MenuItem[] = [
    { name: "Usuarios", path: "/usuarios", subItems: [] },
     { name: "Clientes", path: "/clientes", subItems: [] },
    {
      name: "Dar alta productos",
      subItems: [
        { name: "Plástico", path: "/plastico" },
        { name: "Papel", path: "/papel" },
        { name: "Cartón", path: "/carton" },
      ],
    },
    { name: "Cotización", path: "/cotizar", subItems: [] },
    { name: "Pedido", path: "/pedido", subItems: [] },
    { name: "Producción", path: "/produccion", subItems: [] },
    {
      name: "Ventas",
      subItems: [
        { name: "Anticipo / Liquidación", path: "/ventas/anticipo" },
        { name: "Seguimiento", path: "/ventas/seguimiento" },
      ],
    },
    {
      name: "Precios productos",
      subItems: [
        { name: "Plástico", path: "/plasticoP" },
        { name: "Papel", path: "/papelP" },
        { name: "Cartón", path: "/cartonP" },
      ],
    },
  ];

  const isActive = (path?: string) =>
    path && location.pathname.startsWith(path);

  const renderMenuItem = (item: MenuItem) => {
    const hasSubItems = item.subItems.length > 0;
    const isExpanded = expandedMenus.includes(item.name);
    const activeParent =
      item.path && isActive(item.path)
        ? true
        : item.subItems.some((s) => isActive(s.path));

    return (
      <div key={item.name}>
        <button
          onClick={() => {
            if (hasSubItems) {
              toggleMenu(item.name);
            } else if (item.path) {
              navigate(item.path);
              if (isMobile) setOpen(false);
            }
          }}
          className={`w-full text-left px-3 py-2 rounded transition flex items-center justify-between
            ${
              activeParent
                ? "bg-slate-700 text-white font-semibold"
                : "text-slate-300 hover:bg-slate-700"
            }`}
        >
          <span>{item.name}</span>

          {hasSubItems && (
            <span
              className={`transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          )}
        </button>

        {hasSubItems && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.subItems.map((sub) => (
              <button
                key={sub.name}
                onClick={() => {
                  navigate(sub.path);
                  if (isMobile) setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded transition text-sm
                  ${
                    isActive(sub.path)
                      ? "bg-slate-600 text-white font-semibold"
                      : "text-slate-300 hover:bg-slate-600"
                  }`}
              >
                • {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* OVERLAY móvil */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR MÓVIL */}
      {isMobile && open && (
        <aside
          className="fixed inset-y-0 left-0 w-64 bg-slate-800 flex flex-col shadow-lg z-20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <img
              src={logo}
              alt="Grupeb"
              className="h-10 w-auto cursor-pointer"
              onClick={() => {
                navigate("/home");
                setOpen(false);
              }}
            />

            <button
              onClick={() => setOpen(false)}
              className="text-slate-300 hover:text-white text-2xl font-bold"
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map(renderMenuItem)}
          </nav>

          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2 text-white">
              <span className="text-lg">👤</span>
              <span className="text-sm">{userName}</span>
            </div>
          </div>
        </aside>
      )}

      {/* SIDEBAR DESKTOP */}
      {!isMobile && (
        <aside className="w-64 bg-slate-800 flex flex-col shadow-lg">
          <div
            className="p-4 border-b border-slate-700 cursor-pointer"
            onClick={() => navigate("/home")}
          >
            <img src={logo} alt="Grupeb" className="h-10 w-auto mx-auto" />
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map(renderMenuItem)}
          </nav>

          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2 text-white">
              <span className="text-lg">👤</span>
              <span className="text-sm">{userName}</span>
            </div>
          </div>
        </aside>
      )}

      {/* CONTENIDO */}
      <main className="flex-1 overflow-auto">
        {isMobile && (
          <header className="shadow-lg sticky top-0 z-5">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setOpen(true)}
                className="p-2 hover:bg-slate-200 rounded text-xl"
              >
                ☰
              </button>

              <h1
                className="text-xl font-bold tracking-wide cursor-pointer"
                onClick={() => navigate("/home")}
              >
                GRUPEB
              </h1>

              <div className="flex items-center gap-2 bg-slate-200 rounded-lg px-3 py-2">
                <span className="text-lg">👤</span>
                <span className="text-sm">{userName}</span>
              </div>
            </div>
          </header>
        )}

        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
