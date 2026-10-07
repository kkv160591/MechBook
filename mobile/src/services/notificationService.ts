import api from "./api"

// ============================================================
// GET NOTIFICATIONS
// ============================================================

export const getNotifications = async () => {
  const response =
    await api.get(
      "/api/notifications"
    )

  return response.data
}

// ============================================================
// GET UNREAD COUNT
// ============================================================

export const getNotificationUnreadCount =
  async () => {
    const response =
      await api.get(
        "/api/notifications/unread-count"
      )

    return response.data
  }

// ============================================================
// MARK ONE AS READ
// ============================================================

export const markNotificationAsRead =
  async (
    notificationId: string
  ) => {
    const response =
      await api.patch(
        `/api/notifications/${notificationId}/read`
      )

    return response.data
  }

// ============================================================
// MARK ALL AS READ
// ============================================================

export const markAllNotificationsAsRead =
  async () => {
    const response =
      await api.patch(
        "/api/notifications/read-all"
      )

    return response.data
  }