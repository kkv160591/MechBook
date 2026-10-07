import React, {
  useCallback,
  useState,
} from "react"

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native"

import {
  Ionicons,
} from "@expo/vector-icons"

import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native"

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService"

type NotificationItem = {
  notificationId: string
  type: string
  title: string
  message: string
  status: string
  jobId?: string
  customerId?: string
  vehicleNumber?: string
  createdAt?: string
  scheduledAt?: string
  dueDate?: string
  dueKm?: number
}

// ============================================================
// HELPERS
// ============================================================

const formatTime = (
  dateString?: string
) => {
  if (!dateString) {
    return ""
  }

  const date =
    new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const now =
    new Date()

  const diff =
    now.getTime() -
    date.getTime()

  const minutes =
    Math.floor(
      diff / 60000
    )

  if (minutes < 1) {
    return "Just now"
  }

  if (minutes < 60) {
    return `${minutes} min ago`
  }

  const hours =
    Math.floor(
      minutes / 60
    )

  if (hours < 24) {
    return `${hours} hr ago`
  }

  const days =
    Math.floor(
      hours / 24
    )

  if (days < 7) {
    return `${days} day${
      days > 1 ? "s" : ""
    } ago`
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )
}

const getNotificationIcon = (
  type: string
) => {
  switch (
    String(type || "").toUpperCase()
  ) {
    case "JOB_COMPLETED":
      return {
        name: "checkmark-circle-outline" as const,
        color: "#16A34A",
        background: "#DCFCE7",
      }

    case "SERVICE_DUE":
      return {
        name: "car-outline" as const,
        color: "#2563EB",
        background: "#DBEAFE",
      }

    default:
      return {
        name: "notifications-outline" as const,
        color: "#64748B",
        background: "#F1F5F9",
      }
  }
}

// ============================================================
// SCREEN
// ============================================================

export default function NotificationScreen() {
  const navigation =
    useNavigation<any>()

  const [
    notifications,
    setNotifications,
  ] = useState<
    NotificationItem[]
  >([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    refreshing,
    setRefreshing,
  ] = useState(false)

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0)

  // ----------------------------------------------------------
  // LOAD
  // ----------------------------------------------------------

  const loadNotifications =
    useCallback(
      async (
        showLoader = true
      ) => {
        try {
          if (showLoader) {
            setLoading(true)
          }

          const response =
            await getNotifications()

          const items =
            Array.isArray(
              response?.notifications
            )
              ? response.notifications
              : []

          setNotifications(items)

          setUnreadCount(
            Number(
              response?.unreadCount ||
                items.filter(
                  (item: NotificationItem) =>
                    item.status ===
                    "UNREAD"
                ).length
            )
          )
        } catch (error) {
          console.log(
            "Load notifications error:",
            error
          )
        } finally {
          setLoading(false)
          setRefreshing(false)
        }
      },
      []
    )

  useFocusEffect(
    useCallback(() => {
      loadNotifications()
    }, [loadNotifications])
  )

  // ----------------------------------------------------------
  // REFRESH
  // ----------------------------------------------------------

  const onRefresh = async () => {
    setRefreshing(true)

    await loadNotifications(
      false
    )
  }

  // ----------------------------------------------------------
  // MARK READ
  // ----------------------------------------------------------

  const handleNotificationPress =
    async (
      item: NotificationItem
    ) => {
      try {
        if (
          item.status ===
          "UNREAD"
        ) {
          await markNotificationAsRead(
            item.notificationId
          )

          setNotifications(
            previous =>
              previous.map(
                notification =>
                  notification.notificationId ===
                  item.notificationId
                    ? {
                        ...notification,
                        status:
                          "READ",
                      }
                    : notification
              )
          )

          setUnreadCount(
            count =>
              Math.max(
                0,
                count - 1
              )
          )
        }
      } catch (error) {
        console.log(
          "Mark notification read error:",
          error
        )
      }

      // Open the related job when available.
      if (item.jobId) {
        navigation.navigate(
          "JobDetail",
          {
            jobId:
              item.jobId,
          }
        )
      }
    }

  // ----------------------------------------------------------
  // MARK ALL READ
  // ----------------------------------------------------------

  const handleMarkAllRead =
    async () => {
      if (
        unreadCount === 0
      ) {
        return
      }

      try {
        await markAllNotificationsAsRead()

        setNotifications(
          previous =>
            previous.map(
              notification => ({
                ...notification,
                status:
                  notification.status ===
                  "UNREAD"
                    ? "READ"
                    : notification.status,
              })
            )
        )

        setUnreadCount(0)
      } catch (error) {
        console.log(
          "Mark all notifications read error:",
          error
        )
      }
    }

  // ----------------------------------------------------------
  // RENDER ITEM
  // ----------------------------------------------------------

  const renderItem = ({
    item,
  }: {
    item: NotificationItem
  }) => {
    const icon =
      getNotificationIcon(
        item.type
      )

    const unread =
      item.status ===
      "UNREAD"

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,

          unread &&
            styles.unreadCard,
        ]}
        activeOpacity={0.75}
        onPress={() =>
          handleNotificationPress(
            item
          )
        }
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                icon.background,
            },
          ]}
        >
          <Ionicons
            name={icon.name}
            size={23}
            color={icon.color}
          />
        </View>

        <View
          style={
            styles.notificationContent
          }
        >
          <View
            style={
              styles.titleRow
            }
          >
            <Text
              style={[
                styles.notificationTitle,
                unread &&
                  styles.unreadTitle,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            {unread && (
              <View
                style={
                  styles.unreadDot
                }
              />
            )}
          </View>

          <Text
            style={
              styles.notificationMessage
            }
            numberOfLines={2}
          >
            {item.message}
          </Text>

          {item.vehicleNumber && (
            <Text
              style={
                styles.vehicleText
              }
            >
              {item.vehicleNumber}
            </Text>
          )}

          {item.dueDate && (
            <Text
              style={
                styles.dueText
              }
            >
              Due:{" "}
              {new Date(
                item.dueDate
              ).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}

              {item.dueKm
                ? ` • ${Number(
                    item.dueKm
                  ).toLocaleString(
                    "en-IN"
                  )} km`
                : ""}
            </Text>
          )}

          <Text
            style={
              styles.timeText
            }
          >
            {formatTime(
              item.createdAt ||
                item.scheduledAt
            )}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#CBD5E1"
        />
      </TouchableOpacity>
    )
  }

  // ----------------------------------------------------------
  // EMPTY
  // ----------------------------------------------------------

  const renderEmpty = () => {
    if (loading) {
      return null
    }

    return (
      <View
        style={
          styles.emptyContainer
        }
      >
        <View
          style={
            styles.emptyIcon
          }
        >
          <Ionicons
            name="notifications-off-outline"
            size={34}
            color="#94A3B8"
          />
        </View>

        <Text
          style={
            styles.emptyTitle
          }
        >
          No notifications
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          Job updates and service reminders
          will appear here.
        </Text>
      </View>
    )
  }

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  return (
    <View
      style={
        styles.container
      }
    >
      {/* HEADER */}
      <View
        style={
          styles.header
        }
      >
        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#111827"
          />
        </TouchableOpacity>

        <View
          style={
            styles.headerCenter
          }
        >
          <Text
            style={
              styles.headerTitle
            }
          >
            Notifications
          </Text>

          {unreadCount > 0 && (
            <View
              style={
                styles.headerBadge
              }
            >
              <Text
                style={
                  styles.headerBadgeText
                }
              >
                {unreadCount}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={
            styles.markAllButton
          }
          onPress={
            handleMarkAllRead
          }
          disabled={
            unreadCount === 0
          }
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.markAllText,
              unreadCount === 0 &&
                styles.markAllDisabled,
            ]}
          >
            Mark all
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={notifications}
        keyExtractor={item =>
          item.notificationId
        }
        renderItem={
          renderItem
        }
        contentContainerStyle={[
          styles.listContent,
          notifications.length ===
            0 &&
            styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
          />
        }
        ListEmptyComponent={
          renderEmpty
        }
      />
    </View>
  )
}

// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      minHeight: 64,
      paddingHorizontal: 16,
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor:
        "#E5E7EB",
    },

    backButton: {
      width: 40,
      height: 40,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    headerCenter: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
      marginLeft: 4,
    },

    headerTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: "#111827",
    },

    headerBadge: {
      minWidth: 22,
      height: 22,
      paddingHorizontal: 6,
      borderRadius: 11,
      backgroundColor:
        "#2563EB",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginLeft: 8,
    },

    headerBadgeText: {
      fontSize: 11,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    markAllButton: {
      paddingHorizontal: 6,
      paddingVertical: 8,
    },

    markAllText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#2563EB",
    },

    markAllDisabled: {
      color: "#94A3B8",
    },

    listContent: {
      padding: 14,
      paddingBottom: 30,
    },

    emptyListContent: {
      flexGrow: 1,
      justifyContent:
        "center",
    },

    notificationCard: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor:
        "#EEF2F7",
    },

    unreadCard: {
      borderColor:
        "#DBEAFE",
      backgroundColor:
        "#F8FBFF",
    },

    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    notificationContent: {
      flex: 1,
      minWidth: 0,
    },

    titleRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    notificationTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      color: "#334155",
    },

    unreadTitle: {
      color: "#111827",
      fontWeight: "800",
    },

    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        "#2563EB",
      marginLeft: 8,
    },

    notificationMessage: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      color: "#64748B",
    },

    vehicleText: {
      marginTop: 6,
      fontSize: 11,
      fontWeight: "800",
      color: "#334155",
    },

    dueText: {
      marginTop: 3,
      fontSize: 11,
      color: "#2563EB",
      fontWeight: "600",
    },

    timeText: {
      marginTop: 6,
      fontSize: 10,
      color: "#94A3B8",
    },

    emptyContainer: {
      alignItems:
        "center",
      paddingHorizontal: 30,
    },

    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom: 14,
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: "#334155",
    },

    emptyText: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 18,
      color: "#94A3B8",
      textAlign:
        "center",
    },
  })