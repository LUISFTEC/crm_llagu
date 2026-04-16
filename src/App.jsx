// App.jsx
import { useState } from 'react';
import Navbar from './components/common/Navbar';
import CRMClientes from './components/CRM/CRMClientes';
import AgendaCitas from './components/Agenda/AgendaCitas';
import { useClientes } from './hooks/useClientes';

function App() {
  const [activeTab, setActiveTab] = useState('crm');
  const { clientes } = useClientes();

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Navbar 
        totalClientes={clientes.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {activeTab === 'crm' && <CRMClientes />}
      {activeTab === 'agenda' && (
        <AgendaCitas onSwitchToCRM={() => setActiveTab('crm')} />
      )}
    </div>
  );
}

export default App;