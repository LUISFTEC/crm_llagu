import { useState } from 'react';
import { auth } from './firebase-config';
import { signOut } from 'firebase/auth';
import { useAuth } from './hooks/useAuth';
import Login from './components/Auth/Login';
import Navbar from './components/common/Navbar';
import CRMClientes from './components/CRM/CRMClientes';
import AgendaCitas from './components/Agenda/AgendaCitas';
import LeadsList from './components/leads/LeadsList';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  const { user, loading, rol } = useAuth();
  const [activeTab, setActiveTab] = useState('crm');

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Navbar 
        totalClientes={0}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userEmail={user.email}
        userRol={rol}
        onLogout={handleLogout}
      />
      
      {activeTab === 'crm' && <CRMClientes />}
      {activeTab === 'agenda' && (
        <AgendaCitas onSwitchToCRM={() => setActiveTab('crm')} />
      )}
      {activeTab === 'pipeline' && rol === 'admin' && <LeadsList rol={rol} />}

    </div>
  );
}

export default App;