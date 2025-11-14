// src/components/layout/Navbar.jsx
export default function Navbar({ title, balance, onMenuClick }) {
  return (
    <header className="navbar">
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="navbar-menu-btn"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="navbar-title">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="navbar-balance">
          ${balance?.toLocaleString('es-CL') || '0'}
        </span>
      </div>
    </header>
  );
}