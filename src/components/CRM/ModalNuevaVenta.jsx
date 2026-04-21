// components/CRM/ModalNuevaVenta.jsx
import React, { useState, useEffect } from 'react';

function ModalNuevaVenta({ show, onClose, cliente }) {
  const [precioTotal, setPrecioTotal] = useState('');
  const [pagoInicial, setPagoInicial] = useState('');
  const [numCuotas, setNumCuotas] = useState(1); 
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [cronograma, setCronograma] = useState([]);

  useEffect(() => {
    if (cliente) {
      setPrecioTotal(cliente.precio || '');
      setPagoInicial(cliente.montoSeparacion || cliente.montoFinanciamiento || '');
      
      // 🔥 Lógica de bloqueo: Si es Separó, forzamos 1 cuota siempre
      if (cliente.estadoVenta === 'Separó') {
        setNumCuotas(1);
      } else if (cliente.estadoVenta === 'Financió') {
        setNumCuotas(12); // Sugerencia inicial para financiamiento
      }
      
      setCronograma([]); 
    }
  }, [cliente, show]);

  const saldoFinanciar = (Number(precioTotal) || 0) - (Number(pagoInicial) || 0);

  const generarCronograma = (e) => {
    e.preventDefault();
    if (saldoFinanciar < 0) return alert("El pago inicial no puede ser mayor al precio total");

    const montoMensual = saldoFinanciar / numCuotas;
    let nuevoCronograma = [];
    let fechaActual = new Date(fechaInicio + 'T00:00:00');

    for (let i = 1; i <= numCuotas; i++) {
      nuevoCronograma.push({
        cuota: i,
        fechaPago: fechaActual.toLocaleDateString('es-PE'),
        monto: montoMensual,
      });
      fechaActual.setMonth(fechaActual.getMonth() + 1);
    }
    setCronograma(nuevoCronograma);
  };

  if (!show || !cliente) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1050 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title fw-bold">
              <i className="fas fa-magic me-2"></i> Plan de Pagos: {cliente.nombre}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            <div className="row">
              <div className="col-md-4 border-end">
                <div className={`badge mb-3 p-2 ${cliente.estadoVenta === 'Separó' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                    Estado Actual: {cliente.estadoVenta}
                </div>
                <form onSubmit={generarCronograma}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">PRECIO TOTAL DEL LOTE</label>
                    <div className="input-group shadow-sm">
                      <span className="input-group-text">S/</span>
                      <input type="number" className="form-control fw-bold" value={precioTotal} onChange={(e) => setPrecioTotal(e.target.value)} required />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">MONTO YA PAGADO (SEPARACIÓN)</label>
                    <div className="input-group shadow-sm">
                      <span className="input-group-text bg-light text-success">S/</span>
                      <input type="number" className="form-control bg-light fw-bold text-success" value={pagoInicial} readOnly />
                    </div>
                  </div>

                  <div className="card bg-light border-0 mb-3 shadow-sm">
                    <div className="card-body py-2">
                      <small className="text-muted d-block small fw-bold">SALDO RESTANTE:</small>
                      <span className="h4 fw-bold text-danger">S/ {saldoFinanciar.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">PLAZO PARA CANCELAR EL SALDO</label>
                    {/* 🔥 AQUÍ LA MAGIA: Si es 'Separó', el select se deshabilita */}
                    <select 
                      className="form-select border-primary fw-bold shadow-sm" 
                      value={numCuotas} 
                      onChange={(e) => setNumCuotas(Number(e.target.value))}
                      disabled={cliente.estadoVenta === 'Separó'}
                    >
                      <option value={1}>1 Mes (Pago único / Contado)</option>
                      {cliente.estadoVenta !== 'Separó' && (
                        <>
                          <option value={3}>3 Meses</option>
                          <option value={6}>6 Meses</option>
                          <option value={12}>12 Meses</option>
                          <option value={24}>24 Meses</option>
                          <option value={36}>36 Meses</option>
                        </>
                      )}
                    </select>
                    {cliente.estadoVenta === 'Separó' && (
                      <small className="text-info mt-1 d-block font-italic">
                        * Bloqueado a 1 mes por ser estado "Separó"
                      </small>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-muted">FECHA DE VENCIMIENTO (Saldo)</label>
                    <input type="date" className="form-control shadow-sm" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
                  </div>

                  <button type="submit" className="btn btn-success w-100 py-2 fw-bold shadow-sm">
                    <i className="fas fa-sync-alt me-2"></i> GENERAR CRONOGRAMA
                  </button>
                </form>
              </div>

              <div className="col-md-8 bg-white">
                <div className="p-3">
                    <h6 className="fw-bold text-secondary border-bottom pb-2">Vista Previa del Plan de Pagos</h6>
                    {cronograma.length > 0 ? (
                    <div className="table-responsive" style={{ maxHeight: '450px' }}>
                        <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr className="text-center">
                            <th>N° Cuota</th>
                            <th>Fecha de Vencimiento</th>
                            <th>Monto a Pagar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cronograma.map((c) => (
                            <tr key={c.cuota} className="text-center">
                                <td className="fw-bold text-muted">{c.cuota}</td>
                                <td>{c.fechaPago}</td>
                                <td className="fw-bold text-dark">S/ {c.monto.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    ) : (
                    <div className="text-center py-5">
                        <i className="fas fa-file-invoice-dollar fa-4x text-light mb-3"></i>
                        <p className="text-muted">Presiona el botón verde para calcular el saldo restante.</p>
                    </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light border-top-0">
            <button type="button" className="btn btn-link text-muted" onClick={onClose}>Cancelar</button>
            <button type="button" className="btn btn-primary px-5 fw-bold shadow" disabled={cronograma.length === 0}>
              <i className="fas fa-check-circle me-2"></i> CONFIRMAR Y GUARDAR VENTA
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ModalNuevaVenta;