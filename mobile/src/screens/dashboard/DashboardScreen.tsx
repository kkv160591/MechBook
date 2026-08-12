// DashboardScreen.tsx

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native"

import {
  useState
} from "react"

import {
  MaterialIcons,
  Ionicons,
  FontAwesome5,
  Feather
} from "@expo/vector-icons"

import { useNavigation } from "@react-navigation/native"
import { dummyJobs } from "../../data/dummyJobs"

import {
  useAuth
} from "../../context/AuthContext"

export default function DashboardScreen() {

  const [menuVisible, setMenuVisible] = useState(false)

  const {
    user,
    logout
  } = useAuth()

  const handleLogout = async () => {

    console.log("Logout button pressed")
  try {

    await logout()

  } catch (error) {

    console.log("Logout error:", error)

    Alert.alert(
      "Logout Failed",
      "Unable to logout. Please try again."
    )

  }

}

  const navigation: any = useNavigation()

  const todayJobs = dummyJobs.length

  const completedJobs = dummyJobs.filter(
    j => j.status === "completed"
  ).length

  const pendingJobs = dummyJobs.filter(
    j => j.status === "pending"
  ).length

  const inProgressJobs = dummyJobs.filter(
    j => j.status === "progress"
  ).length

  const totalRevenue = dummyJobs.reduce((sum, job) => {

    const total = job.services.reduce(
      (s: number, item: any) =>
        s + (item.actualPrice ?? item.estimatedPrice),
      0
    )

    return sum + total

  }, 0)

  const pendingPayments = 2
  const lowStockItems = 4
  const jobsUsed = 18
  const jobLimit = 20

  const jobsRemaining =
    jobLimit - jobsUsed

  const usagePercent =
    Math.round(
      (jobsUsed / jobLimit) * 100
    )

  const recentJobs = dummyJobs.slice(0, 4)

  const getStatusColor = (status: string) => {

    if (status === "completed") return "#16A34A"

    if (status === "pending") return "#DC2626"

    if (status === "progress") return "#EA580C"

    return "#2563EB"

  }

  const getStatusText = (status: string) => {

    if (status === "completed") return "COMPLETED"

    if (status === "pending") return "PENDING"

    if (status === "progress") return "IN PROGRESS"

    return status.toUpperCase()

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
            Welcome Back 👋
          </Text>

          <Text style={styles.header}>
            GarageBook
          </Text>

          <Text style={styles.subHeader}>
            RK Auto Service Center
          </Text>

          <Text style={styles.roleText}>
            {user?.role?.toUpperCase()}
          </Text>

        </View>

        <View style={styles.headerRight}>

          <TouchableOpacity
            style={styles.planRing}
            onPress={() =>
              navigation.navigate("PlanUsage")
            }
          >

            <Text style={styles.planRingNumber}>
              {usagePercent}%
            </Text>

            <Text style={styles.planRingLabel}>
              USED
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              setMenuVisible(true)
            }
            activeOpacity={0.7}
          >

            <Ionicons
              name="ellipsis-vertical"
              size={24}
              color="#111827"
            />

          </TouchableOpacity>

        </View>

      </View>
      {menuVisible && (

  <View style={styles.menuOverlay}>

    <TouchableOpacity
      style={styles.menuBackdrop}
      activeOpacity={1}
      onPress={() =>
        setMenuVisible(false)
      }
    />

    <View style={styles.menuCard}>

      <View style={styles.menuHeader}>

        <View style={styles.menuAvatar}>

          <Ionicons
            name="person"
            size={20}
            color="#2563EB"
          />

        </View>

        <View style={{ flex: 1 }}>

          <Text style={styles.menuUserName}>
            {user?.name || "Garage User"}
          </Text>

          <Text style={styles.menuRole}>
            {user?.role?.toUpperCase() || "WORKER"}
          </Text>

        </View>

      </View>

      <View style={styles.menuDivider} />

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {

          setMenuVisible(false)

          navigation.navigate("Settings")

        }}
      >

        <View style={styles.menuIcon}>

          <Ionicons
            name="settings-outline"
            size={20}
            color="#2563EB"
          />

        </View>

        <Text style={styles.menuItemText}>
          Settings
        </Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#9CA3AF"
        />

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {

          setMenuVisible(false)

          navigation.navigate("PlanUsage")

        }}
      >

        <View style={styles.menuIcon}>

          <Ionicons
            name="card-outline"
            size={20}
            color="#2563EB"
          />

        </View>

        <Text style={styles.menuItemText}>
          Subscription & Usage
        </Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#9CA3AF"
        />

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {

          setMenuVisible(false)

          navigation.navigate("Workers")

        }}
      >

        <View style={styles.menuIcon}>

          <Ionicons
            name="people-outline"
            size={20}
            color="#2563EB"
          />

        </View>

        <Text style={styles.menuItemText}>
          Workers
        </Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#9CA3AF"
        />

      </TouchableOpacity>

      <View style={styles.menuDivider} />

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {

          setMenuVisible(false)

          Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              {
                text: "Logout",
                style: "destructive",
                onPress: handleLogout
              }
            ]
          )

        }}
      >

        <View
          style={[
            styles.menuIcon,
            {
              backgroundColor: "#FEF2F2"
            }
          ]}
        >

          <Ionicons
            name="log-out-outline"
            size={20}
            color="#DC2626"
          />

        </View>

        <Text
          style={[
            styles.menuItemText,
            {
              color: "#DC2626"
            }
          ]}
        >
          Logout
        </Text>

      </TouchableOpacity>

    </View>

  </View>

)}
      {/* STATS */}

      <View style={styles.statsContainer}>

        <View style={styles.card}>

          <View style={styles.iconBox}>
            <MaterialIcons
              name="build"
              size={22}
              color="#2563EB"
            />
          </View>

          <Text style={styles.cardValue}>
            {todayJobs}
          </Text>

          <Text style={styles.cardTitle}>
            Total Jobs
          </Text>

        </View>

        <View style={styles.card}>

          <View
            style={[
              styles.iconBox,
              { backgroundColor: "#FEF2F2" }
            ]}
          >
            <MaterialIcons
              name="pending-actions"
              size={22}
              color="#DC2626"
            />
          </View>

          <Text style={styles.cardValue}>
            {pendingJobs}
          </Text>

          <Text style={styles.cardTitle}>
            Pending Jobs
          </Text>

        </View>

        <View style={styles.card}>

          <View
            style={[
              styles.iconBox,
              { backgroundColor: "#ECFDF5" }
            ]}
          >
            <MaterialIcons
              name="check-circle"
              size={22}
              color="#16A34A"
            />
          </View>

          <Text style={styles.cardValue}>
            {completedJobs}
          </Text>

          <Text style={styles.cardTitle}>
            Completed
          </Text>

        </View>

        <View style={styles.card}>

          <View
            style={[
              styles.iconBox,
              { backgroundColor: "#EFF6FF" }
            ]}
          >
            <MaterialIcons
              name="payments"
              size={22}
              color="#2563EB"
            />
          </View>

          <Text style={styles.cardValue}>
            ₹{totalRevenue}
          </Text>

          <Text style={styles.cardTitle}>
            Revenue
          </Text>

        </View>

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

        <TouchableOpacity
          style={styles.actionBtn}
        >

          <FontAwesome5
            name="file-invoice"
            size={22}
            color="#2563EB"
          />

          <Text style={styles.actionText}>
            Invoices
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
        >

          <Ionicons
            name="people"
            size={24}
            color="#2563EB"
          />

          <Text style={styles.actionText}>
            Customers
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
        >

          <Feather
            name="package"
            size={24}
            color="#2563EB"
          />

          <Text style={styles.actionText}>
            Inventory
          </Text>

        </TouchableOpacity>

      </View>

      {/* BUSINESS ALERTS */}

      <Text style={styles.sectionTitle}>
        Alerts & Reminders
      </Text>

      <View style={styles.alertCard}>

        <View style={styles.alertRow}>

          <Ionicons
            name="warning-outline"
            size={20}
            color="#EA580C"
          />

          <Text style={styles.alertText}>
            {pendingPayments} pending payments need follow-up
          </Text>

        </View>

        <View style={styles.divider} />

        <View style={styles.alertRow}>

          <Feather
            name="package"
            size={18}
            color="#DC2626"
          />

          <Text style={styles.alertText}>
            {lowStockItems} spare parts are low in stock
          </Text>

        </View>

      </View>

      {/* RECENT JOBS */}

      <View style={styles.sectionRow}>

        <Text style={styles.sectionTitle}>
          Recent Jobs
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("Jobs")}
        >

          <Text style={styles.viewAll}>
            View All
          </Text>

        </TouchableOpacity>

      </View>

      {recentJobs.map((item) => {

        const total = item.services.reduce(
          (sum: number, s: any) =>
            sum + (s.actualPrice ?? s.estimatedPrice),
          0
        )

        return (

          <TouchableOpacity
            key={item.id}
            style={styles.jobCard}
            onPress={() =>
              navigation.navigate("JobDetail", {
                job: item
              })
            }
          >

            <View style={styles.jobTop}>

              <View style={{ flex: 1 }}>

                <View style={styles.vehicleRow}>

                  <View style={styles.vehicleIcon}>

                    <Ionicons
                      name={
                        item.vehicleType === "2 Wheeler"
                          ? "bicycle"
                          : "car-sport"
                      }
                      size={16}
                      color="#2563EB"
                    />

                  </View>

                  <View>

                    <Text style={styles.vehicle}>
                      {item.vehicleNumber}
                    </Text>

                    <Text style={styles.vehicleModel}>
                      {item.vehicleModel}
                    </Text>

                  </View>

                </View>

                <Text style={styles.customer}>
                  {item.customer}
                </Text>

              </View>

              <Text style={styles.amount}>
                ₹{total}
              </Text>

            </View>

            <View style={styles.jobBottom}>

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
                  {getStatusText(item.status)}
                </Text>

              </View>

              <Text style={styles.servicesText}>
                {item.services.length} services
              </Text>

            </View>

          </TouchableOpacity>

        )

      })}

      <View style={{ height: 100 }} />

    </ScrollView>

  )

}

const styles = StyleSheet.create({

  headerRight: {
    flexDirection: "row",
    alignItems: "center"
  },

  planRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },

  planRingNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563EB"
  },

  planRingLabel: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "600"
  },

  usageCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  usageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },

  usageText: {
    color: "#6B7280",
    marginTop: 4
  },

  usageBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },

  usageBadgeText: {
    color: "#2563EB",
    fontWeight: "700"
  },

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 18,
    paddingTop: 18
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22
  },

  greeting: {
    color: "#6B7280",
    fontSize: 14
  },

  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4
  },

  subHeader: {
    color: "#6B7280",
    marginTop: 3
  },

  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
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
    borderRadius: 20,
    padding: 18,
    marginBottom: 15
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
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
    marginTop: 5,
    fontSize: 13
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 14,
    marginTop: 8
  },

  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12
  },

  actionBtn: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
    marginBottom: 14
  },

  actionText: {
    marginTop: 10,
    fontWeight: "600",
    color: "#374151"
  },

  alertCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12
  },

  alertRow: {
    flexDirection: "row",
    alignItems: "center"
  },

  alertText: {
    marginLeft: 10,
    color: "#374151",
    fontWeight: "500"
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 14
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
    borderRadius: 20,
    padding: 18,
    marginBottom: 14
  },

  jobTop: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  vehicleRow: {
    flexDirection: "row",
    alignItems: "center"
  },

  vehicleIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },

  vehicle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827"
  },

  vehicleModel: {
    color: "#6B7280",
    marginTop: 2
  },

  customer: {
    marginTop: 14,
    color: "#374151",
    fontWeight: "500"
  },

  amount: {
    fontWeight: "bold",
    color: "#16A34A",
    fontSize: 18
  },

  jobBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30
  },

  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 11
  },

  servicesText: {
    color: "#6B7280",
    fontWeight: "500"
  },

  roleText: {
    marginTop: 6,
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 13
  },

  menuButton: {
  width: 48,
  height: 48,
  borderRadius: 16,
  backgroundColor: "white",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: 4
},

menuOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 100
},

menuBackdrop: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.15)"
},

menuCard: {
  position: "absolute",
  top: 78,
  right: 18,
  width: 280,
  backgroundColor: "white",
  borderRadius: 18,
  paddingVertical: 10,
  elevation: 10,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 5
  },
  shadowOpacity: 0.15,
  shadowRadius: 12
},

menuHeader: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingVertical: 12
},

menuAvatar: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: "#EFF6FF",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12
},

menuUserName: {
  fontSize: 15,
  fontWeight: "700",
  color: "#111827"
},

menuRole: {
  fontSize: 11,
  fontWeight: "700",
  color: "#2563EB",
  marginTop: 3
},

menuDivider: {
  height: 1,
  backgroundColor: "#E5E7EB",
  marginVertical: 6
},

menuItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingVertical: 12
},

menuIcon: {
  width: 36,
  height: 36,
  borderRadius: 10,
  backgroundColor: "#EFF6FF",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12
},

menuItemText: {
  flex: 1,
  fontSize: 15,
  fontWeight: "600",
  color: "#374151"
}

})