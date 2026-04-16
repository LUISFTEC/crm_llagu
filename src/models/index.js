// src/models/index.js

export const USUARIO_MODEL = {
  email: "",
  nombre: "",
  rol: "asesor",
  activo: true,
  createdAt: new Date()
}

export const LEAD_MODEL = {
  nombre: "",
  telefono: "",
  dni: "",
  correo: "",
  origen: "Facebook",
  etapa: "lead",
  asesorId: "",
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const SEGUIMIENTO_MODEL = {
  leadId: "",
  asesorId: "",
  tipo: "llamada",
  nota: "",
  fecha: new Date()
}

export const LOTE_MODEL = {
  codigo: "",
  sector: "",
  manzana: "",
  precio: 0,
  estado: "disponible"
}

export const VENTA_MODEL = {
  leadId: "",
  loteId: "",
  montoTotal: 0,
  montoInicial: 0,
  saldoPendiente: 0,
  estado: "separado",
  fechaSeparacion: new Date()
}

export const CITA_MODEL = {
  leadId: "",
  fecha: "",
  hora: "",
  estado: "pendiente",
  notas: ""
}