import { Link, useLocation } from 'react-router-dom';
import { 
  DollarSign, 
  BarChart3, 
  CreditCard, 
  Target, 
  Wallet, 
  FileText, 
  TrendingUp, 
  Settings,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, onLogout }) {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/transactions', label: 'Transacciones', icon: CreditCard },
    { path: '/goals', label: 'Metas', icon: Target },
    { path: '/budgets', label: 'Presupuestos', icon: Wallet },
    { path: '/reports', label: 'Reportes', icon: FileText },
    { path: '/analysis', label: 'Análisis', icon: TrendingUp },
    { path: '/settings', label: 'Configuración', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  const handleOverlayClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      onLogout();
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para cerrar sidebar en móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-20 md:hidden sidebar-overlay"
          onClick={handleOverlayClick}
          role="button"
          tabIndex={0}
          aria-label="Cerrar menú"
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 
        bg-gray-900 border-r border-gray-800 shadow-2xl 
        transform transition-transform duration-300 ease-in-out 
        z-30 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-0
      `}>
        {/* Header del Sidebar */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-400 mr-3" />
            <h1 className="text-xl font-bold text-white">StonkyStonk</h1>
          </div>
          {/* Botón cerrar en móvil */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Navegación - Scroll disponible */}
        <nav className="mt-6 flex-1 overflow-y-auto px-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`
                  w-full flex items-center px-6 py-4 
                  text-left transition-all duration-200 group
                  ${active 
                    ? 'bg-green-800 text-green-100 border-r-4 border-green-400' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={`
                  h-5 w-5 mr-4 transition-colors flex-shrink-0
                  ${active ? 'text-green-400' : 'text-gray-400 group-hover:text-green-400'}
                `} />
                <span className="font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Botón de Cerrar Sesión */}
        <div className="p-6 border-t border-gray-800 bg-gray-900 mt-auto">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 bg-gray-800 text-gray-300 hover:bg-red-900 hover:text-white rounded-lg transition-all duration-200 group border border-gray-700 hover:border-red-700"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-5 w-5 mr-3 text-gray-400 group-hover:text-red-400 transition-colors flex-shrink-0" />
            <span className="font-medium truncate">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}