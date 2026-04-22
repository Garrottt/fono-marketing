import prisma from "../lib/prisma"
import {
  CaeObservation,
  MembranaObservation,
  PabellonObservation,
  StructureStatus,
  SullivanScale,
  UpdatePreLavadoInput
} from "../types/prelavado.types"

const DEFAULT_INPUT: Required<UpdatePreLavadoInput> = {
  hasDiabetesOrImmunosuppression: false,
  hasPreviousEarSurgeries: false,
  hasKnownPerforation: false,
  otalgia: false,
  hipoacusia: false,
  plenitudOtica: false,
  otorrea: false,
  prurito: false,
  otorragia: false,
  usesHearingAid: false,
  hearingAidBadSmell: false,
  dolorAlTocarTrago: false,
  odPabellonEstado: "indemne",
  oiPabellonEstado: "indemne",
  odPabellonObservacion: "normal",
  oiPabellonObservacion: "normal",
  odCaeEstado: "indemne",
  oiCaeEstado: "indemne",
  odCaeObservacion: "limpio",
  oiCaeObservacion: "limpio",
  odMembranaEstado: "indemne",
  oiMembranaEstado: "indemne",
  odMembranaObservacion: "integra",
  oiMembranaObservacion: "integra",
  odSullivan: "0",
  oiSullivan: "0",
  odObservaciones: "",
  oiObservaciones: ""
}

const STRUCTURE_STATUS: StructureStatus[] = ["indemne", "patologico"]
const PABELLON_OPTIONS: PabellonObservation[] = ["normal", "inflamado", "malformacion"]
const CAE_OPTIONS: CaeObservation[] = ["limpio", "eritematoso", "edematoso", "presencia_hongos"]
const MEMBRANA_OPTIONS: MembranaObservation[] = ["integra", "perforada", "abombada", "retraida"]
const SULLIVAN_OPTIONS: SullivanScale[] = ["0", "+1", "+2", "+3"]

const pickOption = <T extends string>(value: string | undefined, options: T[], fallback: T): T => {
  return options.includes(value as T) ? (value as T) : fallback
}

const normalizeInput = (data: UpdatePreLavadoInput): Required<UpdatePreLavadoInput> => ({
  hasDiabetesOrImmunosuppression: Boolean(data.hasDiabetesOrImmunosuppression),
  hasPreviousEarSurgeries: Boolean(data.hasPreviousEarSurgeries),
  hasKnownPerforation: Boolean(data.hasKnownPerforation),
  otalgia: Boolean(data.otalgia),
  hipoacusia: Boolean(data.hipoacusia),
  plenitudOtica: Boolean(data.plenitudOtica),
  otorrea: Boolean(data.otorrea),
  prurito: Boolean(data.prurito),
  otorragia: Boolean(data.otorragia),
  usesHearingAid: Boolean(data.usesHearingAid),
  hearingAidBadSmell: Boolean(data.usesHearingAid && data.hearingAidBadSmell),
  dolorAlTocarTrago: Boolean(data.dolorAlTocarTrago),
  odPabellonEstado: pickOption(data.odPabellonEstado, STRUCTURE_STATUS, DEFAULT_INPUT.odPabellonEstado),
  oiPabellonEstado: pickOption(data.oiPabellonEstado, STRUCTURE_STATUS, DEFAULT_INPUT.oiPabellonEstado),
  odPabellonObservacion: pickOption(data.odPabellonObservacion, PABELLON_OPTIONS, DEFAULT_INPUT.odPabellonObservacion),
  oiPabellonObservacion: pickOption(data.oiPabellonObservacion, PABELLON_OPTIONS, DEFAULT_INPUT.oiPabellonObservacion),
  odCaeEstado: pickOption(data.odCaeEstado, STRUCTURE_STATUS, DEFAULT_INPUT.odCaeEstado),
  oiCaeEstado: pickOption(data.oiCaeEstado, STRUCTURE_STATUS, DEFAULT_INPUT.oiCaeEstado),
  odCaeObservacion: pickOption(data.odCaeObservacion, CAE_OPTIONS, DEFAULT_INPUT.odCaeObservacion),
  oiCaeObservacion: pickOption(data.oiCaeObservacion, CAE_OPTIONS, DEFAULT_INPUT.oiCaeObservacion),
  odMembranaEstado: pickOption(data.odMembranaEstado, STRUCTURE_STATUS, DEFAULT_INPUT.odMembranaEstado),
  oiMembranaEstado: pickOption(data.oiMembranaEstado, STRUCTURE_STATUS, DEFAULT_INPUT.oiMembranaEstado),
  odMembranaObservacion: pickOption(data.odMembranaObservacion, MEMBRANA_OPTIONS, DEFAULT_INPUT.odMembranaObservacion),
  oiMembranaObservacion: pickOption(data.oiMembranaObservacion, MEMBRANA_OPTIONS, DEFAULT_INPUT.oiMembranaObservacion),
  odSullivan: pickOption(data.odSullivan, SULLIVAN_OPTIONS, DEFAULT_INPUT.odSullivan),
  oiSullivan: pickOption(data.oiSullivan, SULLIVAN_OPTIONS, DEFAULT_INPUT.oiSullivan),
  odObservaciones: data.odObservaciones?.trim() || "",
  oiObservaciones: data.oiObservaciones?.trim() || ""
})

export interface DerivedPreLavadoResult {
  aptoParaLavado: boolean
  criticalBlocks: string[]
  precautionAlerts: string[]
  diagnosticSummary: string
  suggestedConduct: string
}

export const derivePreLavadoResult = (data: Required<UpdatePreLavadoInput>): DerivedPreLavadoResult => {
  const criticalBlocks: string[] = []
  const precautionAlerts: string[] = []

  const hasMembranePerforation =
    data.odMembranaObservacion === "perforada" ||
    data.oiMembranaObservacion === "perforada"

  const hasFungi =
    data.odCaeObservacion === "presencia_hongos" ||
    data.oiCaeObservacion === "presencia_hongos"

  if (data.hasPreviousEarSurgeries) {
    criticalBlocks.push("Cirugías previas detectadas. No apto para lavado por riesgo clínico y legal.")
  }

  if (data.hasDiabetesOrImmunosuppression) {
    criticalBlocks.push("Diabetes o inmunosupresión detectada. No apto para lavado por riesgo de otitis externa maligna.")
  }

  if (data.hasKnownPerforation || hasMembranePerforation) {
    criticalBlocks.push("Perforacion timpanica conocida o sospechada. No apto para lavado.")
  }

  if (data.otorrea) {
    precautionAlerts.push("ALERTA: Presencia de secreción. Evaluar consistencia y olor. Si es purulenta, evitar irrigación.")
  }

  if (data.prurito) {
    precautionAlerts.push("ALERTA: Picazon intensa detectada. Posible otomicosis. Si se confirman hongos en otoscopía, derivar y no irrigar.")
  }

  if (data.otorragia) {
    precautionAlerts.push("ALERTA: Sangrado detectado. Evaluar si corresponde a trauma o lesion interna antes de proceder.")
  }

  if (data.usesHearingAid && data.hearingAidBadSmell) {
    precautionAlerts.push("ALERTA: Mal olor asociado al uso de audífonos. Evaluar posible proceso infeccioso antes del lavado.")
  }

  let diagnosticSummary = "Sin hipótesis automática concluyente"
  let suggestedConduct = "Continuar evaluación clínica y confirmar conducta profesional según hallazgos."

  if ((data.prurito && data.otorrea) || hasFungi) {
    diagnosticSummary = "Sospecha de Otomicosis"
    suggestedConduct = "Se recomienda DERIVAR. Evitar humedad en el conducto."
  } else if (data.otalgia && data.dolorAlTocarTrago) {
    diagnosticSummary = "Signos de Otitis Externa"
    suggestedConduct = "Evaluar tratamiento medico antes de limpieza."
  } else if (data.hipoacusia && data.plenitudOtica && !data.otalgia) {
    diagnosticSummary = "Compatible con Tapon de Cerumen"
    suggestedConduct = "Proceder a otoscopía para confirmar extracción."
  }

  return {
    aptoParaLavado: criticalBlocks.length === 0,
    criticalBlocks,
    precautionAlerts,
    diagnosticSummary,
    suggestedConduct
  }
}

export const getPreLavadoByPatientId = async (patientId: string) => {
  return prisma.preLavadoEvaluation.findUnique({
    where: { patientId }
  })
}

export const upsertPreLavado = async (patientId: string, data: UpdatePreLavadoInput) => {
  const normalized = normalizeInput(data)
  const derived = derivePreLavadoResult(normalized)

  return prisma.preLavadoEvaluation.upsert({
    where: { patientId },
    update: {
      ...normalized,
      ...derived
    },
    create: {
      patientId,
      ...normalized,
      ...derived
    }
  })
}
