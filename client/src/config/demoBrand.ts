export const demoBrand = {
  productName: "Fono WebApp",
  productTagline: "La consulta ordenada, antes de que empiece cada sesión",
  productBadge: "Software para consultas fonoaudiológicas",
  demoProfessionalName: "Camila Torres",
  demoProfessionalRole: "Fonoaudióloga clínica · Perfil demo",
  promiseTitle: "Deja de buscar en cuadernos qué acordaste con cada paciente.",
  promiseDescription:
    "Fono WebApp reúne objetivos, sesiones, anamnesis, tareas y citas en un solo lugar para que la profesional llegue a cada atención con claridad y contexto.",
  productHighlights: [
    "¿Cuánto tiempo pierdes antes de cada sesión buscando qué trabajaste la semana pasada?",
    "Toda la historia clínica de cada paciente, ordenada y a un clic.",
    "Agenda, recordatorios y seguimiento terapéutico sin planillas ni notas sueltas."
  ],
  proofTitle: "Lo que resuelve esta demo",
  proofItems: [
    "Cada paciente deja de vivir en un cuaderno distinto y pasa a tener un seguimiento clínico trazable.",
    "Las sesiones, objetivos y tareas quedan conectados para que no se pierda continuidad terapéutica.",
    "El portal paciente muestra cómo compartir materiales e indicaciones sin depender de mensajes dispersos.",
    "La agenda clínica evita dobles registros y permite reaccionar rápido frente a cambios o reagendamientos."
  ],
  socialProof: "Fonoaudiólogas independientes pueden organizar pacientes, sesiones y seguimiento en una sola plataforma visual.",
  login: {
    professional: {
      eyebrow: "Acceso profesional",
      title: "Entra a la demo del panel clínico",
      description:
        "Así se ve una consulta cuando la información deja de estar repartida entre cuadernos, WhatsApp y planillas.",
      profileTitle: "Perfil demo",
      profileSubtitle: "Fonoaudióloga clínica · Acceso privado de demostración",
      buttonLabel: "Entrar al panel demo",
      emailPlaceholder: "demo@consulta-fono.cl",
      alternateLabel: "¿Quieres ver también el portal paciente?",
      alternateCta: "Ir al portal demo",
      alternateHint: "Explora cómo el paciente recibe tareas, archivos y seguimiento desde un acceso claro y ordenado.",
      alternateHref: "/portal/login",
      errorMessage: "No pudimos validar el acceso profesional"
    },
    patient: {
      eyebrow: "Portal paciente",
      title: "Accede a la demo del portal personal",
      description:
        "Revisa cómo el paciente encuentra tareas, archivos y próximas citas sin depender de mensajes perdidos o recordatorios informales.",
      profileTitle: "Portal demo",
      profileSubtitle: "Seguimiento terapéutico · Acceso personal de demostración",
      buttonLabel: "Entrar al portal demo",
      emailPlaceholder: "paciente@demo.cl",
      alternateLabel: "¿Quieres ver el panel profesional?",
      alternateCta: "Ir al panel demo",
      alternateHint: "Conoce el flujo clínico completo desde la vista de la profesional.",
      alternateHref: "/login",
      errorMessage: "No pudimos validar el acceso del portal"
    }
  },
  dashboard: {
    sidebarDescription:
      "La demo muestra cómo una consulta fonoaudiológica puede dejar atrás planillas, notas sueltas y doble registro para trabajar con más claridad.",
    sessionLabel: "Sesión demo",
    sessionSubtitle: "Profesional de ejemplo",
    mobileDescription: "Acceso rápido a módulos clínicos y administrativos de la demo.",
    currentModuleLabel: "Módulo activo",
    userLabel: "Perfil demo",
    heroEyebrow: "Panel de inicio",
    heroTitle: "Empieza el día sabiendo qué paciente ver, qué trabajaste y qué sigue.",
    heroDescription:
      "La vista inicial concentra agenda, pacientes activos y continuidad clínica para que la profesional no tenga que reconstruir el contexto antes de cada sesión.",
    accessQuickTitle: "Agenda sin fricción",
    accessQuickDescription:
      "La demo muestra cómo reagendar o crear citas sin salir del flujo ni perder de vista el día que estás organizando.",
    nextActionTitle: "Pacientes con contexto",
    nextActionDescription:
      "Cada ficha reúne evolución, objetivos y materiales para evitar volver a buscar qué se hizo en sesiones anteriores.",
    selectedViewTitle: "Día en foco",
    selectedViewDescription: "Una vista concreta del día para decidir rápido qué atender y qué ajustar.",
    calendarTitle: "Calendario clínico",
    calendarDescription:
      "La agenda resume horarios, estado de citas y cambios de última hora en un solo panel operativo."
  }
} as const
