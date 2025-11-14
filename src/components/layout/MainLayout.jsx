import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function MainLayout({ children, title, balance }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="layout-container">
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="layout-main">
        <Navbar 
          title={title}
          balance={balance}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="layout-content">
          <div className="layout-content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}