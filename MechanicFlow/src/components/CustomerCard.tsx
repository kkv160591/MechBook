import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from "react-native"

import {
  Ionicons,
  MaterialIcons
} from "@expo/vector-icons"

type Props = {
  customer: any
  onPress?: () => void
}

export default function CustomerCard({
  customer,
  onPress
}: Props) {

  return (

    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >

      {/* TOP */}

      <View style={styles.topRow}>

        <View style={styles.avatar}>

          <Text style={styles.avatarText}>
            {customer.name?.charAt(0)}
          </Text>

        </View>

        <View style={{ flex: 1 }}>

          <Text style={styles.name}>
            {customer.name}
          </Text>

          <Text style={styles.phone}>
            {customer.phone}
          </Text>

        </View>

        <TouchableOpacity style={styles.callBtn}>

          <Ionicons
            name="call"
            size={18}
            color="#2563EB"
          />

        </TouchableOpacity>

      </View>

      {/* STATS */}

      <View style={styles.statsRow}>

        <View style={styles.statBox}>

          <Text style={styles.statValue}>
            {customer.totalVehicles}
          </Text>

          <Text style={styles.statLabel}>
            Vehicles
          </Text>

        </View>

        <View style={styles.statBox}>

          <Text style={styles.statValue}>
            {customer.totalJobs}
          </Text>

          <Text style={styles.statLabel}>
            Visits
          </Text>

        </View>

        <View style={styles.statBox}>

          <Text
            style={[
              styles.statValue,
              { color: "#16A34A" }
            ]}
          >
            ₹{customer.totalSpent}
          </Text>

          <Text style={styles.statLabel}>
            Spent
          </Text>

        </View>

      </View>

      {/* FOOTER */}

      <View style={styles.footer}>

        <View style={styles.footerLeft}>

          <MaterialIcons
            name="schedule"
            size={16}
            color="#6B7280"
          />

          <Text style={styles.footerText}>
            Last Visit {customer.lastVisit}
          </Text>

        </View>

        {customer.pendingAmount > 0 && (

          <View style={styles.pendingBadge}>

            <Text style={styles.pendingText}>
              Due ₹{customer.pendingAmount}
            </Text>

          </View>

        )}

      </View>

    </TouchableOpacity>

  )

}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center"
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },

  avatarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563EB"
  },

  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827"
  },

  phone: {
    marginTop: 5,
    color: "#6B7280"
  },

  callBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center"
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20
  },

  statBox: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 4
  },

  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827"
  },

  statLabel: {
    marginTop: 5,
    color: "#6B7280",
    fontSize: 12
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18
  },

  footerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },

  footerText: {
    marginLeft: 6,
    color: "#6B7280",
    fontSize: 12
  },

  pendingBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20
  },

  pendingText: {
    color: "#DC2626",
    fontWeight: "bold",
    fontSize: 12
  }

})