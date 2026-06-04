import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from "react-native"

import {
  RouteProp
} from "@react-navigation/native"

import {
  Ionicons,
  MaterialIcons
} from "@expo/vector-icons"

import { RootStackParamList } from "../../types/navigation"

type Props = {
  route: RouteProp<
    RootStackParamList,
    "CustomerDetail"
  >
}

const jobs = [
  {
    id: "1",
    vehicle: "Honda Activa",
    amount: 2500,
    status: "Completed"
  },
  {
    id: "2",
    vehicle: "Swift Dzire",
    amount: 5200,
    status: "Pending"
  }
]

export default function CustomerDetailScreen({
  route
}: Props) {

  const { customer } = route.params

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <View style={styles.headerCard}>

        <View style={styles.avatar}>

          <Text style={styles.avatarText}>
            {customer.name?.charAt(0)}
          </Text>

        </View>

        <Text style={styles.name}>
          {customer.name}
        </Text>

        <Text style={styles.phone}>
          {customer.phone}
        </Text>

        <View style={styles.actionRow}>

          <TouchableOpacity style={styles.actionBtn}>

            <Ionicons
              name="call"
              size={18}
              color="#2563EB"
            />

            <Text style={styles.actionText}>
              Call
            </Text>

          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>

            <Ionicons
              name="logo-whatsapp"
              size={18}
              color="#16A34A"
            />

            <Text style={styles.actionText}>
              WhatsApp
            </Text>

          </TouchableOpacity>

        </View>

      </View>

      {/* STATS */}

      <View style={styles.statsRow}>

        <View style={styles.statCard}>

          <Text style={styles.statValue}>
            {customer.totalJobs}
          </Text>

          <Text style={styles.statLabel}>
            Visits
          </Text>

        </View>

        <View style={styles.statCard}>

          <Text style={styles.statValue}>
            {customer.totalVehicles}
          </Text>

          <Text style={styles.statLabel}>
            Vehicles
          </Text>

        </View>

        <View style={styles.statCard}>

          <Text
            style={[
              styles.statValue,
              { color: "#16A34A" }
            ]}
          >
            ₹{customer.totalSpent}
          </Text>

          <Text style={styles.statLabel}>
            Revenue
          </Text>

        </View>

      </View>

      {/* INFO */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Customer Information
        </Text>

        <View style={styles.infoRow}>

          <MaterialIcons
            name="phone"
            size={18}
            color="#6B7280"
          />

          <Text style={styles.infoText}>
            {customer.phone}
          </Text>

        </View>

        <View style={styles.infoRow}>

          <Ionicons
            name="cash-outline"
            size={18}
            color="#6B7280"
          />

          <Text style={styles.infoText}>
            Pending ₹{customer.pendingAmount}
          </Text>

        </View>

      </View>

      {/* HISTORY */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Service History
        </Text>

        {jobs.map((job) => (

          <View
            key={job.id}
            style={styles.jobCard}
          >

            <View>

              <Text style={styles.vehicle}>
                {job.vehicle}
              </Text>

              <Text style={styles.jobStatus}>
                {job.status}
              </Text>

            </View>

            <Text style={styles.amount}>
              ₹{job.amount}
            </Text>

          </View>

        ))}

      </View>

      <View style={{ height: 40 }} />

    </ScrollView>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 18
  },

  headerCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center"
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center"
  },

  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2563EB"
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 18,
    color: "#111827"
  },

  phone: {
    marginTop: 6,
    color: "#6B7280"
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 22
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    marginHorizontal: 6
  },

  actionText: {
    marginLeft: 8,
    fontWeight: "600",
    color: "#111827"
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20
  },

  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    marginHorizontal: 4
  },

  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827"
  },

  statLabel: {
    marginTop: 5,
    color: "#6B7280"
  },

  sectionCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    marginTop: 20
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14
  },

  infoText: {
    marginLeft: 10,
    color: "#111827"
  },

  jobCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  vehicle: {
    fontWeight: "bold",
    color: "#111827"
  },

  jobStatus: {
    marginTop: 5,
    color: "#6B7280"
  },

  amount: {
    fontWeight: "bold",
    color: "#16A34A"
  }

})