import React from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "../context/LanguageContext"

export default function JobCard({ job }: any) {
  const navigation = useNavigation<any>()
  const { t } = useTranslation()

  const statusConfig: Record<
    string,
    { label: string; color: string; background: string }
  > = {
    pending: {
      label: t("jobs.pending"),
      color: "#DC2626",
      background: "#FEF2F2",
    },
    progress: {
      label: t("jobs.inProgress"),
      color: "#B45309",
      background: "#FFFBEB",
    },
    waiting_parts: {
      label: t("jobs.waitingParts"),
      color: "#7C3AED",
      background: "#F5F3FF",
    },
    ready: {
      label: t("jobs.ready"),
      color: "#0284C7",
      background: "#F0F9FF",
    },
    completed: {
      label: t("jobs.completed"),
      color: "#15803D",
      background: "#F0FDF4",
    },
    delivered: {
      label: t("jobs.delivered"),
      color: "#475569",
      background: "#F1F5F9",
    },
  }

  const status = statusConfig[job.status] ?? {
    label: String(job.status ?? "pending").replace(/_/g, " "),
    color: "#475569",
    background: "#F1F5F9",
  }

  const amount = Number(job.totalAmount ?? 0)
  const formattedAmount = `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`

  const vehicleType = String(job.vehicleType ?? "").toLowerCase()
  const isTwoWheeler =
    vehicleType.includes("2 wheeler") ||
    vehicleType.includes("two wheeler") ||
    vehicleType.includes("two-wheeler") ||
    vehicleType.includes("two-wheeler") ||
    vehicleType.includes("दोपहिया") ||
    vehicleType.includes("ಬೈಕ್")

  const vehicleIcon = isTwoWheeler ? "motorbike" : "car"

  const workerName = job.workerName?.trim() || "Unassigned"

  const formatDeliveryDate = (value: any): string | null => {
    if (!value || !String(value).trim()) return null

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    })
  }

  const deliveryDate = formatDeliveryDate(job.deliveryDate)

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() =>
        navigation.navigate("JobDetail", {
          jobId: job.jobId,
        })
      }
    >
      {/* ROW 1: Vehicle number and amount */}
      <View style={styles.topRow}>
        <View style={styles.vehicleSection}>
          <MaterialCommunityIcons
            name={vehicleIcon}
            size={17}
            color="#2563EB"
          />
          <Text style={styles.vehicleNumber} numberOfLines={1}>
            {job.vehicleNumber || job.jobId || "Job"}
          </Text>
        </View>

        <Text
          style={styles.amount}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formattedAmount}
        </Text>
      </View>

      {/* ROW 2: Customer, worker, date and status */}
      <View style={styles.bottomRow}>
        <View style={styles.customerSection}>
          <Ionicons name="person-outline" size={12} color="#64748B" />
          <Text style={styles.customerName} numberOfLines={1}>
            {job.customerName || "Unknown"}
          </Text>
        </View>

        <View style={styles.workerSection}>
          <MaterialCommunityIcons
            name="account-hard-hat-outline"
            size={13}
            color="#64748B"
          />
          <Text style={styles.workerName} numberOfLines={1}>
            {workerName}
          </Text>
        </View>

        {deliveryDate ? (
          <View style={styles.dateSection}>
            <Ionicons name="calendar-outline" size={12} color="#64748B" />
            <Text style={styles.deliveryDate} numberOfLines={1}>
              {deliveryDate}
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: status.background },
          ]}
        >
          <Text
            style={[styles.statusText, { color: status.color }]}
            numberOfLines={1}
          >
            {status.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E9EEF5",
  },

  topRow: {
    height: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  vehicleSection: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 8,
  },

  vehicleNumber: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  amount: {
    maxWidth: "42%",
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#15803D",
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },

  bottomRow: {
    height: 21,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 5,
  },

  customerSection: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  customerName: {
    flex: 1,
    minWidth: 0,
    fontSize: 10,
    color: "#475569",
  },

  workerSection: {
    width: 76,
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  workerName: {
    flex: 1,
    minWidth: 0,
    fontSize: 10,
    color: "#64748B",
  },

  dateSection: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  deliveryDate: {
    fontSize: 9,
    color: "#64748B",
  },

  statusBadge: {
    flexShrink: 0,
    maxWidth: 84,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "700",
  },
})