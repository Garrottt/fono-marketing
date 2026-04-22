import prisma from "../lib/prisma"
import { UpdateAnamnesisInput } from "../types/anamnesis.types"

const normalizeAnamnesisInput = (data: UpdateAnamnesisInput): UpdateAnamnesisInput => ({
  consultationReason: data.consultationReason?.trim() || undefined,
  previousAudiologicalDiagnosis: data.previousAudiologicalDiagnosis?.trim() || undefined,
  lastAuditoryReview: data.lastAuditoryReview?.trim() || undefined,
  hasDiabetesOrImmunosuppression: Boolean(data.hasDiabetesOrImmunosuppression),
  hasPreviousEarSurgeries: Boolean(data.hasPreviousEarSurgeries),
  timpanoplastia: Boolean(data.timpanoplastia),
  mastoidectomia: Boolean(data.mastoidectomia),
  miringoplastia: Boolean(data.miringoplastia),
  osiculoplastia: Boolean(data.osiculoplastia),
  estapedectomiaEstapedotomia: Boolean(data.estapedectomiaEstapedotomia),
  usesCambuchos: Boolean(data.usesCambuchos),
  usesHearingAid: Boolean(data.usesHearingAid),
  hearingAidFeelsLooserOrAnnoying: Boolean(data.usesHearingAid && data.hearingAidFeelsLooserOrAnnoying),
  hearingAidSoundsLowerOrWhistles: Boolean(data.usesHearingAid && data.hearingAidSoundsLowerOrWhistles),
  hearingAidSuppurationOrBadSmell: Boolean(data.usesHearingAid && data.hearingAidSuppurationOrBadSmell),
  hearingAidHoursPerDay: data.usesHearingAid ? data.hearingAidHoursPerDay?.trim() || undefined : undefined,
  cleansWithCottonSwabsOrObjects: Boolean(data.cleansWithCottonSwabsOrObjects),
  cleaningObjects: data.cleansWithCottonSwabsOrObjects ? data.cleaningObjects?.trim() || undefined : undefined,
  otalgia: Boolean(data.otalgia),
  prurito: Boolean(data.prurito),
  hipoacusia: Boolean(data.hipoacusia),
  otorrea: Boolean(data.otorrea),
  otorragia: Boolean(data.otorragia),
  plenitudOtica: Boolean(data.plenitudOtica),
  tinnitus: Boolean(data.tinnitus),
  vertigoInestabilidad: Boolean(data.vertigoInestabilidad),
  autofonia: Boolean(data.autofonia)
})

export const getAnamnesisByPatientId = async (patientId: string) => {
  return prisma.anamnesis.findUnique({
    where: { patientId }
  })
}

export const upsertAnamnesis = async (patientId: string, data: UpdateAnamnesisInput) => {
  const normalized = normalizeAnamnesisInput(data)

  return prisma.anamnesis.upsert({
    where: { patientId },
    update: normalized,
    create: {
      patientId,
      ...normalized
    }
  })
}
