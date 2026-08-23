import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform
} from "react-native"

import { getWorkers } from "../../services/workerService"
import { useCallback, useState } from "react"
import { useFocusEffect } from "@react-navigation/native"
import { Picker } from "@react-native-picker/picker"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "../../context/LanguageContext"

import {
  getJobById,
  updateJob,
  deleteJob
} from "../../services/jobService"

export default function JobDetailScreen({
  route,
  navigation
}: any) {
  const { t } = useTranslation()
  const { jobId } = route.params

  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<any>(null)
  const [workers, setWorkers] = useState<any[]>([])

  const loadJob = async () => {
    try {
      const [jobResponse, workersResponse] = await Promise.all([
        getJobById(jobId),
        getWorkers()
      ])

      setWorkers(workersResponse.workers || [])
      setJob(jobResponse.job)
    } catch (err) {
      console.log(err)
      Alert.alert(t("jobs.errorTitle"), t("jobs.unableToLoadJob"))
    } finally {
      setLoading(false)
    }
  }

  const assignedWorker = workers.find(
    (worker: any) => String(worker.workerId) === String(job?.workerId)
  )

  useFocusEffect(
    useCallback(() => {
      loadJob()
    }, [jobId])
  )

  const updateStatus = async (status: string) => {
    try {
      await updateJob(jobId, { status })
      setJob({
        ...job,
        status
      })
    } catch {
      Alert.alert(t("jobs.errorTitle"), t("jobs.unableToUpdateStatus"))
    }
  }

  const deleteCurrentJob = async () => {
    // WEB
    if (Platform.OS === "web") {
      const confirmed = window.confirm(t("jobs.deleteJobConfirm"))

      if (!confirmed) return

      try {
        setLoading(true)
        await deleteJob(jobId)
        navigation.goBack()
      } catch (err) {
        console.log("DELETE JOB ERROR:", err)
        setLoading(false)
        window.alert(t("jobs.unableToDeleteJob"))
      }

      return
    }

    // ANDROID / IOS
    Alert.alert(
      t("jobs.deleteJobTitle"),
      t("jobs.deleteJobConfirm"),
      [
        {
          text: t("jobs.cancel"),
          style: "cancel"
        },
        {
          text: t("jobs.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true)
              await deleteJob(jobId)
              navigation.goBack()
            } catch (err) {
              console.log("DELETE JOB ERROR:", err)
              setLoading(false)
              Alert.alert(t("jobs.errorTitle"), t("jobs.unableToDeleteJob"))
            }
          }
        }
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    )
  }

  const estimatedTotal = (job.services || []).reduce((sum: number, item: any) => {
    const quantity = Number(item.quantity || 0)
    const estimatedPrice = Number(item.estimatedPrice || 0)
    return sum + estimatedPrice * quantity
  }, 0)

  const actualTotal = (job.services || []).reduce((sum: number, item: any) => {
    const quantity = Number(item.quantity || 0)
    const estimatedPrice = Number(item.estimatedPrice || 0)
    const actualPrice =
      item.actualPrice !== null &&
      item.actualPrice !== undefined &&
      item.actualPrice !== ""
        ? Number(item.actualPrice)
        : estimatedPrice

    return sum + actualPrice * quantity
  }, 0)

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.vehicleNumber}>{job.vehicleNumber}</Text>
          <Text style={styles.vehicleModel}>
            {job.vehicleBrand} {job.vehicleModel}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Picker
            selectedValue={job.status}
            style={styles.statusPicker}
            onValueChange={updateStatus}
          >
            <Picker.Item label={t("jobs.pending")} value="pending" />
            <Picker.Item label={t("jobs.inProgress")} value="progress" />
            <Picker.Item label={t("jobs.waitingParts")} value="waiting_parts" />
            <Picker.Item label={t("jobs.ready")} value="ready" />
            <Picker.Item label={t("jobs.completed")} value="completed" />
            <Picker.Item label={t("jobs.delivered")} value="delivered" />
          </Picker>
        </View>
      </View>

      {/* CUSTOMER */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("jobs.customer")}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color="#2563EB" />
          <Text style={styles.infoText}>{job.customerName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color="#2563EB" />
          <Text style={styles.infoText}>{job.phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color="#2563EB" />
          <Text style={styles.infoText}>{job.customerAddress || "-"}</Text>
        </View>
      </View>

      {/* VEHICLE */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("jobs.vehicle")}</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t("jobs.brand")}</Text>
          <Text style={styles.value}>{job.vehicleBrand || "-"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t("jobs.model")}</Text>
          <Text style={styles.value}>{job.vehicleModel}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t("jobs.type")}</Text>
          <Text style={styles.value}>{job.vehicleType}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t("jobs.odometer")}</Text>
          <Text style={styles.value}>
            {job.odometer ? `${job.odometer} ${t("jobs.km")}` : "-"}
          </Text>
        </View>
      </View>

      {/* JOB INFO */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("jobs.jobInformation")}</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t("jobs.assignedWorker")}</Text>
          <Text style={styles.value}>{assignedWorker?.name || "-"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t("jobs.priority")}</Text>
          <Text style={styles.value}>{job.priority || "-"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t("jobs.delivery")}</Text>
          <Text style={styles.value}>
            {job.deliveryDate
              ? new Date(job.deliveryDate).toLocaleString()
              : "-"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t("jobs.complaint")}</Text>
          <Text style={styles.value}>{job.complaint || "-"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t("jobs.inspection")}</Text>
          <Text style={styles.value}>{job.inspectionNotes || "-"}</Text>
        </View>
      </View>

      {/* SERVICES */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("jobs.services")}</Text>

        {(job.services || []).map((service: any, index: number) => {
          const quantity = Number(service.quantity || 0)
          const estimatedPrice = Number(service.estimatedPrice || 0)
          const actualPrice =
            service.actualPrice !== null &&
            service.actualPrice !== undefined &&
            service.actualPrice !== ""
              ? Number(service.actualPrice)
              : estimatedPrice

          return (
            <View key={index} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceQty}>
                  {t("jobs.qty")}: {quantity}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t("jobs.estimatedPrice")}</Text>
                <Text style={styles.estimatedPrice}>₹{estimatedPrice}</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t("jobs.actualPrice")}</Text>
                <Text style={styles.actualPrice}>₹{actualPrice}</Text>
              </View>
            </View>
          )
        })}
      </View>

      {/* BILL */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>{t("jobs.estimatedBill")}</Text>
        <Text style={styles.totalAmount}>₹{estimatedTotal}</Text>

        <View style={styles.actualTotalDivider} />

        <View style={styles.actualTotalRow}>
          <Text style={styles.actualTotalLabel}>{t("jobs.currentActualTotal")}</Text>
          <Text style={styles.actualTotalAmount}>₹{actualTotal}</Text>
        </View>
      </View>

      {/* PAYMENT */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("jobs.payment")}</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t("jobs.status")}</Text>
          <Text style={styles.value}>
            {job.paymentStatus || t("jobs.pending")}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t("jobs.method")}</Text>
          <Text style={styles.value}>{job.paymentMethod || "-"}</Text>
        </View>
      </View>

      {/* NOTES */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("jobs.notes")}</Text>
        <Text style={styles.notesText}>
          {job.notes || t("jobs.noNotesAdded")}
        </Text>
      </View>

      {/* ACTION BUTTONS */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("EditJobScreen", { job })}
      >
        <Ionicons name="create-outline" size={20} color="white" />
        <Text style={styles.buttonText}>{t("jobs.editJob")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.invoiceButton,
          job.status !== "completed" && styles.disabledButton
        ]}
        disabled={job.status !== "completed"}
        onPress={() => navigation.navigate("Invoice", { jobId })}
      >
        <Ionicons name="document-text-outline" size={20} color="white" />
        <Text style={styles.buttonText}>
          {job.status === "completed"
            ? t("jobs.generateInvoice")
            : t("jobs.completeJobFirst")}
        </Text>
      </TouchableOpacity>

      {job.status !== "completed" && (
        <Text style={styles.invoiceHint}>{t("jobs.invoiceHint")}</Text>
      )}

      <TouchableOpacity style={styles.deleteButton} onPress={deleteCurrentJob}>
        <Ionicons name="trash-outline" size={20} color="white" />
        <Text style={styles.buttonText}>{t("jobs.deleteJob")}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7
  },
  invoiceHint: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 13,
    marginTop: 8,
    marginBottom: 14,
    fontStyle: "italic"
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  headerCard: {
    backgroundColor: "#2563EB",
    borderRadius: 22,
    padding: 20,
    marginBottom: 18
  },
  vehicleNumber: {
    color: "white",
    fontSize: 26,
    fontWeight: "700"
  },
  vehicleModel: {
    color: "#DBEAFE",
    marginTop: 6,
    fontSize: 15
  },
  statusContainer: {
    marginTop: 18,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden"
  },
  statusPicker: {
    height: 50
  },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827"
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  infoText: {
    marginLeft: 10,
    color: "#374151",
    fontSize: 15,
    flex: 1
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14
  },
  label: {
    color: "#6B7280",
    fontSize: 14
  },
  value: {
    color: "#111827",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
    marginLeft: 20
  },
  totalCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 22,
    marginBottom: 18
  },
  totalLabel: {
    color: "#D1D5DB"
  },
  totalAmount: {
    color: "white",
    fontSize: 30,
    fontWeight: "700",
    marginTop: 8
  },
  notesText: {
    color: "#374151",
    lineHeight: 22
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    height: 55,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14
  },
  invoiceButton: {
    backgroundColor: "#16A34A",
    height: 55,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14
  },
  deleteButton: {
    backgroundColor: "#DC2626",
    height: 55,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8
  },
  serviceCard: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 4
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  serviceName: {
    fontWeight: "600",
    color: "#111827"
  },
  serviceQty: {
    color: "#6B7280"
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  priceLabel: {
    color: "#6B7280",
    fontSize: 14
  },
  estimatedPrice: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 15
  },
  actualPrice: {
    color: "#16A34A",
    fontWeight: "700",
    fontSize: 15
  },
  actualTotalDivider: {
    height: 1,
    backgroundColor: "#374151",
    marginTop: 16,
    marginBottom: 14
  },
  actualTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  actualTotalLabel: {
    color: "#D1D5DB",
    fontSize: 14
  },
  actualTotalAmount: {
    color: "#22C55E",
    fontSize: 20,
    fontWeight: "700"
  }
})