export type FestivalDay = 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Friend {
  id: string;
  name: string;
  color?: string;
}

export interface Stage {
  id: string;
  name: string;
  mapX: number;
  mapY: number;
}

export interface Artist {
  id: string;
  name: string;
  day: FestivalDay;
  stageId: string;
  startTime: string;
  endTime: string;
}

export interface Song {
  id: string;
  artistId: string;
  title: string;
  addedBy: string;
  source: 'manual' | 'setlistfm';
}

export interface SchedulePick {
  id: string;
  artistId: string;
  addedBy: string;
  note?: string;
}

export type GoalTrainDirection = 'outbound' | 'return';

export interface GoalTrainOverride {
  id: string;
  day: string;
  direction: GoalTrainDirection;
  tripId: string;
  addedBy: string;
}
