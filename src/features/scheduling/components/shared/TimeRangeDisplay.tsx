import { formatWallTime } from '../../utils/time'

type TimeRangeDisplayProps = {
  startTime: string
  endTime: string
}

export function TimeRangeDisplay({ startTime, endTime }: TimeRangeDisplayProps) {
  return (
    <span>
      {formatWallTime(startTime)}
      <span className="mx-1 text-slate-400">–</span>
      {formatWallTime(endTime)}
    </span>
  )
}
