import { ActivityType } from "./activity-log";

export interface RecentActivity {
    id: number;
    user: string;
    type: ActivityType;
    detail: string;
    time: string;
	amount?: string;
}
