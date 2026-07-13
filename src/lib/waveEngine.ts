import { differenceInMinutes, parse, startOfDay, addMinutes, isAfter, isBefore, addDays } from 'date-fns';
import type { TruckLogEntry, ShiftBlock } from '../store';

// Helper to convert HH:mm string to a Date object for today
const parseTime = (timeStr: string, baseDate: Date = new Date()): Date => {
  return parse(timeStr, 'HH:mm', startOfDay(baseDate));
};

// Gets the actual shift intervals for a given 24h period (handles overnight shifts)
export const getActiveShiftIntervals = (schedule: ShiftBlock[], baseDate: Date = new Date()) => {
  const intervals: { start: Date; end: Date; teams: number }[] = [];
  for (const block of schedule) {
    let start = parseTime(block.start, baseDate);
    let end = parseTime(block.end, baseDate);
    if (isBefore(end, start)) {
      end = addDays(end, 1); // Handles overnight like 22:00 -> 06:00
    }
    intervals.push({ start, end, teams: block.teams });
  }
  // Sort by start time
  return intervals.sort((a, b) => a.start.getTime() - b.start.getTime());
};

export const getCurrentShift = (schedule: ShiftBlock[], now: Date = new Date()) => {
  const intervals = getActiveShiftIntervals(schedule, now);
  for (const interval of intervals) {
    if ((isAfter(now, interval.start) || now.getTime() === interval.start.getTime()) && isBefore(now, interval.end)) {
      return interval;
    }
  }
  // If no match found today, might be an overnight shift from yesterday
  const yesterdayIntervals = getActiveShiftIntervals(schedule, addDays(now, -1));
  for (const interval of yesterdayIntervals) {
    if ((isAfter(now, interval.start) || now.getTime() === interval.start.getTime()) && isBefore(now, interval.end)) {
      return interval;
    }
  }
  return null;
};

// Calculates team-hours in a specific window, capped to the shift boundary
const getTeamHoursInWindow = (start: Date, end: Date, intervals: { start: Date; end: Date; teams: number }[]) => {
  let teamHours = 0;
  for (const interval of intervals) {
    const overlapStart = start > interval.start ? start : interval.start;
    const overlapEnd = end < interval.end ? end : interval.end;
    
    if (overlapStart < overlapEnd) {
      const minutes = differenceInMinutes(overlapEnd, overlapStart);
      teamHours += (minutes / 60) * interval.teams;
    }
  }
  return teamHours;
};

// WAVE: True Velocity Calculation for a window
export const calculateWindowVelocity = (
  windowStart: Date,
  windowEnd: Date,
  logs: TruckLogEntry[],
  intervals: { start: Date; end: Date; teams: number }[],
  currentShiftStart: Date | null,
  historicalAnchor: number
) => {
  // If the entire window is before the current shift started, use historical anchor
  if (currentShiftStart && isBefore(windowEnd, currentShiftStart)) {
    return historicalAnchor;
  }

  // Calculate actual velocity for the portion of the window INSIDE the current shift
  const actualStart = currentShiftStart && isAfter(currentShiftStart, windowStart) ? currentShiftStart : windowStart;
  
  const trucksInActual = logs.filter(log => {
    const t = new Date(log.timestamp);
    return t >= actualStart && t <= windowEnd;
  }).length;

  const actualTeamHours = getTeamHoursInWindow(actualStart, windowEnd, intervals);
  const actualVelocity = actualTeamHours > 0 ? trucksInActual / actualTeamHours : historicalAnchor;

  // If the window is entirely inside the current shift
  if (!currentShiftStart || actualStart.getTime() === windowStart.getTime()) {
    return actualVelocity;
  }

  // Blend historical and actual based on time duration
  const historicalMinutes = differenceInMinutes(actualStart, windowStart);
  const actualMinutes = differenceInMinutes(windowEnd, actualStart);
  const totalMinutes = historicalMinutes + actualMinutes;

  if (totalMinutes === 0) return historicalAnchor;

  return ((historicalAnchor * historicalMinutes) + (actualVelocity * actualMinutes)) / totalMinutes;
};

// WAVE: Time-Decay Weighting (C2HRA)
export const calculateSmoothedVelocity = (
  logs: TruckLogEntry[],
  schedule: ShiftBlock[],
  historicalAnchor: number,
  now: Date = new Date()
) => {
  const currentShift = getCurrentShift(schedule, now);
  const intervals = getActiveShiftIntervals(schedule, now);
  // include yesterday's intervals just in case we cross midnight
  const yesterdayIntervals = getActiveShiftIntervals(schedule, addDays(now, -1));
  const allIntervals = [...yesterdayIntervals, ...intervals];

  const currentShiftStart = currentShift ? currentShift.start : null;

  const w1End = now;
  const w1Start = addMinutes(now, -120);
  const w2Start = addMinutes(now, -240);
  const w3Start = addMinutes(now, -360);

  const v1 = calculateWindowVelocity(w1Start, w1End, logs, allIntervals, currentShiftStart, historicalAnchor);
  const v2 = calculateWindowVelocity(w2Start, w1Start, logs, allIntervals, currentShiftStart, historicalAnchor);
  const v3 = calculateWindowVelocity(w3Start, w2Start, logs, allIntervals, currentShiftStart, historicalAnchor);

  return (v1 * 0.6) + (v2 * 0.3) + (v3 * 0.1);
};

// WAVE: ETA Projection
export const projectETA = (
  remainingTrucks: number,
  currentVelocity: number, // Trucks per team-hour
  schedule: ShiftBlock[],
  now: Date = new Date()
): Date | null => {
  if (remainingTrucks <= 0) return now;
  if (currentVelocity <= 0) return null; // Infinite ETA

  let projectedDate = new Date(now.getTime());
  let trucksLeft = remainingTrucks;

  const allIntervals = [
    ...getActiveShiftIntervals(schedule, now),
    ...getActiveShiftIntervals(schedule, addDays(now, 1)),
    ...getActiveShiftIntervals(schedule, addDays(now, 2))
  ].filter(interval => interval.end > now); // Only future/ongoing intervals

  for (const interval of allIntervals) {
    if (trucksLeft <= 0) break;
    if (interval.teams === 0) continue; // No teams working

    const start = isAfter(now, interval.start) ? now : interval.start;
    const end = interval.end;
    
    // Jump to the start of this shift if we have a gap
    if (isAfter(start, projectedDate)) {
      projectedDate = start;
    }

    const availableHours = differenceInMinutes(end, start) / 60;
    const capacityInBlock = availableHours * interval.teams * currentVelocity;

    if (trucksLeft <= capacityInBlock) {
      // It will finish within this block
      const hoursNeeded = trucksLeft / (interval.teams * currentVelocity);
      projectedDate = addMinutes(projectedDate, Math.ceil(hoursNeeded * 60));
      trucksLeft = 0;
      break;
    } else {
      // Consume the whole block and move to the next
      trucksLeft -= capacityInBlock;
      projectedDate = end;
    }
  }

  return trucksLeft > 0 ? null : projectedDate; // Null if it goes beyond 2 days (unlikely)
};

// Spatial Diagnostics
export const calculateWIR = (leftWingCount: number, rightWingCount: number) => {
  const total = leftWingCount + rightWingCount;
  if (total === 0) return { wir: 0, status: 'Balanced' as const };
  
  const wir = Math.abs(leftWingCount - rightWingCount) / total;
  
  let status: 'Balanced' | 'Warning' | 'Critical Imbalance' = 'Balanced';
  if (wir >= 0.35) status = 'Critical Imbalance';
  else if (wir >= 0.20) status = 'Warning';

  return { wir, status };
};
