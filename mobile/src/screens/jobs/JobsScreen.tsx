// JobsScreen.tsx

import { useEffect, useMemo, useState } from "react"

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  SafeAreaView,
  ScrollView
} from "react-native"

import {
  MaterialIcons,
  Ionicons,
  Feather
} from "@expo/vector-icons"

import { useNavigation } from "@react-navigation/native"

import JobCard from "../../components/JobCard"
import StatusTabs from "../../components/StatusTabs"
import { dummyJobs } from "../../data/dummyJobs"

export default function JobsScreen() {

  const navigation: any = useNavigation()

  const [jobs, setJobs] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState("all")

  const [search, setSearch] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {

    setRefreshing(true)

    setTimeout(() => {

      setJobs(dummyJobs)

      setRefreshing(false)

    }, 700)

  }

  const filteredJobs = useMemo(() => {

    return jobs.filter(job => {

      const matchesStatus =
        statusFilter === "all"
          ? true
          : job.status === statusFilter

      const searchText = search.toLowerCase()

      const matchesSearch =
        job.customer?.toLowerCase().includes(searchText) ||
        job.vehicleNumber?.toLowerCase().includes(searchText) ||
        job.vehicleModel?.toLowerCase().includes(searchText)

      return matchesStatus && matchesSearch

    })

  }, [jobs, statusFilter, search])

  const totalJobs = jobs.length

  const completedJobs = jobs.filter(
    j => j.status === "completed"
  ).length

  const pendingJobs = jobs.filter(
    j => j.status === "pending"
  ).length

  const progressJobs = jobs.filter(
    j => j.status === "progress"
  ).length

  const totalRevenue = jobs.reduce((sum, job) => {

    const total = job.services.reduce(
      (s: number, item: any) =>
        s + (item.actualPrice ?? item.estimatedPrice),
      0
    )

    return sum + total

  }, 0)

  return (

    <SafeAreaView style={styles.container}>

      {/* HEADER */}

      <View style={styles.headerRow}>

        <View>

          <Text style={styles.title}>
            Jobs
          </Text>

          <Text style={styles.subtitle}>
            Manage garage work orders
          </Text>

        </View>

        <TouchableOpacity style={styles.notificationBtn}>

          <Ionicons
            name="notifications-outline"
            size={22}
            color="#111827"
          />

        </TouchableOpacity>

      </View>


      {/* SUMMARY */}

      <View style={styles.summaryContainer}>

        <View style={styles.summaryCard}>

          <View style={styles.summaryIconBlue}>

            <MaterialIcons
              name="build"
              size={20}
              color="#2563EB"
            />

          </View>

          <Text style={styles.summaryValue}>
            {totalJobs}
          </Text>

          <Text style={styles.summaryLabel}>
            Total Jobs
          </Text>

        </View>

        <View style={styles.summaryCard}>

          <View style={styles.summaryIconOrange}>

            <Ionicons
              name="time-outline"
              size={20}
              color="#EA580C"
            />

          </View>

          <Text style={styles.summaryValue}>
            {progressJobs}
          </Text>

          <Text style={styles.summaryLabel}>
            In Progress
          </Text>

        </View>

        <View style={styles.summaryCard}>

          <View style={styles.summaryIconGreen}>

            <MaterialIcons
              name="check-circle"
              size={20}
              color="#16A34A"
            />

          </View>

          <Text style={styles.summaryValue}>
            {completedJobs}
          </Text>

          <Text style={styles.summaryLabel}>
            Completed
          </Text>

        </View>

      </View>

      {/* REVENUE CARD */}

      <View style={styles.revenueCard}>

        <View>

          <Text style={styles.revenueLabel}>
            Total Revenue
          </Text>

          <Text style={styles.revenueAmount}>
            ₹{totalRevenue}
          </Text>

        </View>

        <View style={styles.revenueIcon}>

          <MaterialIcons
            name="payments"
            size={26}
            color="#FFFFFF"
          />

        </View>

      </View>

      {/* SEARCH */}

      <View style={styles.searchBox}>

        <Ionicons
          name="search"
          size={20}
          color="#6B7280"
        />

        <TextInput
          placeholder="Search customer, vehicle number..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

      </View>

      {/* FILTER TABS */}

      <View style={styles.tabsWrapper}>

        <StatusTabs
          selected={statusFilter}
          onChange={setStatusFilter}
        />

      </View>

      {/* LIST */}

      {filteredJobs.length === 0 ? (

        <View style={styles.emptyContainer}>

          <Ionicons
            name="clipboard-outline"
            size={60}
            color="#9CA3AF"
          />

          <Text style={styles.emptyTitle}>
            No Jobs Found
          </Text>

          <Text style={styles.emptySub}>
            Create your first garage job
          </Text>

        </View>

      ) : (

        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <JobCard job={item} />
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchJobs}
            />
          }
          contentContainerStyle={styles.listContent}
        />

      )}

      {/* FLOATING BUTTON */}

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate("CreateJob")
        }
      >

        <MaterialIcons
          name="add"
          size={30}
          color="white"
        />

      </TouchableOpacity>

    </SafeAreaView>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6"
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827"
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 4
  },

  notificationBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2
  },

  planCard: {
    backgroundColor: "#111827",
    marginHorizontal: 18,
    marginTop: 22,
    borderRadius: 22,
    padding: 18
  },

  planTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  planTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },

  planSub: {
    color: "#D1D5DB",
    marginTop: 4
  },

  upgradeBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },

  upgradeText: {
    color: "white",
    fontWeight: "bold"
  },

  progressBg: {
    height: 10,
    backgroundColor: "#374151",
    borderRadius: 20,
    marginTop: 18,
    overflow: "hidden"
  },

  progressFill: {
    width: "90%",
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 20
  },

  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    marginTop: 20
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 4,
    elevation: 2
  },

  summaryIconBlue: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },

  summaryIconOrange: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },

  summaryIconGreen: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827"
  },

  summaryLabel: {
    marginTop: 5,
    color: "#6B7280",
    fontSize: 13
  },

  revenueCard: {
    backgroundColor: "#2563EB",
    marginHorizontal: 18,
    marginTop: 18,
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  revenueLabel: {
    color: "#DBEAFE",
    fontSize: 14
  },

  revenueAmount: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 5
  },

  revenueIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center"
  },

  searchBox: {
    backgroundColor: "white",
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  searchInput: {
    flex: 1,
    paddingVertical: 15,
    paddingLeft: 10,
    color: "#111827"
  },

  tabsWrapper: {
    marginTop: 18,
    paddingLeft: 18
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 120
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 18,
    color: "#111827"
  },

  emptySub: {
    color: "#6B7280",
    marginTop: 8
  },

  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6
  }

})