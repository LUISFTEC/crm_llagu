// components/common/Navbar.jsx
function Navbar({ totalClientes, activeTab, onTabChange }) {
  return (
    <nav className="navbar navbar-dark bg-dark mb-4 shadow">
      <div className="container">
        <span className="navbar-brand h1">🏠 CRM Constructora Llagu</span>
        <div className="d-flex align-items-center gap-3">
          <div className="btn-group">
            <button 
              className={`btn ${activeTab === 'crm' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => onTabChange('crm')}
            >
              📊 CRM Ventas
            </button>
            <button 
              className={`btn ${activeTab === 'agenda' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => onTabChange('agenda')}
            >
              📅 Agenda / Citas
            </button>
          </div>
          <span className="text-white-50 small">
            Total clientes: {totalClientes}
          </span>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;  // ← AGREGA ESTA LÍNEA