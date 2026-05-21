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
  SafeAreaView
} from "react-native"

import { MaterialIcons, Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

import JobCard from "../components/JobCard"
import StatusTabs from "../components/StatusTabs"
import { dummyJobs } from "../data/dummyJobs"

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
        job.customerName?.toLowerCase().includes(searchText) ||
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

      {/* SUMMARY CARDS */}

      <View style={styles.summaryContainer}>

        <View style={styles.summaryCard}>

          <Text style={styles.summaryValue}>
            {totalJobs}
          </Text>

          <Text style={styles.summaryLabel}>
            Total Jobs
          </Text>

        </View>

        <View style={styles.summaryCard}>

          <Text style={styles.summaryValue}>
            {pendingJobs}
          </Text>

          <Text style={styles.summaryLabel}>
            Pending
          </Text>

        </View>

        <View style={styles.summaryCard}>

          <Text style={styles.summaryValue}>
            {completedJobs}
          </Text>

          <Text style={styles.summaryLabel}>
            Completed
          </Text>

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
          placeholder="Search customer or vehicle..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

      </View>

      {/* STATUS TABS */}

      <View style={styles.tabsWrapper}>

        <StatusTabs
          selected={statusFilter}
          onChange={setStatusFilter}
        />

      </View>

      {/* JOB LIST */}

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

      {/* FAB */}

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
    borderRadius: 14,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2
  },

  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    marginTop: 22
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginHorizontal: 4,
    elevation: 2
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

  searchBox: {
    backgroundColor: "white",
    borderRadius: 16,
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
    paddingVertical: 14,
    paddingLeft: 10,
    color: "#111827"
  },

  tabsWrapper: {
    marginTop: 16,
    paddingLeft: 18
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
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
    bottom: 30,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6
  }

})