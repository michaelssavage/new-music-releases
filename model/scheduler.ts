export type SchedulerRunStatus = "SUCCESS" | "FAILED";

export interface SchedulerRunI {
  id: string;
  executionTime: string;
  status: SchedulerRunStatus;
}

export interface SchedulerRunsResponse {
  runs: Array<SchedulerRunI>;
}
