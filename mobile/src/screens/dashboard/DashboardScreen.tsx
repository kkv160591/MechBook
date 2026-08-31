// DashboardScreen.tsx

import React, { useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native"
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons"
import { useNavigation, useFocusEffect } from "@react-navigation/native"

import { getGarageProfile } from "../../services/garageService"
import { getJobs } from "../../services/jobService"
import { getWorkers } from "../../services/workerService"
import { getLowStockItems } from "../../services/inventoryService"
import { useAuth } from "../../context/AuthContext"
import {
  getPlanUsage,
  PlanUsageResponse,
} from "../../services/subscriptionService"
import { useTranslation } from "../../context/LanguageContext"

interface GarageProfile {
  garageName?: string
  city?: string
  state?: string
  address?: string
}

interface ServiceItem {
  actualPrice?: number
  estimatedPrice?: number
}

interface Job {
  id: string | number
  status: "completed" | "pending" | "progress" | "in-progress" | "inProgress" | string
  totalAmount?: number
  total?: number
  services?: ServiceItem[]
  vehicleType?: string
  vehicleNumber?: string
  vehicleModel?: string
  vehicle?: {
    number?: string
    model?: string
  }
  customerName?: string
  customer?: string | { name?: string }
}

interface Worker {
  id: string | number
  name?: string
}

interface LowStockItem {
  id: string | number
  name?: string
}

export default function DashboardScreen() {
  const navigation = useNavigation<any>()
  const { user } = useAuth()
  const { t } = useTranslation()

  // ==================================
  // STATE
  // ==================================
  const [garage, setGarage] = useState<GarageProfile | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [planUsage, setPlanUsage] = useState<PlanUsageResponse | null>(null)
  const [planUsageLoading, setPlanUsageLoading] = useState(true)

  // ==================================
  // HELPER: JOB TOTAL CALCULATOR
  // ==================================
  const getJobTotal = (job: Job): number => {
    if (typeof job.totalAmount === "number") return job.totalAmount
    if (typeof job.total === "number") return job.total
    if (Array.isArray(job.services)) {
      return job.services.reduce(
        (sum, service) =>
          sum + Number(service.actualPrice ?? service.estimatedPrice ?? 0),
        0
      )
    }
    return 0
  }

  // ==================================
  // LOAD ALL DATA (UNIFIED FETCHING)
  // ==================================
  const loadAllData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true)
    setPlanUsageLoading(true)

    try {
      const [garageRes, jobsRes, workersRes, lowStockRes, planRes] =
        await Promise.allSettled([
          getGarageProfile(),
          getJobs(),
          getWorkers(),
          getLowStockItems(),
          getPlanUsage(),
        ])

      // 1. Garage
      if (garageRes.status === "fulfilled") {
        setGarage(garageRes.value?.garage || null)
      }

      // 2. Jobs
      if (jobsRes.status === "fulfilled") {
        const res = jobsRes.value
        const jobList = Array.isArray(res)
          ? res
          : Array.isArray(res?.jobs)
          ? res.jobs
          : []
        setJobs(jobList)
      }

      // 3. Workers
      if (workersRes.status === "fulfilled") {
        const res = workersRes.value
        const workerList = Array.isArray(res)
          ? res
          : Array.isArray(res?.workers)
          ? res.workers
          : []
        setWorkers(workerList)
      }

      // 4. Low Stock
      if (lowStockRes.status === "fulfilled") {
        const res = lowStockRes.value
        const inventoryList = Array.isArray(res)
          ? res
          : Array.isArray(res?.items)
          ? res.items
          : []
        setLowStockItems(inventoryList)
      }

      // 5. Subscription
      if (planRes.status === "fulfilled") {
        setPlanUsage(planRes.value)
      }
    } catch (error) {
      console.log("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
      setPlanUsageLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void loadAllData()
    }, [loadAllData])
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadAllData(true)
    setRefreshing(false)
  }, [loadAllData])

  // ==================================
  // STATISTICS & METRICS
  // ==================================
  const totalJobs = jobs.length
  const completedJobs = jobs.filter((job) => job.status === "completed").length
  const pendingJobs = jobs.filter((job) => job.status === "pending").length
  const inProgressJobs = jobs.filter((job) =>
    ["progress", "in-progress", "inProgress"].includes(job.status)
  ).length

  // Calculate total revenue dynamically from completed jobs
  const totalRevenue = jobs
    .filter((job) => job.status === "completed")
    .reduce((sum, job) => sum + getJobTotal(job), 0)

  // ==================================
  // PLAN USAGE CALCULATIONS
  // ==================================
  const actualPlanName = planUsage?.planName || planUsage?.planCode || t("dashboard.plan.free") || "Free"
  const rawJobsUsed = Number(planUsage?.jobsUsed ?? 0)
  const jobsUsed = Number.isFinite(rawJobsUsed) ? Math.max(rawJobsUsed, 0) : 0

  const jobsLimitValue = planUsage?.jobsLimit
  const isUnlimited =
    String(jobsLimitValue ?? "").trim().toLowerCase() === "unlimited"
  const numericJobLimit = Number(jobsLimitValue ?? 0)

  const backendUsagePercentage = Number(planUsage?.usagePercentage)
  const calculatedUsagePercentage =
    numericJobLimit > 0 ? Math.round((jobsUsed / numericJobLimit) * 100) : 0

  const usagePercentage = isUnlimited
    ? 0
    : Number.isFinite(backendUsagePercentage)
    ? Math.min(Math.max(Math.round(backendUsagePercentage), 0), 100)
    : Math.min(Math.max(calculatedUsagePercentage, 0), 100)

  const planRingColor = isUnlimited
    ? "#16A34A"
    : usagePercentage >= 100
    ? "#DC2626"
    : usagePercentage >= 80
    ? "#EA580C"
    : "#2563EB"

  const planRingBackground = isUnlimited
    ? "#ECFDF5"
    : usagePercentage >= 100
    ? "#FEF2F2"
    : usagePercentage >= 80
    ? "#FFF7ED"
    : "#EFF6FF"

  const recentJobs = jobs.slice(0, 4)

  const getStatusColor = (status: string) => {
    if (status === "completed") return "#16A34A"
    if (status === "pending") return "#DC2626"
    if (["progress", "in-progress", "inProgress"].includes(status))
      return "#EA580C"
    return "#2563EB"
  }

  const getStatusText = (status: string) => {
    if (status === "completed") return t("dashboard.status.completed") || "COMPLETED"
    if (status === "pending") return t("dashboard.status.pending") || "PENDING"
    if (["progress", "in-progress", "inProgress"].includes(status))
      return t("dashboard.status.inProgress") || "IN PROGRESS"
    return status?.toUpperCase() || t("dashboard.status.unknown") || "UNKNOWN"
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HIGHLIGHTED HEADER CONTAINER */}
        <View style={styles.headerCard}>
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>{t("dashboard.welcome") || "Welcome Back 👋"}</Text>
            <Text style={styles.header} numberOfLines={1}>
              {loading ? t("dashboard.loading") || "Loading..." : garage?.garageName || t("dashboard.defaultGarage") || "Garage"}
            </Text>
            <Text style={styles.subHeader} numberOfLines={1}>
              {garage?.city
                ? `${garage.city}${garage.state ? `, ${garage.state}` : ""}`
                : garage?.address || t("dashboard.defaultSubtitle") || "Garage Dashboard"}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user?.role?.toUpperCase() || t("dashboard.roles.user") || "USER"}
              </Text>
            </View>
          </View>

          {/* PLAN HEADER */}
          <TouchableOpacity
            style={styles.planHeaderContainer}
            onPress={() => navigation.navigate("PlanUsage")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.planRing,
                {
                  borderColor: planRingColor,
                  backgroundColor: planRingBackground,
                },
              ]}
            >
              {planUsageLoading ? (
                <ActivityIndicator size="small" color={planRingColor} />
              ) : isUnlimited ? (
                <Text
                  style={[styles.planRingNumber, { color: planRingColor }]}
                >
                  ∞
                </Text>
              ) : (
                <Text
                  style={[styles.planRingNumber, { color: planRingColor }]}
                >
                  {usagePercentage}%
                </Text>
              )}
            </View>
            <Text
              style={[styles.planNameHeader, { color: planRingColor }]}
              numberOfLines={1}
            >
              {actualPlanName}
            </Text>
          </TouchableOpacity>
        </View>

        {/* STATS */}
        <View style={styles.statsContainer}>
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <MaterialIcons name="build" size={22} color="#2563EB" />
            </View>
            <Text style={styles.cardValue}>{totalJobs}</Text>
            <Text style={styles.cardTitle}>{t("dashboard.stats.totalJobs") || "Total Jobs"}</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconBox, styles.bgRed]}>
              <MaterialIcons name="pending-actions" size={22} color="#DC2626" />
            </View>
            <Text style={styles.cardValue}>{pendingJobs}</Text>
            <Text style={styles.cardTitle}>{t("dashboard.stats.pendingJobs") || "Pending Jobs"}</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconBox, styles.bgGreen]}>
              <MaterialIcons name="check-circle" size={22} color="#16A34A" />
            </View>
            <Text style={styles.cardValue}>{completedJobs}</Text>
            <Text style={styles.cardTitle}>{t("dashboard.stats.completed") || "Completed"}</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconBox, styles.bgBlue]}>
              <MaterialIcons name="payments" size={22} color="#2563EB" />
            </View>
            <Text
              style={styles.cardValue}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              ₹{totalRevenue.toLocaleString("en-IN")}
            </Text>
            <Text style={styles.cardTitle}>{t("dashboard.stats.revenue") || "Revenue"}</Text>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>{t("dashboard.sections.quickActions") || "Quick Actions"}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("CreateJob")}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add-circle" size={30} color="#2563EB" />
            <Text style={styles.actionText}>{t("dashboard.actions.createJob") || "Create Job"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("Invoice")}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="file-invoice" size={24} color="#2563EB" />
            <Text style={styles.actionText}>{t("dashboard.actions.invoices") || "Invoices"}</Text>
          </TouchableOpacity>
        </View>

        {/* BUSINESS OVERVIEW */}
        <Text style={styles.sectionTitle}>{t("dashboard.sections.businessOverview") || "Business Overview"}</Text>
        <View style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <View style={styles.overviewIcon}>
              <Ionicons name="people-outline" size={20} color="#2563EB" />
            </View>
            <View style={styles.overviewText}>
              <Text style={styles.overviewTitle}>{t("dashboard.overview.workers") || "Workers"}</Text>
              <Text style={styles.overviewSubtitle}>
                {t("dashboard.overview.workersSubtitle") || "Active staff available"}
              </Text>
            </View>
            <Text style={styles.overviewValue}>{workers.length}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.overviewRow}>
            <View style={styles.overviewIcon}>
              <MaterialIcons name="build-circle" size={20} color="#EA580C" />
            </View>
            <View style={styles.overviewText}>
              <Text style={styles.overviewTitle}>{t("dashboard.overview.inProgress") || "In Progress"}</Text>
              <Text style={styles.overviewSubtitle}>
                {t("dashboard.overview.inProgressSubtitle") || "Jobs currently being serviced"}
              </Text>
            </View>
            <Text style={styles.overviewValue}>{inProgressJobs}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.overviewRow}>
            <View style={[styles.overviewIcon, styles.bgRed]}>
              <Ionicons name="warning-outline" size={20} color="#DC2626" />
            </View>
            <View style={styles.overviewText}>
              <Text style={styles.overviewTitle}>{t("dashboard.overview.lowStock") || "Low Stock"}</Text>
              <Text style={styles.overviewSubtitle}>
                {t("dashboard.overview.lowStockSubtitle") || "Spare parts need attention"}
              </Text>
            </View>
            <Text
              style={[
                styles.overviewValue,
                { color: lowStockItems.length > 0 ? "#DC2626" : "#16A34A" },
              ]}
            >
              {lowStockItems.length}
            </Text>
          </View>
        </View>

        {/* RECENT JOBS */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{t("dashboard.sections.recentJobs") || "Recent Jobs"}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Jobs")}>
            <Text style={styles.viewAll}>{t("dashboard.actions.viewAll") || "View All"}</Text>
          </TouchableOpacity>
        </View>

        {recentJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="assignment" size={36} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>{t("dashboard.empty.noJobsTitle") || "No jobs yet"}</Text>
            <Text style={styles.emptyText}>
              {t("dashboard.empty.noJobsSubtitle") || "Create your first job to see it here."}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate("CreateJob")}
            >
              <Text style={styles.emptyButtonText}>{t("dashboard.actions.createJob") || "Create Job"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentJobs.map((item) => {
            const total = getJobTotal(item)
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.jobCard}
                onPress={() =>
                  navigation.navigate("JobDetail", { job: item })
                }
                activeOpacity={0.7}
              >
                <View style={styles.jobTop}>
                  <View style={styles.flex1}>
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
                      <View style={styles.flex1}>
                        <Text style={styles.vehicle} numberOfLines={1}>
                          {item.vehicleNumber ||
                            item.vehicle?.number ||
                            t("dashboard.jobCard.defaultVehicle") ||
                            "Vehicle"}
                        </Text>
                        <Text style={styles.vehicleModel} numberOfLines={1}>
                          {item.vehicleModel ||
                            item.vehicle?.model ||
                            t("dashboard.jobCard.defaultDetails") ||
                            "Vehicle details"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.customer} numberOfLines={1}>
                      {typeof item.customer === "string"
                        ? item.customer
                        : item.customerName ||
                          item.customer?.name ||
                          t("dashboard.jobCard.defaultCustomer") ||
                          "Customer"}
                    </Text>
                  </View>
                  <Text style={styles.amount}>
                    ₹{Number(total).toLocaleString("en-IN")}
                  </Text>
                </View>

                <View style={styles.jobBottom}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                  <Text style={styles.servicesText}>
                    {Array.isArray(item.services)
                      ? `${item.services.length} ${t("dashboard.jobCard.servicesCount") || "services"}`
                      : t("dashboard.jobCard.singleService") || "Service"}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  headerInfo: { flex: 1, marginRight: 12 },
  greeting: { fontSize: 13, color: "#3B82F6", fontWeight: "600" },
  header: { fontSize: 20, fontWeight: "700", color: "#1E3A8A", marginTop: 2 },
  subHeader: { fontSize: 13, color: "#4B5563", marginTop: 2 },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  planHeaderContainer: { alignItems: "center" },
  planRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  planRingNumber: { fontSize: 12, fontWeight: "700" },
  planNameHeader: { fontSize: 11, fontWeight: "600", marginTop: 4 },

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  bgRed: { backgroundColor: "#FEF2F2" },
  bgGreen: { backgroundColor: "#ECFDF5" },
  bgBlue: { backgroundColor: "#EFF6FF" },
  cardValue: { fontSize: 18, fontWeight: "700", color: "#111827" },
  cardTitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  overviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  overviewRow: { flexDirection: "row", alignItems: "center" },
  overviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  overviewText: { flex: 1 },
  overviewTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  overviewSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  overviewValue: { fontSize: 16, fontWeight: "700", color: "#111827" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 12 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAll: { fontSize: 13, fontWeight: "600", color: "#2563EB" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 14,
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  jobTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  flex1: { flex: 1 },
  vehicleRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  vehicleIcon: { marginRight: 8 },
  vehicle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  vehicleModel: { fontSize: 12, color: "#6B7280" },
  customer: { fontSize: 12, color: "#4B5563", marginTop: 2 },
  amount: { fontSize: 15, fontWeight: "700", color: "#111827", marginLeft: 8 },
  jobBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "700", color: "#FFFFFF" },
  servicesText: { fontSize: 12, color: "#6B7280" },
  bottomSpacer: { height: 100 },
})