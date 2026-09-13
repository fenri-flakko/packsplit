export interface DailyRecordData {
  recordDate: string
  packagesCount: number
  person1Worked: boolean
  person2Worked: boolean
}

/** Primera fecha con datos reales: lunes 31 de agosto de 2026 */
export const DATA_START_DATE = '2026-08-31'

export function calcDayShares(
  packages: number,
  pricePerPackage: number,
  person1Worked: boolean,
  person2Worked: boolean,
): { total: number; person1: number; person2: number } {
  const total = packages * pricePerPackage

  if (person1Worked && person2Worked) {
    return { total, person1: total / 2, person2: total / 2 }
  }
  if (person1Worked && !person2Worked) {
    return { total, person1: total, person2: 0 }
  }
  if (!person1Worked && person2Worked) {
    return { total, person1: 0, person2: total }
  }
  return { total, person1: 0, person2: 0 }
}

export function sumRecords(
  records: DailyRecordData[],
  pricePerPackage: number,
): { packages: number; total: number; person1: number; person2: number } {
  return records.reduce(
    (acc, record) => {
      const shares = calcDayShares(
        record.packagesCount,
        pricePerPackage,
        record.person1Worked,
        record.person2Worked,
      )
      return {
        packages: acc.packages + record.packagesCount,
        total: acc.total + shares.total,
        person1: acc.person1 + shares.person1,
        person2: acc.person2 + shares.person2,
      }
    },
    { packages: 0, total: 0, person1: 0, person2: 0 },
  )
}
