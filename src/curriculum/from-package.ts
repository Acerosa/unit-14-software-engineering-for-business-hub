export type ContentWeek = {
  id: string;
  metadata?: {
    title?: string;
    status?: string;
    teachingWeek?: number;
  };
};

export type ContentPackage = {
  id?: string;
  version?: string;
  schemaVersion?: string;
  hub?: { id?: string };
  curriculum?: { metadata?: { course?: string } };
  weeks?: ContentWeek[];
  activities?: unknown[];
  sessions?: unknown[];
  learningOutcomes?: unknown[];
};
