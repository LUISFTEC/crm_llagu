// constants/index.js
export const AGENTES = ["María García", "Lucía Pérez", "Rosa Espinoza", "Admin"];
export const ACUERDOS = ["Llamar", "Agendar", "Visitar"];
export const ESTADOS_VENTA = ["Prospecto", "Negociación", "Separó", "Compró", "Financió"];

export const ESTADO_BADGE_CLASSES = {
  'Prospecto': 'bg-secondary',
  'Negociación': 'bg-info text-dark',
  'Separó': 'bg-warning text-dark',
  'Compró': 'bg-success',
  'Financió': 'bg-primary'
};

// NUEVAS CONSTANTES PARA AGENDA
export const TIPOS_CITA = ["Llamada", "Visita", "Reunión", "Seguimiento"];
export const ESTADOS_CITA = ["Pendiente", "Completada", "Cancelada"];
export const DURACION_CITA = ["15 min", "30 min", "1 hora", "2 horas"];