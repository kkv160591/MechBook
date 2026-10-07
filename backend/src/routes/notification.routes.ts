import { Router } from "express"

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller"

import { verifyToken } from "../middleware/auth.middleware"

const router = Router()

// Get owner's notifications
router.get(
  "/",
  verifyToken,
  getNotifications
)

// Get unread count
router.get(
  "/unread-count",
  verifyToken,
  getUnreadCount
)

// Mark all as read
router.patch(
  "/read-all",
  verifyToken,
  markAllAsRead
)

// Mark one as read
router.patch(
  "/:notificationId/read",
  verifyToken,
  markAsRead
)

export default router