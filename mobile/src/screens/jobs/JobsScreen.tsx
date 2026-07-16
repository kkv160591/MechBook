import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
  TextInput
} from "react-native"

import { Ionicons } from "@expo/vector-icons"

import {
  useState,
  useCallback,
  useEffect
} from "react"

import {
  useFocusEffect
} from "@react-navigation/native"

import JobCard
from "../../components/JobCard"

import {
  getJobs
} from "../../services/jobService"

export default function JobsScreen({
  navigation
}: any) {

  const [jobs, setJobs] =
    useState<any[]>([])

  const [filteredJobs, setFilteredJobs] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [search, setSearch] =
    useState("")

  const [statusFilter, setStatusFilter] =
    useState("all")

  const applyFilters = (
    jobList: any[],
    searchText: string,
    status: string
  ) => {

    let list = [...jobList]

    if (status !== "all") {

      list = list.filter(
        j => j.status === status
      )

    }

    if (searchText.trim()) {

      const text =
        searchText.toLowerCase()

      list = list.filter(job =>

        job.customerName
          ?.toLowerCase()
          .includes(text) ||

        job.vehicleNumber
          ?.toLowerCase()
          .includes(text) ||

        job.phone
          ?.includes(text)

      )

    }

    setFilteredJobs(list)

  }

  const loadJobs = async () => {

    try {

      const response =
        await getJobs()

      const list =
        response.jobs || []

      setJobs(list)

      applyFilters(
        list,
        search,
        statusFilter
      )

    }

    catch (error) {

      console.log(error)

    }

    finally {

      setLoading(false)
      setRefreshing(false)

    }

  }

  useFocusEffect(

    useCallback(() => {

      setLoading(true)

      loadJobs()

    }, [])

  )

  useEffect(() => {

    applyFilters(
      jobs,
      search,
      statusFilter
    )

  }, [
    search,
    statusFilter,
    jobs
  ])

  const onRefresh =
    () => {

      setRefreshing(true)

      loadJobs()

    }

  if (loading) {

    return (

      <View style={styles.loader}>

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

      </View>

    )

  }

  return (

    <View style={styles.container}>

      <TextInput
        placeholder="Search customer, phone or vehicle..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />
      <View style={styles.filterRow}>

        {[
          "all",
          "pending",
          "progress",
          "completed",
          "delivered"
        ].map(status => (

          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              statusFilter === status &&
                styles.selectedChip
            ]}
            onPress={() =>
              setStatusFilter(status)
            }
          >

            <Text
              style={[
                styles.filterText,
                statusFilter === status &&
                  styles.selectedFilterText
              ]}
            >
              {status.toUpperCase()}
            </Text>

          </TouchableOpacity>

        ))}

      </View>
      <FlatList

        data={filteredJobs}

        keyExtractor={(item) =>
          item.jobId
        }

        refreshControl={

          <RefreshControl

            refreshing={refreshing}

            onRefresh={onRefresh}

          />

        }

        ListEmptyComponent={

          <View style={styles.emptyContainer}>

            <Ionicons
              name="construct-outline"
              size={70}
              color="#9CA3AF"
            />

            <Text style={styles.emptyTitle}>
              {search || statusFilter !== "all"
                ? "No matching jobs"
                : "No Jobs Yet"}
            </Text>

            <Text style={styles.emptyText}>
              Create your first job to get started.
            </Text>

          </View>

        }

        renderItem={({ item }) => (

          <JobCard
            job={item}
          />

        )}

      />

      <TouchableOpacity

        style={styles.fab}

        onPress={() =>

          navigation.navigate(
            "AddJob"
          )

        }

      >

        <Ionicons

          name="add"

          size={28}

          color="white"

        />

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

    elevation: 5

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