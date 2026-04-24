import React, { useState, useEffect, useRef } from 'react';
// 1. Importamos los componentes necesarios de FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChartBar, faCalendarAlt, faBullseye, faSignOutAlt, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ activeTab, onTabChange, userEmail, userRol, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el menú al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para manejar el cambio de pestaña y cerrar menú
  const handleTabClick = (tab) => {
    onTabChange(tab);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
      <div className="container">
        {/* Logo / Marca - Usamos FontAwesome faHome */}
        <div 
          className="navbar-brand d-flex align-items-center fw-bold" 
          style={{ cursor: 'pointer' }}
          onClick={() => onTabChange('crm')}
        >
          <FontAwesomeIcon icon={faHome} className="me-2 text-primary" />
          <span className="d-none d-sm-inline">CRM Constructora Llagu</span>
        </div>

        {/* Grupo de Navegación Central */}
        <div className="btn-group mx-auto">
          {/* Usamos NavButton actualizado con iconos de FontAwesome */}
          <NavButton 
            active={activeTab === 'crm'} 
            onClick={() => handleTabClick('crm')}
            iconObj={faChartBar} 
            label="CRM" 
          />
          <NavButton 
            active={activeTab === 'agenda'} 
            onClick={() => handleTabClick('agenda')}
            iconObj={faCalendarAlt} 
            label="Agenda" 
          />
          <NavButton 
            active={activeTab === 'pipeline'} 
            onClick={() => handleTabClick('pipeline')}
            iconObj={faBullseye} 
            label="Pipeline" 
          />
          <NavButton 
            active={activeTab === 'finanzas'} 
            onClick={() => handleTabClick('finanzas')}
            iconObj={faMoneyBillWave} 
            label="Finanzas" 
          />
        </div>

        {/* Perfil de Usuario / Dropdown */}
        <div className="dropdown" ref={dropdownRef}>
          <button 
            className={`btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2 ${isMenuOpen ? 'show' : ''}`}
            type="button" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {/* Mantenemos el círculo de iniciales personalizado (no es emoji) */}
            <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '12px' }}>
              {userEmail?.charAt(0).toUpperCase()}
            </div>
            <span className="d-none d-md-inline small">{userEmail}</span>
          </button>
          
          <ul className={`dropdown-menu dropdown-menu-end shadow-lg ${isMenuOpen ? 'show' : ''}`} 
              style={{ position: 'absolute', right: 0 }}>
            <li>
              <div className="dropdown-item-text">
                <small className="text-muted d-block">Conectado como:</small>
                <span className="fw-bold text-capitalize">{userRol}</span>
              </div>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              {/* Botón de Cerrar Sesión con icono FontAwesome faSignOutAlt */}
              <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={onLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

// Sub-componente para botones de navegación actualizado para aceptar objeto de icono de FontAwesome
const NavButton = ({ active, onClick, iconObj, label }) => (
  <button 
    className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline-primary border-0 text-white'}`}
    onClick={onClick}
    style={{ transition: 'all 0.3s' }}
  >
    {/* Renderizamos el icono de FontAwesome */}
    {iconObj && <FontAwesomeIcon icon={iconObj} className="me-1" />}
    <span className="d-none d-md-inline">{label}</span>
  </button>
);

export default Navbar;