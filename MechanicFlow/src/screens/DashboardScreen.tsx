import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView
} from "react-native"

import {
  MaterialIcons,
  Ionicons,
  FontAwesome5
} from "@expo/vector-icons"

import { useNavigation } from "@react-navigation/native"

const stats = [
  {
    id: 1,
    title: "Today's Jobs",
    value: 8,
    icon: "build"
  },
  {
    id: 2,
    title: "Pending",
    value: 3,
    icon: "pending-actions"
  },
  {
    id: 3,
    title: "Completed",
    value: 5,
    icon: "check-circle"
  },
  {
    id: 4,
    title: "Revenue",
    value: "₹12k",
    icon: "payments"
  }
]

const jobs = [
  {
    id: 1,
    vehicle: "Honda Activa",
    customer: "Raj",
    status: "In Progress",
    amount: "₹2500"
  },
  {
    id: 2,
    vehicle: "Swift Dzire",
    customer: "Amit",
    status: "Pending",
    amount: "₹5200"
  },
  {
    id: 3,
    vehicle: "Pulsar 150",
    customer: "Vikas",
    status: "Completed",
    amount: "₹1800"
  }
]

export default function DashboardScreen() {

  const navigation: any = useNavigation()

  const getStatusColor = (status: string) => {

    if (status === "Completed") return "#16A34A"

    if (status === "Pending") return "#DC2626"

    return "#2563EB"
  }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <View style={styles.headerRow}>

        <View>
          <Text style={styles.greeting}>
            Good Morning 👋
          </Text>

          <Text style={styles.header}>
            MechanicFlow
          </Text>
        </View>

        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="person" size={22} color="#111827" />
        </TouchableOpacity>

      </View>

      {/* STATS */}

      <View style={styles.statsContainer}>

        {stats.map((item) => (

          <View key={item.id} style={styles.card}>

            <View style={styles.iconBox}>
              <MaterialIcons
                name={item.icon as any}
                size={22}
                color="#2563EB"
              />
            </View>

            <Text style={styles.cardValue}>
              {item.value}
            </Text>

            <Text style={styles.cardTitle}>
              {item.title}
            </Text>

          </View>

        ))}

      </View>

      {/* QUICK ACTIONS */}

      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <View style={styles.quickActions}>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate("CreateJob")}
        >
          <MaterialIcons
            name="add-circle"
            size={28}
            color="#2563EB"
          />

          <Text style={styles.actionText}>
            Create Job
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <FontAwesome5
            name="file-invoice"
            size={22}
            color="#2563EB"
          />

          <Text style={styles.actionText}>
            Invoices
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons
            name="people"
            size={24}
            color="#2563EB"
          />

          <Text style={styles.actionText}>
            Customers
          </Text>
        </TouchableOpacity>

      </View>

      {/* RECENT JOBS */}

      <View style={styles.sectionRow}>

        <Text style={styles.sectionTitle}>
          Recent Jobs
        </Text>

        <TouchableOpacity>
          <Text style={styles.viewAll}>
            View All
          </Text>
        </TouchableOpacity>

      </View>

      {jobs.map((item) => (

        <TouchableOpacity
          key={item.id}
          style={styles.jobCard}
        >

          <View style={styles.jobTop}>

            <View>
              <Text style={styles.vehicle}>
                {item.vehicle}
              </Text>

              <Text style={styles.customer}>
                {item.customer}
              </Text>
            </View>

            <Text style={styles.amount}>
              {item.amount}
            </Text>

          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  getStatusColor(item.status)
              }
            ]}
          >

            <Text style={styles.statusText}>
              {item.status}
            </Text>

          </View>

        </TouchableOpacity>

      ))}

    </ScrollView>

  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25
  },

  greeting: {
    color: "#6B7280",
    fontSize: 14
  },

  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4
  },

  profileBtn: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  },

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  card: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },

  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827"
  },

  cardTitle: {
    color: "#6B7280",
    marginTop: 4
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 15,
    marginTop: 10
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25
  },

  actionBtn: {
    backgroundColor: "white",
    width: "31%",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center"
  },

  actionText: {
    marginTop: 10,
    fontWeight: "600",
    color: "#374151"
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  viewAll: {
    color: "#2563EB",
    fontWeight: "600"
  },

  jobCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14
  },

  jobTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  vehicle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827"
  },

  customer: {
    marginTop: 5,
    color: "#6B7280"
  },

  amount: {
    fontWeight: "bold",
    color: "#16A34A",
    fontSize: 16
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    marginTop: 15
  },

  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12
  }

})