import { Request, Response } from "express"
import * as patientService from "../services/patient.service"
import * as preLavadoService from "../services/prelavado.service"
import { UpdatePreLavadoInput } from "../types/prelavado.types"
import { buildSimplePdf } from "../utils/simplePdf"

const asStringArray = (value: unknown) => Array.isArray(value) ? value.map(String) : []

const prettifyValue = (value: string) => value.replace(/_/g, " ")

export const getPreLavadoByPatientId = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.id as string
    const professionalId = req.user!.id
    const patient = await patientService.getPatientById(patientId, professionalId)

    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    const evaluation = await preLavadoService.getPreLavadoByPatientId(patientId)
    res.status(200).json({ evaluation })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la evaluación pre-lavado" })
  }
}

export const upsertPreLavado = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.id as string
    const professionalId = req.user!.id
    const patient = await patientService.getPatientById(patientId, professionalId)

    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    const data: UpdatePreLavadoInput = req.body
    const evaluation = await preLavadoService.upsertPreLavado(patientId, data)

    res.status(200).json({
      evaluation,
      message: "Evaluacion pre-lavado guardada correctamente"
    })
  } catch (error) {
    res.status(500).json({ message: "Error al guardar la evaluación pre-lavado" })
  }
}

export const downloadPreLavadoPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.id as string
    const professionalId = req.user!.id
    const patient = await patientService.getPatientById(patientId, professionalId)

    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    const evaluation = await preLavadoService.getPreLavadoByPatientId(patientId)

    if (!evaluation) {
      res.status(404).json({ message: "No hay evaluación pre-lavado para generar ficha" })
      return
    }

    const alerts = asStringArray(evaluation.precautionAlerts)
    const blocks = asStringArray(evaluation.criticalBlocks)
    const lines = [
      `Paciente: ${patient.name}`,
      `Edad: ${patient.age ?? "No registrada"}`,
      `Apto para lavado: ${evaluation.aptoParaLavado ? "Si" : "No"}`,
      `Hipótesis: ${evaluation.diagnosticSummary}`,
      `Conducta: ${evaluation.suggestedConduct}`,
      "",
      "Sintomas detectados:",
      `Otalgia: ${evaluation.otalgia ? "Si" : "No"}`,
      `Hipoacusia: ${evaluation.hipoacusia ? "Si" : "No"}`,
      `Plenitud ótica: ${evaluation.plenitudOtica ? "Si" : "No"}`,
      `Otorrea: ${evaluation.otorrea ? "Si" : "No"}`,
      `Prurito: ${evaluation.prurito ? "Si" : "No"}`,
      `Otorragia: ${evaluation.otorragia ? "Si" : "No"}`,
      `Dolor al tocar trago: ${evaluation.dolorAlTocarTrago ? "Si" : "No"}`,
      "",
      "Alertas activadas:",
      ...(alerts.length > 0 ? alerts : ["Sin alertas de precaucion activas"]),
      "",
      "Bloqueos criticos:",
      ...(blocks.length > 0 ? blocks : ["Sin bloqueos criticos"]),
      "",
      "Evaluacion otoscopica OD:",
      `Pabellon: ${prettifyValue(evaluation.odPabellonEstado)} / ${prettifyValue(evaluation.odPabellonObservacion)}`,
      `CAE: ${prettifyValue(evaluation.odCaeEstado)} / ${prettifyValue(evaluation.odCaeObservacion)}`,
      `Membrana: ${prettifyValue(evaluation.odMembranaEstado)} / ${prettifyValue(evaluation.odMembranaObservacion)}`,
      `Sullivan: ${evaluation.odSullivan}`,
      `Observaciones: ${evaluation.odObservaciones || "Sin observaciones"}`,
      "",
      "Evaluacion otoscopica OI:",
      `Pabellon: ${prettifyValue(evaluation.oiPabellonEstado)} / ${prettifyValue(evaluation.oiPabellonObservacion)}`,
      `CAE: ${prettifyValue(evaluation.oiCaeEstado)} / ${prettifyValue(evaluation.oiCaeObservacion)}`,
      `Membrana: ${prettifyValue(evaluation.oiMembranaEstado)} / ${prettifyValue(evaluation.oiMembranaObservacion)}`,
      `Sullivan: ${evaluation.oiSullivan}`,
      `Observaciones: ${evaluation.oiObservaciones || "Sin observaciones"}`
    ]

    const pdf = buildSimplePdf("Ficha de Evaluacion Pre-Lavado", lines)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="pre-lavado-${patient.name.replace(/\s+/g, "-").toLowerCase()}.pdf"`)
    res.status(200).send(pdf)
  } catch (error) {
    res.status(500).json({ message: "Error al generar el PDF de evaluación" })
  }
}
