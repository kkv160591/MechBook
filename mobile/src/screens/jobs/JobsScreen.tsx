import React, {
  useCallback,
  useMemo,
  useState,
} from "react"

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from "react-native"

import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"

import { getJobs } from "../../services/jobService"

import JobCard from "../../components/JobCard"

type JobFilter =
  | "all"
  | "pending"
  | "progress"
  | "waiting_parts"
  | "ready"
  | "completed"
  | "delivered"
  | "overdue"

type JobSort =
  | "newest"
  | "oldest"
  | "customerAsc"
  | "deliveryDate"
  | "highestAmount"

const PAGE_SIZE = 20

const normalizeStatus = (status: string = "") => {
  const value = status.toLowerCase().trim().replace(/[\s-]+/g, "_")

  if (value === "in_progress" || value === "inprogress") {
    return "progress"
  }

  return value
}

const isJobOverdue = (job: any) => {
  if (!job.deliveryDate) return false

  const status = normalizeStatus(job.status)

  if (status === "completed" || status === "delivered") {
    return false
  }

  const deliveryDate = new Date(job.deliveryDate)
  if (Number.isNaN(deliveryDate.getTime())) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  deliveryDate.setHours(0, 0, 0, 0)

  return deliveryDate < today
}

const formatAmount = (value: any) => {
  const amount = Number(value || 0)

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`
}

const formatDate = (value: any) => {
  if (!value) return "No delivery date"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "No delivery date"
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  })
}

const getStatusLabel = (status: string = "") => {
  const normalized = normalizeStatus(status)

  const labels: Record<string, string> = {
    pending: "Pending",
    progress: "In Progress",
    waiting_parts: "Waiting Parts",
    ready: "Ready",
    completed: "Completed",
    delivered: "Delivered",
  }

  return labels[normalized] || status || "Unknown"
}

const getStatusColors = (status: string = "") => {
  const normalized = normalizeStatus(status)

  const colors: Record<string, { bg: string; text: string }> = {
    pending: { bg: "#FEF3C7", text: "#92400E" },
    progress: { bg: "#DBEAFE", text: "#1D4ED8" },
    waiting_parts: { bg: "#F3E8FF", text: "#7E22CE" },
    ready: { bg: "#D1FAE5", text: "#047857" },
    completed: { bg: "#DCFCE7", text: "#166534" },
    delivered: { bg: "#E2E8F0", text: "#475569" },
  }

  return colors[normalized] || {
    bg: "#F1F5F9",
    text: "#475569",
  }
}

export default function JobsScreen({ navigation }: any) {
  const [jobs, setJobs] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<JobFilter>("all")
  const [sort, setSort] = useState<JobSort>("newest")

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterVisible, setFilterVisible] = useState(false)
  const [sortVisible, setSortVisible] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const loadJobs = useCallback(async () => {
    try {
      const response = await getJobs()

      const list = Array.isArray(response?.jobs)
        ? response.jobs
        : Array.isArray(response?.data)
          ? response.data
          : []

      setJobs(list)
    } catch (error: any) {
      console.log(
        "Jobs load error:",
        error?.response?.data || error?.message || error
      )

      Alert.alert(
        "Error",
        "Unable to load jobs. Please try again."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      void loadJobs()
    }, [loadJobs])
  )

  const displayedJobs = useMemo(() => {
    let result = [...jobs]
    const query = search.trim().toLowerCase()

    // Search by customer, phone, vehicle, or job ID.
    if (query) {
      result = result.filter((job) => {
        const searchableValues = [
          job.customerName,
          job.phone,
          job.vehicleNumber,
          job.jobId,
          job.jobNumber,
          job.vehicleBrand,
          job.vehicleModel,
        ]

        return searchableValues.some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        )
      })
    }

    // Filter by status.
    if (filter === "overdue") {
      result = result.filter(isJobOverdue)
    } else if (filter !== "all") {
      result = result.filter(
        (job) => normalizeStatus(job.status) === filter
      )
    }

    // Sort the filtered results.
    result.sort((a, b) => {
      const aCreated = new Date(
        a.createdAt || a.updatedAt || 0
      ).getTime()

      const bCreated = new Date(
        b.createdAt || b.updatedAt || 0
      ).getTime()

      switch (sort) {
        case "oldest":
          return aCreated - bCreated

        case "customerAsc":
          return String(a.customerName || "").localeCompare(
            String(b.customerName || "")
          )

        case "deliveryDate": {
          const aDate = a.deliveryDate
            ? new Date(a.deliveryDate).getTime()
            : Number.MAX_SAFE_INTEGER

          const bDate = b.deliveryDate
            ? new Date(b.deliveryDate).getTime()
            : Number.MAX_SAFE_INTEGER

          return aDate - bDate
        }

        case "highestAmount":
          return Number(b.totalAmount || 0) -
            Number(a.totalAmount || 0)

        case "newest":
        default:
          return bCreated - aCreated
      }
    })

    return result
  }, [jobs, search, filter, sort])

  // Reset the visible page when search/filter/sort changes.
  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, filter, sort])

  const visibleJobs = useMemo(
    () => displayedJobs.slice(0, visibleCount),
    [displayedJobs, visibleCount]
  )

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadJobs()
  }

  const getFilterLabel = () => {
    const labels: Record<JobFilter, string> = {
      all: "All Jobs",
      pending: "Pending",
      progress: "In Progress",
      waiting_parts: "Waiting Parts",
      ready: "Ready",
      completed: "Completed",
      delivered: "Delivered",
      overdue: "Overdue",
    }

    return labels[filter]
  }

  const getSortLabel = () => {
    const labels: Record<JobSort, string> = {
      newest: "Newest First",
      oldest: "Oldest First",
      customerAsc: "Customer A–Z",
      deliveryDate: "Delivery Date",
      highestAmount: "Highest Amount",
    }

    return labels[sort]
  }

  const filterOptions: { key: JobFilter; label: string }[] = [
    { key: "all", label: "All Jobs" },
    { key: "pending", label: "Pending" },
    { key: "progress", label: "In Progress" },
    { key: "waiting_parts", label: "Waiting for Parts" },
    { key: "ready", label: "Ready" },
    { key: "completed", label: "Completed" },
    { key: "delivered", label: "Delivered" },
    { key: "overdue", label: "Overdue" },
  ]

  const sortOptions: { key: JobSort; label: string }[] = [
    { key: "newest", label: "Newest First" },
    { key: "oldest", label: "Oldest First" },
    { key: "customerAsc", label: "Customer Name A–Z" },
    { key: "deliveryDate", label: "Earliest Delivery Date" },
    { key: "highestAmount", label: "Highest Job Amount" },
  ]

  const renderJob = ({ item }: { item: any }) => {
    const statusColors = getStatusColors(item.status)
    const overdue = isJobOverdue(item)

    return (
      <TouchableOpacity
        style={styles.jobRow}
        activeOpacity={0.75}
        onPress={() => {
          // Connect this to your existing job-detail screen if needed.
          navigation.navigate("JobDetails", {
            jobId: item.jobId,
            job: item,
          })
        }}
      >
        <View style={styles.jobIcon}>
          <Ionicons
            name="construct-outline"
            size={18}
            color="#2563EB"
          />
        </View>

        <View style={styles.jobMain}>
          <View style={styles.jobTitleLine}>
            <Text
              style={styles.customerName}
              numberOfLines={1}
            >
              {item.customerName || "Unknown Customer"}
            </Text>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColors.bg },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: statusColors.text },
                ]}
                numberOfLines={1}
              >
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>

          <View style={styles.jobDetailsLine}>
            <Text
              style={styles.jobReference}
              numberOfLines={1}
            >
              {item.vehicleNumber ||
                item.jobNumber ||
                (item.jobId
                  ? `Job ${item.jobId.slice(0, 8)}`
                  : "Job")}
            </Text>

            <Text style={styles.dot}>•</Text>

            <Text
              style={[
                styles.deliveryDate,
                overdue && styles.overdueText,
              ]}
              numberOfLines={1}
            >
              {overdue
                ? `Overdue · ${formatDate(item.deliveryDate)}`
                : formatDate(item.deliveryDate)}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amount} numberOfLines={1}>
            {formatAmount(item.totalAmount)}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={15}
            color="#94A3B8"
          />
        </View>
      </TouchableOpacity>
    )
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
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Jobs</Text>
          <Text style={styles.subtitle}>
            {displayedJobs.length}{" "}
            {displayedJobs.length === 1 ? "job" : "jobs"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("CreateJob")}
        >
          <Ionicons name="add" size={23} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#94A3B8" />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search customer, phone, vehicle or job"
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          autoCapitalize="none"
          returnKeyType="search"
        />

        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTER / SORT */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons
            name="filter-outline"
            size={15}
            color="#475569"
          />
          <Text style={styles.controlText}>{getFilterLabel()}</Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color="#64748B"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setSortVisible(true)}
        >
          <Ionicons
            name="swap-vertical-outline"
            size={15}
            color="#475569"
          />
          <Text style={styles.controlText}>{getSortLabel()}</Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      {/* SINGLE-LINE JOB LIST */}
      <FlatList
        data={visibleJobs}
        keyExtractor={(item, index) =>
          String(item.jobId || item.jobNumber || index)
        }
        renderItem={({ item }) => <JobCard job={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="clipboard-outline"
              size={42}
              color="#CBD5E1"
            />
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptyText}>
              Try changing your search or filter.
            </Text>
          </View>
        }
        ListFooterComponent={
          visibleCount < displayedJobs.length ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() =>
                setVisibleCount((count) =>
                  Math.min(count + PAGE_SIZE, displayedJobs.length)
                )
              }
            >
              <Text style={styles.loadMoreText}>
                Load More ({displayedJobs.length - visibleCount} remaining)
              </Text>
              <Ionicons
                name="chevron-down"
                size={15}
                color="#2563EB"
              />
            </TouchableOpacity>
          ) : null
        }
      />

      {/* FILTER MODAL */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.bottomOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter Jobs</Text>
              <TouchableOpacity
                onPress={() => setFilterVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.option}
                onPress={() => {
                  setFilter(option.key)
                  setFilterVisible(false)
                }}
              >
                <Text style={styles.optionText}>
                  {option.label}
                </Text>

                {filter === option.key && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#2563EB"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* SORT MODAL */}
      <Modal
        visible={sortVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSortVisible(false)}
      >
        <View style={styles.bottomOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Sort Jobs</Text>
              <TouchableOpacity
                onPress={() => setSortVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.option}
                onPress={() => {
                  setSort(option.key)
                  setSortVisible(false)
                }}
              >
                <Text style={styles.optionText}>
                  {option.label}
                </Text>

                {sort === option.key && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#2563EB"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 10,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "#64748B",
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  searchBox: {
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
  },

  searchInput: {
    flex: 1,
    marginLeft: 7,
    fontSize: 12,
    color: "#111827",
    paddingVertical: 0,
  },

  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 9,
  },

  controlButton: {
    minHeight: 34,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  controlText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },

  list: {
    paddingTop: 2,
    paddingBottom: 12,
  },

  jobRow: {
    minHeight: 66,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 9,
    borderRadius: 11,
    gap: 8,
  },

  jobIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  jobMain: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },

  jobTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  customerName: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },

  statusBadge: {
    maxWidth: 94,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  jobDetailsLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 5,
  },

  jobReference: {
    flexShrink: 1,
    fontSize: 10,
    color: "#64748B",
  },

  dot: {
    fontSize: 10,
    color: "#CBD5E1",
  },

  deliveryDate: {
    flexShrink: 1,
    fontSize: 10,
    color: "#64748B",
  },

  overdueText: {
    color: "#DC2626",
    fontWeight: "700",
  },

  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    maxWidth: 95,
  },

  amount: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
    flexShrink: 1,
  },

  separator: {
    height: 0,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  empty: {
    alignItems: "center",
    paddingBottom: 80,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginTop: 10,
  },

  emptyText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 5,
    textAlign: "center",
  },

  clearButton: {
    marginTop: 15,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
  },

  clearButtonText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 12,
  },

  loadMoreButton: {
    minHeight: 43,
    marginTop: 12,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  loadMoreText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },

  listFooter: {
    alignItems: "center",
    paddingVertical: 15,
  },

  footerText: {
    color: "#94A3B8",
    fontSize: 10,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },

  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  sheetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  option: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  optionText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
})