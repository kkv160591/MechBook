import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator
} from "react-native"

import {
  RouteProp,
  useNavigation,
  useFocusEffect
} from "@react-navigation/native"

import {
  Ionicons,
  MaterialIcons
} from "@expo/vector-icons"

import {
  useCallback,
  useMemo,
  useState
} from "react"

import { RootStackParamList } from "../../types/navigation"
import { useTranslation } from "../../context/LanguageContext"

import { getJobs } from "../../services/jobService"

type Props = {
  route: RouteProp<RootStackParamList, "CustomerDetail">
}

const formatCurrency = (amount: any) => {
  const value = Number(amount || 0)

  return `₹${value.toLocaleString("en-IN")}`
}

const formatDate = (date: any) => {
  if (!date) {
    return "-"
  }

  const parsedDate = new Date(date)

  if (isNaN(parsedDate.getTime())) {
    return "-"
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "Pending"

    case "progress":
      return "In Progress"

    case "waiting_parts":
      return "Waiting Parts"

    case "ready":
      return "Ready"

    case "completed":
      return "Completed"

    case "delivered":
      return "Delivered"

    default:
      return status || "-"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "#16A34A"

    case "delivered":
      return "#059669"

    case "ready":
      return "#2563EB"

    case "progress":
      return "#D97706"

    case "waiting_parts":
      return "#7C3AED"

    case "pending":
      return "#DC2626"

    default:
      return "#6B7280"
  }
}

export default function CustomerDetailScreen({
  route
}: Props) {

  const navigation: any = useNavigation()

  const { customer } = route.params

  const { t } = useTranslation()

  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadCustomerJobs = async () => {

    try {

      setLoading(true)

      const response = await getJobs()

      const allJobs = response?.jobs || []

      const customerJobs = allJobs.filter(
        (job: any) =>
          String(job.customerId) ===
          String(customer.customerId)
      )

      customerJobs.sort(
        (a: any, b: any) =>
          new Date(
            b.updatedAt || b.createdAt || 0
          ).getTime() -
          new Date(
            a.updatedAt || a.createdAt || 0
          ).getTime()
      )

      setJobs(customerJobs)

    } catch (error) {

      console.log(
        "CUSTOMER JOBS ERROR:",
        error
      )

      Alert.alert(
        t("common.errorTitle"),
        t("common.somethingWentWrong")
      )

    } finally {

      setLoading(false)

    }
  }

  useFocusEffect(
    useCallback(() => {
      loadCustomerJobs()
    }, [customer.customerId])
  )

  /*
   * IMPORTANT:
   *
   * Pending amount is calculated ONLY from
   * jobs whose status is NOT completed.
   */

  const pendingAmount = useMemo(() => {

    return jobs.reduce(
      (total: number, job: any) => {

        if (job.status === "completed") {
          return total
        }

        return total + Number(
          job.totalAmount || 0
        )

      },
      0
    )

  }, [jobs])

  /*
   * Total spent:
   *
   * Completed jobs only.
   */

  const totalSpent = useMemo(() => {

    return jobs.reduce(
      (total: number, job: any) => {

        if (job.status !== "completed") {
          return total
        }

        return total + Number(
          job.totalAmount || 0
        )

      },
      0
    )

  }, [jobs])

  /*
   * Vehicles:
   *
   * Count unique vehicle numbers.
   */

  const totalVehicles = useMemo(() => {

    const vehicles = jobs
      .map(
        (job: any) =>
          job.vehicleNumber
      )
      .filter(Boolean)

    return new Set(vehicles).size

  }, [jobs])

  /*
   * Last visit:
   */

  const lastVisit = useMemo(() => {

    if (jobs.length === 0) {
      return null
    }

    return jobs[0]?.updatedAt ||
      jobs[0]?.createdAt ||
      null

  }, [jobs])

  const callCustomer = async () => {

    if (!customer.phone) {

      Alert.alert(
        "Phone number unavailable",
        "This customer does not have a phone number."
      )

      return
    }

    try {

      await Linking.openURL(
        `tel:${customer.phone}`
      )

    } catch {

      Alert.alert(
        "Unable to call",
        "Your device could not open the phone application."
      )

    }
  }

  const whatsappCustomer = async () => {

    if (!customer.phone) {

      Alert.alert(
        "Phone number unavailable",
        "This customer does not have a phone number."
      )

      return
    }

    const cleanPhone =
      String(customer.phone)
        .replace(/\D/g, "")

    const whatsappUrl =
      `https://wa.me/${cleanPhone}`

    try {

      await Linking.openURL(
        whatsappUrl
      )

    } catch {

      Alert.alert(
        "Unable to open WhatsApp",
        "WhatsApp could not be opened on this device."
      )

    }
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <View style={styles.header}>

        <View style={styles.headerLeft}>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() =>
              navigation.goBack()
            }
            activeOpacity={0.7}
          >

            <Ionicons
              name="arrow-back"
              size={24}
              color="#111827"
            />

          </TouchableOpacity>

          <View>

            <Text style={styles.title}>
              {t("customers.detailsTitle")}
            </Text>

            <Text style={styles.subtitle}>
              {customer.name}
            </Text>

          </View>

        </View>

        <View style={styles.iconBox}>

          <Ionicons
            name="person"
            size={28}
            color="#2563EB"
          />

        </View>

      </View>

      {/* CUSTOMER CARD */}

      <View style={styles.headerCard}>

        <View style={styles.avatar}>

          <Text style={styles.avatarText}>
            {customer.name
              ?.charAt(0)
              ?.toUpperCase() || "C"}
          </Text>

        </View>

        <Text style={styles.name}>
          {customer.name || "-"}
        </Text>

        <Text style={styles.phone}>
          {customer.phone || "-"}
        </Text>

        {customer.address ? (
          <View style={styles.addressRow}>

            <Ionicons
              name="location-outline"
              size={16}
              color="#6B7280"
            />

            <Text style={styles.addressText}>
              {customer.address}
            </Text>

          </View>
        ) : null}

        <View style={styles.actionRow}>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={callCustomer}
          >

            <Ionicons
              name="call"
              size={18}
              color="#2563EB"
            />

            <Text style={styles.actionText}>
              {t("customers.labels.call")}
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: "#ECFDF5"
              }
            ]}
            onPress={whatsappCustomer}
          >

            <Ionicons
              name="logo-whatsapp"
              size={18}
              color="#16A34A"
            />

            <Text style={styles.actionText}>
              {t("customers.labels.whatsapp")}
            </Text>

          </TouchableOpacity>

        </View>

      </View>

      {/* STATS */}

      <View style={styles.statsRow}>

        <View style={styles.statCard}>

          <Text style={styles.statValue}>
            {jobs.length}
          </Text>

          <Text style={styles.statLabel}>
            {t("customers.stats.visits")}
          </Text>

        </View>

        <View style={styles.statCard}>

          <Text style={styles.statValue}>
            {totalVehicles}
          </Text>

          <Text style={styles.statLabel}>
            {t("customers.stats.vehicles")}
          </Text>

        </View>

        <View style={styles.statCard}>

          <Text
            style={[
              styles.statValue,
              { color: "#16A34A" }
            ]}
          >
            {formatCurrency(totalSpent)}
          </Text>

          <Text style={styles.statLabel}>
            {t("customers.stats.revenue")}
          </Text>

        </View>

      </View>

      {/* CUSTOMER INFO */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          {t("customers.detailsTitle")}
        </Text>

        <View style={styles.infoRow}>

          <MaterialIcons
            name="phone"
            size={18}
            color="#6B7280"
          />

          <Text style={styles.infoText}>
            {customer.phone || "-"}
          </Text>

        </View>

        <View style={styles.infoRow}>

          <Ionicons
            name="location-outline"
            size={18}
            color="#6B7280"
          />

          <Text style={styles.infoText}>
            {customer.address || "-"}
          </Text>

        </View>

        <View style={styles.infoRow}>

          <Ionicons
            name="cash-outline"
            size={18}
            color="#DC2626"
          />

          <Text style={styles.infoText}>
            {t("customers.labels.pendingAmount")}:{" "}
            <Text
              style={{
                fontWeight: "700",
                color:
                  pendingAmount > 0
                    ? "#DC2626"
                    : "#16A34A"
              }}
            >
              {formatCurrency(pendingAmount)}
            </Text>
          </Text>

        </View>

        <View style={styles.infoRow}>

          <Ionicons
            name="time-outline"
            size={18}
            color="#6B7280"
          />

          <Text style={styles.infoText}>
            Last Visit: {formatDate(lastVisit)}
          </Text>

        </View>

      </View>

      {/* JOB HISTORY */}

      <View style={styles.sectionCard}>

        <View style={styles.historyHeader}>

          <Text style={styles.sectionTitle}>
            {t("customers.serviceHistory")}
          </Text>

          <View style={styles.jobCountBadge}>

            <Text style={styles.jobCountText}>
              {jobs.length}
            </Text>

          </View>

        </View>

        {loading ? (

          <View style={styles.loaderContainer}>

            <ActivityIndicator
              size="small"
              color="#2563EB"
            />

            <Text style={styles.loadingText}>
              Loading jobs...
            </Text>

          </View>

        ) : jobs.length === 0 ? (

          <View style={styles.emptyJobs}>

            <Ionicons
              name="document-outline"
              size={36}
              color="#9CA3AF"
            />

            <Text style={styles.emptyTitle}>
              No jobs found
            </Text>

            <Text style={styles.emptyText}>
              This customer does not have any jobs yet.
            </Text>

          </View>

        ) : (

          jobs.map((job: any) => {

            const statusColor =
              getStatusColor(job.status)

            return (

              <TouchableOpacity
                key={job.jobId}
                style={styles.jobCard}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate("JobDetail", {
                    jobId: job.jobId
                  })
                }
              >
                {/* MAIN ROW */}
                <View style={styles.jobRow}>

                  {/* VEHICLE */}
                  <View style={styles.vehicleSection}>
                    <Text
                      style={styles.vehicleNumber}
                      numberOfLines={1}
                    >
                      {job.vehicleNumber || "-"}
                    </Text>

                    <Text
                      style={styles.vehicleModel}
                      numberOfLines={1}
                    >
                      {job.vehicleBrand || ""}{" "}
                      {job.vehicleModel || ""}
                    </Text>
                  </View>

                  {/* STATUS */}
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: `${statusColor}15`
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: statusColor
                        }
                      ]}
                    >
                      {getStatusLabel(job.status)}
                    </Text>
                  </View>

                  {/* AMOUNT */}
                  <Text style={styles.jobAmount}>
                    {formatCurrency(job.totalAmount)}
                  </Text>

                  {/* DATE */}
                  <Text style={styles.jobDate}>
                    {formatDate(job.createdAt)}
                  </Text>

                  {/* ARROW */}
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#9CA3AF"
                  />

                </View>
              </TouchableOpacity>

            )
          })

        )}

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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827"
  },

  subtitle: {
    marginTop: 2,
    color: "#6B7280",
    fontSize: 13
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center"
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

  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8
  },

  addressText: {
    marginLeft: 5,
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
    color: "#111827",
    flex: 1
  },

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  jobCountBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },

  jobCountText: {
    color: "#2563EB",
    fontWeight: "700"
  },

  jobTopRow: {
    flexDirection: "row",
    alignItems: "flex-start"
  },

  jobDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 14
  },

  jobDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14
  },

  jobDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },

  jobDetailText: {
    marginLeft: 6,
    color: "#6B7280",
    fontSize: 12
  },

  jobBottomRow: {
    flexDirection: "row",
    alignItems: "center"
  },

  jobAmountLabel: {
    fontSize: 11,
    color: "#6B7280"
  },

  dueLabel: {
    backgroundColor: "#FEE2E2",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: "auto",
    marginRight: 10
  },

  dueText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "700"
  },

  loaderContainer: {
    alignItems: "center",
    paddingVertical: 25
  },

  loadingText: {
    marginTop: 10,
    color: "#6B7280"
  },

  emptyJobs: {
    alignItems: "center",
    paddingVertical: 30
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#374151"
  },

  emptyText: {
    marginTop: 5,
    color: "#9CA3AF",
    textAlign: "center"
  },

  jobCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EEF2F7"
  },

  jobRow: {
    flexDirection: "row",
    alignItems: "center"
  },

  vehicleSection: {
    flex: 1,
    minWidth: 0
  },

  vehicleNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827"
  },

  vehicleModel: {
    marginTop: 2,
    fontSize: 11,
    color: "#6B7280"
  },

  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8
  },

  statusText: {
    fontSize: 9,
    fontWeight: "700"
  },

  jobAmount: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
    marginLeft: 8,
    minWidth: 58,
    textAlign: "right"
  },

  jobDate: {
    fontSize: 10,
    color: "#6B7280",
    marginLeft: 8,
    minWidth: 52,
    textAlign: "right"
  },

})