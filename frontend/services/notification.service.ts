import api from "@/lib/api";
import type {
    NotificationListResponse,
} from "@/types/notification";

export async function getNotifications(
    page = 1,
    limit = 20,
): Promise<NotificationListResponse> {
    const response =
        await api.get<NotificationListResponse>(
            "/admin/notifications",
            {
                params: {
                    page,
                    limit,
                },
            },
        );

    return response.data;
}

export async function markNotificationAsRead(
    notificationId: number,
): Promise<void> {
    await api.patch(
        `/admin/notifications/${notificationId}/read`,
    );
}

export async function markAllNotificationsAsRead():
    Promise<void> {
    await api.patch(
        "/admin/notifications/read-all",
    );
}