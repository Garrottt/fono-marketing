const CHILE_TIME_ZONE = "America/Santiago"

type DateParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()

const getFormatter = (timeZone: string) => {
  if (!formatterCache.has(timeZone)) {
    formatterCache.set(
      timeZone,
      new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      })
    )
  }

  return formatterCache.get(timeZone)!
}

const getDatePartsInTimeZone = (date: Date, timeZone: string): DateParts => {
  const parts = getFormatter(timeZone).formatToParts(date)

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
    second: getPart("second")
  }
}

const parseLocalDateTime = (value: string): DateParts => {
  const [datePart, timePart = "00:00:00"] = value.trim().split("T")

  if (!datePart) {
    throw new Error(`Fecha invalida: ${value}`)
  }

  const [year, month, day] = datePart.split("-").map(Number)
  const [hour, minute, second = 0] = timePart.split(":").map(Number)

  return { year, month, day, hour, minute, second }
}

const toUtcComparable = ({ year, month, day, hour, minute, second }: DateParts) =>
  Date.UTC(year, month - 1, day, hour, minute, second)

export const chileLocalDateTimeToUtc = (value: string) => {
  const target = parseLocalDateTime(value)
  let utcDate = new Date(toUtcComparable(target))

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = getDatePartsInTimeZone(utcDate, CHILE_TIME_ZONE)
    const diffMs = toUtcComparable(target) - toUtcComparable(current)

    if (diffMs === 0) {
      return utcDate
    }

    utcDate = new Date(utcDate.getTime() + diffMs)
  }

  return utcDate
}

export const CHILE_TIMEZONE = CHILE_TIME_ZONE
