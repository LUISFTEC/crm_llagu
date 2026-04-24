// components/Finanzas/FinanzasLista.jsx
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useClientes } from '../../hooks/useClientes';
import { usePlanesPago } from '../../hooks/usePlanesPago';
import { collection, query, where, getDocs, doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase-config';

function FinanzasLista() {
  const { clientes, loading } = useClientes();
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [planesMap, setPlanesMap] = useState({});
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  
  const cacheTimestamp = useRef(0);
  const mountedRef = useRef(true);
  const CACHE_DURATION = 60000;

  // ✅ OPTIMIZACIÓN: Filtro memoizado
  const clientesConPlanPago = useMemo(() => {
    return clientes.filter(c => c.estadoVenta === 'Financió' || c.estadoVenta === 'Separó');
  }, [clientes]);

  // 🚀 CARGA ULTRARRÁPIDA - ESTRATEGIA DE SUBCOLECCIÓN
  useEffect(() => {
    mountedRef.current = true;

    const cargarPlanes = async () => {
      if (clientesConPlanPago.length === 0) {
        setPlanesMap({});
        return;
      }

      // Verificar caché
      const ahora = Date.now();
      if (ahora - cacheTimestamp.current < CACHE_DURATION && Object.keys(planesMap).length > 0) {
        console.log('⚡ Usando caché - 0 consultas');
        return;
      }

      setLoadingPlanes(true);
      console.log(`🔄 Iniciando carga para ${clientesConPlanPago.length} clientes`);
      
      try {
        // 🎯 ESTRATEGIA 1: Intentar cargar desde subcolección (RÁPIDO)
        const planesTemp = {};
        const resultadosSubcoleccion = await Promise.allSettled(
          clientesConPlanPago.map(async (cliente) => {
            try {
              // Intentar obtener de subcolección: /clientes/{id}/planPago
              const planRef = collection(db, 'clientes', cliente.id, 'planPago');
              const snapshot = await getDocs(planRef);
              
              if (!snapshot.empty) {
                return {
                  clienteId: cliente.id,
                  data: { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
                };
              }
              return null;
            } catch (error) {
              console.log(`⚠️ Subcolección no disponible para ${cliente.id}, usando fallback`);
              return 'FALLBACK';
            }
          })
        );

        // Procesar resultados de subcolección
        const clientesFallback = [];
        resultadosSubcoleccion.forEach((resultado, index) => {
          if (resultado.status === 'fulfilled' && resultado.value && resultado.value !== 'FALLBACK') {
            planesTemp[resultado.value.clienteId] = resultado.value.data;
          } else if (resultado.value === 'FALLBACK') {
            clientesFallback.push(clientesConPlanPago[index].id);
          }
        });

        // 🎯 ESTRATEGIA 2: Fallback con batch query para los que fallaron
        if (clientesFallback.length > 0) {
          console.log(`🔄 Fallback para ${clientesFallback.length} clientes`);
          
          // Usar "in" query optimizada
          const lotes = [];
          for (let i = 0; i < clientesFallback.length; i += 10) {
            lotes.push(clientesFallback.slice(i, i + 10));
          }

          const resultadosLotes = await Promise.allSettled(
            lotes.map(async (lote) => {
              const q = query(
                collection(db, 'planesPago'), 
                where('clienteId', 'in', lote)
              );
              return await getDocs(q);
            })
          );

          resultadosLotes.forEach(resultado => {
            if (resultado.status === 'fulfilled') {
              resultado.value.docs.forEach(doc => {
                const data = { id: doc.id, ...doc.data() };
                planesTemp[data.clienteId] = data;
              });
            }
          });
        }

        if (mountedRef.current) {
          setPlanesMap(planesTemp);
          cacheTimestamp.current = Date.now();
          console.log(`✅ Carga completada: ${Object.keys(planesTemp).length} planes encontrados`);
        }
        
      } catch (error) {
        console.error("❌ Error:", error);
      } finally {
        if (mountedRef.current) {
          setLoadingPlanes(false);
        }
      }
    };

    cargarPlanes();

    return () => {
      mountedRef.current = false;
    };
  }, [clientesConPlanPago]);

  const getDato = useCallback((id, campo) => {
    return planesMap[id]?.[campo] || 0;
  }, [planesMap]);

  const tienePlan = useCallback((id) => {
    return !!planesMap[id];
  }, [planesMap]);

  // 🎯 MOSTRAR CONTENIDO INMEDIATAMENTE (como Seguimiento de Ventas)
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success mb-3" role="status"></div>
        <p className="text-muted fw-bold">CARGANDO CLIENTES...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">
            <i className="fas fa-money-bill-wave text-success me-2"></i> Gestión de Finanzas
          </h2>
          <p className="text-muted mt-1">
            Control de cronogramas y saldos activos EN DESARROLLO
            {loadingPlanes && (
              <span className="ms-2 text-info small">
                <i className="fas fa-sync-alt fa-spin me-1"></i>
                Sincronizando planes...
              </span>
            )}
          </p>
        </div>
        <div>
          <span className="badge bg-success fs-6">
            <i className="fas fa-chart-bar me-2"></i>
            {clientesConPlanPago.length} financiamientos activos
          </span>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th><i className="fas fa-user me-2"></i>CLIENTE</th>
                <th><i className="fas fa-user-tie me-2"></i>AGENTE</th>
                <th><i className="fas fa-chart-line me-2"></i>ESTADO</th>
                <th><i className="fas fa-dollar-sign me-2"></i>MONTO TOTAL</th>
                <th><i className="fas fa-hand-holding-usd me-2"></i>PAGADO</th>
                <th><i className="fas fa-calculator me-2"></i>SALDO</th>
                <th className="text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {clientesConPlanPago.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <i className="fas fa-inbox fa-2x mb-2 d-block"></i>
                    No hay financiamientos activos para mostrar
                  </td>
                </tr>
              ) : (
                clientesConPlanPago.map(cliente => (
                  <tr key={cliente.id}>
                    <td>
                      <div className="fw-bold">{cliente.nombre}</div>
                      <small className="text-muted">{cliente.dni}</small>
                    </td>
                    <td>
                      <small className="text-muted">{cliente.agente || '—'}</small>
                    </td>
                    <td>
                      <span className={`badge ${cliente.estadoVenta === 'Financió' ? 'bg-info' : 'bg-warning text-dark'}`}>
                        {cliente.estadoVenta === 'Financió' ? '📋' : '💰'} {cliente.estadoVenta}
                      </span>
                    </td>
                    <td className="fw-bold">
                      {loadingPlanes && !tienePlan(cliente.id) ? (
                        <span className="text-muted">Cargando...</span>
                      ) : (
                        `S/ ${getDato(cliente.id, 'precioTotal').toLocaleString()}`
                      )}
                    </td>
                    <td className="text-success fw-bold">
                      {loadingPlanes && !tienePlan(cliente.id) ? (
                        <span className="text-muted">—</span>
                      ) : (
                        `S/ ${getDato(cliente.id, 'pagoInicial').toLocaleString()}`
                      )}
                    </td>
                    <td className="fw-bold text-danger">
                      {loadingPlanes && !tienePlan(cliente.id) ? (
                        <span className="text-muted">—</span>
                      ) : (
                        `S/ ${getDato(cliente.id, 'saldoFinanciar').toLocaleString()}`
                      )}
                    </td>
                    <td className="text-center">
                      <button 
                        className="btn btn-sm btn-outline-success px-3"
                        onClick={() => setClienteSeleccionado(cliente)} 
                        disabled={loadingPlanes && !tienePlan(cliente.id)}
                      >
                        <i className="fas fa-file-invoice-dollar me-1"></i> 
                        {loadingPlanes && !tienePlan(cliente.id) ? 'Cargando...' : 'Ver Plan'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {clienteSeleccionado && (
        <ModalPlanPagos 
          cliente={clienteSeleccionado} 
          onClose={() => setClienteSeleccionado(null)} 
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENTE MODAL (CONSERVADO EXACTAMENTE IGUAL) ---
function ModalPlanPagos({ cliente, onClose }) {
  const { planes, loading } = usePlanesPago(cliente.id);
  const planActivo = planes.length > 0 ? planes[0] : null;

  const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    if (fecha.includes('-')) {
      const [y, m, d] = fecha.split('-');
      return `${d}/${m}/${y}`;
    }
    return fecha;
  };

  // Función para mostrar el mensaje de desarrollo
  const mostrarMensajeDesarrollo = (e, cuotaNumero) => {
    e.currentTarget.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Procesando...';
    e.currentTarget.className = 'btn btn-sm btn-secondary disabled px-2';
    
    setTimeout(() => {
      const modalHtml = document.createElement('div');
      modalHtml.className = 'custom-dev-alert';
      modalHtml.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="
            background: white;
            border-radius: 16px;
            max-width: 420px;
            width: 90%;
            padding: 28px 24px;
            text-align: center;
            box-shadow: 0 20px 35px -10px rgba(0,0,0,0.3);
            animation: fadeInUp 0.3s ease-out;
          ">
            <div style="font-size: 52px; margin-bottom: 16px;">🚧</div>
            <h3 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 600; color: #1e293b;">Módulo en desarrollo</h3>
            <p style="margin: 0 0 8px 0; color: #475569; font-size: 15px; line-height: 1.5;">
              Pendiente de implementación.
            </p>
            <p style="margin: 0 0 24px 0; color: #64748b; font-size: 13px;">
              Contacte al desarrollador @luisdev.
            </p>
            <button id="closeDevAlert" style="
              background: #10b981;
              color: white;
              border: none;
              padding: 10px 28px;
              border-radius: 40px;
              font-weight: 600;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 2px 6px rgba(16,185,129,0.3);
            " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
              Entendido
            </button>
          </div>
        </div>
        <style>
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        </style>
      `;
      document.body.appendChild(modalHtml);
      document.getElementById('closeDevAlert').onclick = () => modalHtml.remove();
      
      const botones = document.querySelectorAll(`button[data-cuota="${cuotaNumero}"]`);
      botones.forEach(btn => {
        if (btn && btn.parentElement) {
          btn.innerHTML = '<i class="fas fa-check me-1"></i> Marcar como pagado';
          btn.className = 'btn btn-sm btn-outline-success fw-bold';
        }
      });
    }, 400);
  };

  return (
    <div 
      className="modal show d-flex align-items-center justify-content-center" 
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered w-100 shadow-lg">
        <div className="modal-content border-0">
          
          <div className="bg-dark text-warning text-center py-2 small fw-bold">
            <i className="fas fa-lock me-2"></i> MÓDULO BAJO PROTOCOLO DE AUDITORÍA TÉCNICA (SOPORTE: @LuisDev#1234)
          </div>

          <div className="modal-header bg-success text-white">
            <h5 className="modal-title fw-bold"><i className="fas fa-file-invoice-dollar me-2"></i> Cronograma de Pagos: {cliente.nombre}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {loading ? (
              <div className="text-center py-5"><i className="fas fa-sync fa-spin fa-3x text-success"></i></div>
            ) : planActivo ? (
              <>
                <div className="row mb-4 text-center">
                  <div className="col-md-3"><div className="p-2 border rounded bg-light shadow-sm"><small className="text-muted">TOTAL</small><div className="fw-bold">S/ {planActivo.precioTotal?.toLocaleString()}</div></div></div>
                  <div className="col-md-3"><div className="p-2 border rounded bg-light shadow-sm"><small className="text-muted">PAGADO</small><div className="fw-bold text-success">S/ {planActivo.pagoInicial?.toLocaleString()}</div></div></div>
                  <div className="col-md-3"><div className="p-2 border rounded bg-light shadow-sm"><small className="text-muted">SALDO</small><div className="fw-bold text-danger">S/ {planActivo.saldoFinanciar?.toLocaleString()}</div></div></div>
                  <div className="col-md-3"><div className="p-2 border rounded bg-light shadow-sm"><small className="text-muted">PLAZO</small><div className="fw-bold text-primary">{planActivo.numCuotas} meses</div></div></div>
                </div>

                <div className="alert alert-info py-2 mb-4">
                  <div className="row text-center small fw-bold">
                    <div className="col-md-4">INICIO: {formatearFecha(planActivo.fechaInicio)}</div>
                    <div className="col-md-4">ESTADO: {planActivo.estadoVenta}</div>
                    <div className="col-md-4">VENCIMIENTO: {formatearFecha(planActivo.fechaVencimiento)}</div>
                  </div>
                </div>
                
                <div className="table-responsive" style={{ maxHeight: '400px' }}>
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>N° Cuota</th>
                        <th>Fecha Vencimiento</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th>Acción de Cobro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planActivo.cronograma?.map((cuota) => (
                        <tr key={cuota.cuota}>
                          <td className="fw-bold text-muted">{cuota.cuota}</td>
                          <td>{formatearFecha(cuota.fechaPago)}</td>
                          <td className="fw-bold">S/ {cuota.monto.toLocaleString()}</td>
                          <td>
                            <span className={`badge ${cuota.pagado ? 'bg-success' : 'bg-warning text-dark'}`}>
                              {cuota.pagado ? <><i className="fas fa-check-circle me-1"></i>COBRADO</> : <><i className="fas fa-clock me-1"></i>PENDIENTE</>}
                            </span>
                          </td>
                          <td>
                            {!cuota.pagado ? (
                              <button 
                                data-cuota={cuota.cuota}
                                className="btn btn-sm btn-outline-success fw-bold"
                                onClick={(e) => mostrarMensajeDesarrollo(e, cuota.cuota)}
                              >
                                <i className="fas fa-check me-1"></i> Marcar como pagado
                              </button>
                            ) : (
                              <small className="text-muted fw-bold">
                                <i className="fas fa-calendar-check me-1"></i> Pagado: {formatearFecha(cuota.fechaPagoReal)}
                              </small>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : <div className="text-center py-5 text-muted">Error: Cronograma no localizado en la base de datos.</div>}
          </div>
          <div className="modal-footer bg-light">
            <button className="btn btn-secondary px-4 fw-bold" onClick={onClose}>Cerrar Vista</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinanzasLista;