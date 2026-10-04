import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from "react-native"

import {
  Ionicons
} from "@expo/vector-icons"

type Props = {
  customer: any
  onPress?: () => void
  onMenuPress?: () => void
}

export default function CustomerCard({
  customer,
  onPress,
  onMenuPress
}: Props) {

  const firstLetter =
    customer?.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "C"

  const pendingAmount =
    Number(customer?.pendingAmount || 0)

  const totalSpent =
    Number(customer?.totalSpent || 0)

  const totalJobs =
    Number(customer?.totalJobs || 0)

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={onPress}
    >
      {/* AVATAR */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {firstLetter}
        </Text>
      </View>

      {/* CUSTOMER INFO */}
      <View style={styles.customerInfo}>
        <Text
          style={styles.name}
          numberOfLines={1}
        >
          {customer?.name || "Unnamed"}
        </Text>

        <Text
          style={styles.phone}
          numberOfLines={1}
        >
          {customer?.phone || "-"}
        </Text>
      </View>

      {/* JOB COUNT */}
      <View style={styles.jobs}>
        <Text style={styles.jobsValue}>
          {totalJobs}
        </Text>

        <Text style={styles.jobsLabel}>
          visits
        </Text>
      </View>

      {/* AMOUNT */}
      <View style={styles.amountContainer}>
        {pendingAmount > 0 ? (
          <>
            <Text style={styles.pendingAmount}>
              ₹{pendingAmount.toLocaleString("en-IN")}
            </Text>

            <Text style={styles.pendingLabel}>
              due
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.paidAmount}>
              ₹{totalSpent.toLocaleString("en-IN")}
            </Text>

            <Text style={styles.paidLabel}>
              paid
            </Text>
          </>
        )}
      </View>

      {/* THREE DOT MENU */}
      <TouchableOpacity
        style={styles.menuButton}
        activeOpacity={0.7}
        onPress={(event) => {
          event.stopPropagation()
          onMenuPress?.()
        }}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({

  card: {
    minHeight: 62,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center"
  },

  avatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2563EB"
  },

  customerInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10
  },

  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827"
  },

  phone: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2
  },

  jobs: {
    width: 42,
    alignItems: "center"
  },

  jobsValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151"
  },

  jobsLabel: {
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 1
  },

  amountContainer: {
    width: 76,
    alignItems: "flex-end",
    marginRight: 3
  },

  pendingAmount: {
    fontSize: 12,
    fontWeight: "800",
    color: "#DC2626"
  },

  pendingLabel: {
    fontSize: 9,
    color: "#DC2626",
    marginTop: 1
  },

  paidAmount: {
    fontSize: 12,
    fontWeight: "800",
    color: "#16A34A"
  },

  paidLabel: {
    fontSize: 9,
    color: "#16A34A",
    marginTop: 1
  },

  menuButton: {
    width: 34,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  }

})