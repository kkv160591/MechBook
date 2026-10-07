import { Request, Response } from "express"

import {
  getOwnerNotifications,
  getOwnerUnreadCount,
  markNotificationAsRead,
  markAllOwnerNotificationsAsRead,
} from "../services/notification.service"

// ============================================================
// GET NOTIFICATIONS
// ============================================================

export const getNotifications = async (
  req: any,
  res: Response
) => {
  try {
    const garageId =
      req.user?.garageId

    const userId =
      req.user?.userId

    if (!garageId || !userId) {
      return res.status(401).json({
        success: false,
        message:
          "User identity missing",
      })
    }

    const notifications =
      await getOwnerNotifications(
        garageId,
        userId
      )

    const unreadCount =
      notifications.filter(
        (notification: any) =>
          notification.status === "UNREAD"
      ).length

    return res.json({
      success: true,
      notifications,
      unreadCount,
    })
  } catch (error: any) {
    console.error(
      "GET NOTIFICATIONS ERROR:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch notifications",
    })
  }
}

// ============================================================
// GET UNREAD COUNT
// ============================================================

export const getUnreadCount = async (
  req: any,
  res: Response
) => {
  try {
    const garageId =
      req.user?.garageId

    const userId =
      req.user?.userId

    if (!garageId || !userId) {
      return res.status(401).json({
        success: false,
        message:
          "User identity missing",
      })
    }

    const unreadCount =
      await getOwnerUnreadCount(
        garageId,
        userId
      )

    return res.json({
      success: true,
      unreadCount,
    })
  } catch (error: any) {
    console.error(
      "GET UNREAD COUNT ERROR:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch unread count",
    })
  }
}

// ============================================================
// MARK ONE AS READ
// ============================================================

export const markAsRead = async (
  req: any,
  res: Response
) => {
  try {
    const garageId =
      req.user?.garageId

    const userId =
      req.user?.userId

    const notificationId =
      req.params.notificationId

    if (!garageId || !userId) {
      return res.status(401).json({
        success: false,
        message:
          "User identity missing",
      })
    }

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message:
          "Notification ID is required",
      })
    }

    await markNotificationAsRead(
      garageId,
      userId,
      notificationId
    )

    return res.json({
      success: true,
      message:
        "Notification marked as read",
    })
  } catch (error: any) {
    console.error(
      "MARK NOTIFICATION READ ERROR:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark notification as read",
    })
  }
}

// ============================================================
// MARK ALL AS READ
// ============================================================

export const markAllAsRead = async (
  req: any,
  res: Response
) => {
  try {
    const garageId =
      req.user?.garageId

    const userId =
      req.user?.userId

    if (!garageId || !userId) {
      return res.status(401).json({
        success: false,
        message:
          "User identity missing",
      })
    }

    const count =
      await markAllOwnerNotificationsAsRead(
        garageId,
        userId
      )

    return res.json({
      success: true,
      message:
        "Notifications marked as read",
      count,
    })
  } catch (error: any) {
    console.error(
      "MARK ALL NOTIFICATIONS READ ERROR:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark notifications as read",
    })
  }
}