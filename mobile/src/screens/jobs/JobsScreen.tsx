import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
  TextInput,
  Alert
} from "react-native"

import { Ionicons } from "@expo/vector-icons"
import { useState, useCallback, useEffect } from "react"
import { useFocusEffect } from "@react-navigation/native"
import { useTranslation } from "../../context/LanguageContext"

import JobCard from "../../components/JobCard"
import { getJobs } from "../../services/jobService"

export default function JobsScreen({ navigation }: any) {
  const { t } = useTranslation()

  const [jobs, setJobs] = useState<any[]>([])
  const [filteredJobs, setFilteredJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const statusOptions = [
    { key: "all", label: t("jobs.all") },
    { key: "pending", label: t("jobs.pending") },
    { key: "progress", label: t("jobs.inProgress") },
    { key: "waiting_parts", label: t("jobs.waitingParts") },
    { key: "ready", label: t("jobs.ready") },
    { key: "completed", label: t("jobs.completed") },
    { key: "delivered", label: t("jobs.delivered") }
  ]

  const applyFilters = (
    jobList: any[],
    searchText: string,
    status: string
  ) => {
    let list = [...jobList]

    if (status !== "all") {
      list = list.filter((j) => j.status === status)
    }

    if (searchText.trim()) {
      const text = searchText.toLowerCase()
      list = list.filter(
        (job) =>
          job.customerName?.toLowerCase().includes(text) ||
          job.vehicleNumber?.toLowerCase().includes(text) ||
          job.phone?.includes(text)
      )
    }

    setFilteredJobs(list)
  }

  const loadJobs = async () => {
    try {
      const response = await getJobs()
      const list = Array.isArray(response.jobs) ? response.jobs : []
      setJobs(list)
    } catch (error) {
      console.log(error)
      Alert.alert(t("jobs.errorTitle"), t("jobs.unableToLoadJobs"))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      let active = true

      const refresh = async () => {
        if (active) {
          setLoading(true)
        }
        await loadJobs()
      }

      refresh()

      return () => {
        active = false
      }
    }, [])
  )

  useEffect(() => {
    applyFilters(jobs, search, statusFilter)
  }, [jobs, search, statusFilter])

  const onRefresh = () => {
    setRefreshing(true)
    loadJobs()
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder={t("jobs.searchPlaceholder")}
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <View style={styles.filterRow}>
        {statusOptions.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.filterChip,
              statusFilter === item.key && styles.selectedChip
            ]}
            onPress={() => setStatusFilter(item.key)}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === item.key && styles.selectedFilterText
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.jobId}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={70} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              {search || statusFilter !== "all"
                ? t("jobs.noMatchingJobs")
                : t("jobs.noJobsYet")}
            </Text>
            <Text style={styles.emptyText}>{t("jobs.createFirstJob")}</Text>
          </View>
        }
        renderItem={({ item }) => <JobCard job={item} />}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => {
          console.log("ADD JOB CLICKED")
          navigation.navigate("CreateJob")
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16
  },
  search: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 14,
    flexWrap: "wrap"
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "white",
    marginRight: 10,
    marginBottom: 10
  },
  selectedChip: {
    backgroundColor: "#2563EB"
  },
  filterText: {
    color: "#374151",
    fontWeight: "600"
  },
  selectedFilterText: {
    color: "white"
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6
  },
  emptyContainer: {
    marginTop: 120,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16
  },
  emptyText: {
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40
  }
})