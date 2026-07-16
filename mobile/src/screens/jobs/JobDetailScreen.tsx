import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from "react-native"

import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons
} from "@expo/vector-icons"

import {
  useEffect,
  useState,
  useCallback
} from "react"

import {
  Picker
} from "@react-native-picker/picker"

import {
  getJobById,
  updateJobStatus,
  deleteJob,
  assignWorker
} from "../../services/jobService"

import {
  getWorkers
} from "../../services/workerService"

export default function JobDetailsScreen({
  route,
  navigation
}: any) {

  const jobId = route.params.jobId

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [job, setJob] =
    useState<any>(null)

  const [workers, setWorkers] =
    useState<any[]>([])

  const [selectedWorker, setSelectedWorker] =
    useState("")

  useEffect(() => {

    loadData()

  }, [])

  const loadData = async () => {

    try {

      const [

        jobResponse,

        workerResponse

      ] = await Promise.all([

        getJobById(jobId),

        getWorkers()

      ])

      const loadedJob =
        jobResponse.job

      setJob(loadedJob)

      setWorkers(
        workerResponse.workers || []
      )

      setSelectedWorker(
        loadedJob.workerId || ""
      )

    }

    catch (error) {

      console.log(error)

      Alert.alert(
        "Error",
        "Unable to load job."
      )

    }

    finally {

      setLoading(false)
      setRefreshing(false)

    }

  }

  const onRefresh =
    useCallback(() => {

      setRefreshing(true)

      loadData()

    }, [])

  const workerName = () => {

    const worker =
      workers.find(
        w =>
          w.workerId ===
          job?.workerId
      )

    return worker
      ? worker.name
      : "Not Assigned"

  }

  const updateStatus =
    async () => {

      try {

        let nextStatus =
          "pending"

        switch (job.status) {

          case "pending":

            nextStatus =
              "progress"

            break

          case "progress":

            nextStatus =
              "completed"

            break

          case "completed":

            nextStatus =
              "delivered"

            break

          default:

            nextStatus =
              "pending"

        }

        await updateJobStatus(

          job.jobId,

          nextStatus

        )

        loadData()

      }

      catch {

        Alert.alert(
          "Error",
          "Unable to update status."
        )

      }

    }

  const saveWorker =
    async () => {

      try {

        await assignWorker(

          job.jobId,

          selectedWorker

        )

        Alert.alert(
          "Success",
          "Worker assigned successfully."
        )

        loadData()

      }

      catch {

        Alert.alert(
          "Error",
          "Unable to assign worker."
        )

      }

    }

  const removeJob =
    () => {

      Alert.alert(

        "Delete Job",

        "Are you sure?",

        [

          {
            text: "Cancel",
            style: "cancel"
          },

          {

            text: "Delete",

            style: "destructive",

            onPress: async () => {

              try {

                await deleteJob(
                  job.jobId
                )

                navigation.goBack()

              }

              catch {

                Alert.alert(
                  "Error",
                  "Unable to delete job."
                )

              }

            }

          }

        ]

      )

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

  if (!job) {

    return (

      <View style={styles.loader}>

        <Text>
          Job not found
        </Text>

      </View>

    )

  }

  const total =

    (job.services || []).reduce(

      (sum: number, service: any) =>

        sum +

        (

          service.actualPrice ??

          service.price ??

          service.estimatedPrice ??

          0

        ),

      0

    )

  const statusColor =

    job.status === "completed"

      ? "#16A34A"

      : job.status === "progress"

      ? "#F59E0B"

      : job.status === "delivered"

      ? "#2563EB"

      : "#DC2626"

  return (

    <ScrollView

      style={styles.container}

      refreshControl={

        <RefreshControl

          refreshing={refreshing}

          onRefresh={onRefresh}

        />

      }

      showsVerticalScrollIndicator={false}

    >
          {/* VEHICLE */}

      <View style={styles.vehicleCard}>

        <View style={styles.vehicleTop}>

          <View style={styles.vehicleIcon}>

            <MaterialCommunityIcons
              name={
                job.vehicleType === "2 Wheeler"
                  ? "motorbike"
                  : "car"
              }
              size={30}
              color="#2563EB"
            />

          </View>

          <View style={{ flex: 1 }}>

            <Text style={styles.vehicleNumber}>
              {job.vehicleNumber}
            </Text>

            <Text style={styles.vehicleModel}>
              {job.vehicleModel}
            </Text>

            <Text
              style={{
                color: "#6B7280",
                marginTop: 6
              }}
            >
              {job.vehicleType}
            </Text>

          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  `${statusColor}20`
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
              {job.status.toUpperCase()}
            </Text>

          </View>

        </View>

      </View>

      {/* CUSTOMER */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Customer Details
        </Text>

        <View style={styles.infoRow}>

          <Ionicons
            name="person-outline"
            size={18}
            color="#6B7280"
          />

          <Text style={styles.infoText}>
            {job.customerName}
          </Text>

        </View>

        <View style={styles.infoRow}>

          <Ionicons
            name="call-outline"
            size={18}
            color="#6B7280"
          />

          <Text style={styles.infoText}>
            {job.phone}
          </Text>

        </View>

        <View
          style={{
            flexDirection: "row",
            marginTop: 18
          }}
        >

          <TouchableOpacity
            style={styles.smallActionBtn}
          >

            <Ionicons
              name="call"
              color="white"
              size={18}
            />

            <Text style={styles.smallBtnText}>
              Call
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.smallActionBtn,
              {
                marginLeft: 10,
                backgroundColor: "#16A34A"
              }
            ]}
          >

            <Ionicons
              name="logo-whatsapp"
              color="white"
              size={18}
            />

            <Text style={styles.smallBtnText}>
              WhatsApp
            </Text>

          </TouchableOpacity>

        </View>

      </View>

      {/* ASSIGNED WORKER */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Assigned Worker
        </Text>

        <Text
          style={{
            color: "#6B7280",
            marginBottom: 12
          }}
        >
          Current:
          {" "}
          {workerName()}
        </Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 14,
            overflow: "hidden"
          }}
        >

          <Picker
            style={styles.picker}
            selectedValue={selectedWorker}
            onValueChange={setSelectedWorker}
          >

            <Picker.Item
              label="Select Worker"
              value=""
            />

            {workers.map(worker => (

              <Picker.Item
                key={worker.workerId}
                label={`${worker.name} (${worker.role})`}
                value={worker.workerId}
              />

            ))}

          </Picker>

        </View>

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            {
              marginTop: 16
            }
          ]}
          onPress={saveWorker}
        >

          <Ionicons
            name="person-add"
            size={20}
            color="white"
          />

          <Text style={styles.btnText}>
            Update Worker
          </Text>

        </TouchableOpacity>

      </View>

      {/* JOB SUMMARY */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Job Summary
        </Text>

        <View style={styles.infoRow}>

          <MaterialIcons
            name="build-circle"
            size={18}
            color="#6B7280"
          />

          <Text style={styles.infoText}>
            {job.services.length} Services
          </Text>

        </View>

        <View style={styles.infoRow}>

          <Ionicons
            name="cash-outline"
            size={18}
            color="#6B7280"
          />

          <Text style={styles.infoText}>
            Estimated Total : ₹{total}
          </Text>

        </View>

        <View style={styles.infoRow}>

          <MaterialIcons
            name="schedule"
            size={18}
            color="#6B7280"
          />

          <Text style={styles.infoText}>
            Created :
            {" "}
            {new Date(
              job.createdAt
            ).toLocaleString()}
          </Text>

        </View>

      </View>
      {/* SERVICES */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Services
        </Text>

        {(job.services || []).map(
          (
            service: any,
            index: number
          ) => (

            <View
              key={index}
              style={styles.serviceCard}
            >

              <View
                style={{
                  flex: 1
                }}
              >

                <Text
                  style={styles.serviceName}
                >
                  {service.name}
                </Text>

                <Text
                  style={styles.servicePrice}
                >
                  Estimated :
                  {" "}
                  ₹
                  {
                    service.estimatedPrice ??
                    service.price ??
                    0
                  }
                </Text>

              </View>

              <View
                style={{
                  width: 110
                }}
              >

                <Text
                  style={styles.inputLabel}
                >
                  Actual Price
                </Text>

                <TextInput
                  style={styles.priceInput}
                  keyboardType="numeric"
                  value={
                    (
                      service.actualPrice ??
                      service.estimatedPrice ??
                      0
                    ).toString()
                  }
                />

              </View>

            </View>

          )
        )}

        <View style={styles.totalRow}>

          <Text
            style={styles.totalLabel}
          >
            Total Amount
          </Text>

          <Text
            style={styles.totalPrice}
          >
            ₹{total}
          </Text>

        </View>

      </View>

      {/* NOTES */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Notes
        </Text>

        <Text style={styles.notes}>
          {
            job.notes ||
            "No notes added."
          }
        </Text>

      </View>

      {/* JOB TIMELINE */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Timeline
        </Text>

        <View style={styles.timelineRow}>

          <View
            style={styles.timelineDot}
          />

          <View>

            <Text
              style={styles.timelineTitle}
            >
              Job Created
            </Text>

            <Text
              style={styles.timelineTime}
            >
              {
                new Date(
                  job.createdAt
                ).toLocaleString()
              }
            </Text>

          </View>

        </View>

        {job.updatedAt && (

          <View
            style={styles.timelineRow}
          >

            <View
              style={[
                styles.timelineDot,
                {
                  backgroundColor:
                    "#16A34A"
                }
              ]}
            />

            <View>

              <Text
                style={styles.timelineTitle}
              >
                Last Updated
              </Text>

              <Text
                style={styles.timelineTime}
              >
                {
                  new Date(
                    job.updatedAt
                  ).toLocaleString()
                }
              </Text>

            </View>

          </View>

        )}

      </View>

      <TouchableOpacity
        style={styles.orangeBtn}
        onPress={async () => {

          try {

            const nextStatus =
              job.status === "pending"
                ? "progress"
                : job.status === "progress"
                ? "completed"
                : "delivered"

            await updateJobStatus(
              job.jobId,
              nextStatus
            )

            loadData()

          }

          catch {

            Alert.alert(
              "Error",
              "Unable to update status."
            )

          }

        }}
      >
        <MaterialIcons
          name="update"
          size={20}
          color="white"
        />

        <Text style={styles.btnText}>
          Move to Next Status
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.blueBtn}
        onPress={() =>
          navigation.navigate(
            "EditJob",
            {
              job
            }
          )
        }
      >
        <MaterialIcons
          name="edit"
          size={20}
          color="white"
        />
        <Text style={styles.btnText}>
          Edit Job
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.greenBtn}
        onPress={() =>
          navigation.navigate(
            "InvoicePreview",
            {
              jobId: job.jobId
            }
          )
        }
      >
        <Ionicons
          name="document-text"
          size={20}
          color="white"
        />

        <Text style={styles.btnText}>
          Generate Invoice
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.redBtn}
        onPress={() =>

          Alert.alert(

            "Delete Job",

            "Are you sure you want to delete this job?",

            [

              {
                text: "Cancel",
                style: "cancel"
              },

              {
                text: "Delete",
                style: "destructive",

                onPress: async () => {

                  try {

                    await deleteJob(
                      job.jobId
                    )

                    navigation.goBack()

                  }

                  catch {

                    Alert.alert(
                      "Error",
                      "Unable to delete job."
                    )

                  }

                }

              }

            ]

          )

        }
      >
        <MaterialIcons
          name="delete"
          size={20}
          color="white"
        />

        <Text style={styles.btnText}>
          Delete Job
        </Text>

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

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  vehicleCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
    marginBottom: 16
  },

  vehicleTop: {
    flexDirection: "row",
    alignItems: "center"
  },

  vehicleIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14
  },

  vehicleNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827"
  },

  vehicleModel: {
    color: "#6B7280",
    marginTop: 4
  },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },

  statusText: {
    fontWeight: "700",
    fontSize: 12
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },

  infoText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#374151"
  },

  emptyText: {
    color: "#9CA3AF",
    fontStyle: "italic"
  },

  serviceCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  serviceName: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 15
  },

  servicePrice: {
    color: "#6B7280",
    marginTop: 4
  },

  inputLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6
  },

  priceInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 8,
    textAlign: "center"
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: "#E5E7EB"
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "700"
  },

  totalPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16A34A"
  },

  notes: {
    color: "#374151",
    lineHeight: 22
  },

  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18
  },

  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
    marginRight: 14
  },

  timelineTitle: {
    fontWeight: "600",
    color: "#111827"
  },

  timelineTime: {
    color: "#6B7280",
    marginTop: 4
  },

  primaryBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },

  orangeBtn: {
    backgroundColor: "#F59E0B",
    padding: 18,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },

  blueBtn: {
    backgroundColor: "#1D4ED8",
    padding: 18,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },

  greenBtn: {
    backgroundColor: "#16A34A",
    padding: 18,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },

  redBtn: {
    backgroundColor: "#DC2626",
    padding: 18,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },

  btnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 10
  },

  smallActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10
  },

  smallBtnText: {
    color: "white",
    fontWeight: "700",
    marginLeft: 6
  },

  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden"
  },

  picker: {
    height: 55
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 18
  },

  subHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12
  },

  chip: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10
  },

  selectedChip: {
    backgroundColor: "#2563EB"
  },

  chipText: {
    color: "#2563EB",
    fontWeight: "600"
  },

  selectedChipText: {
    color: "white"
  },

  selectedServiceCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12
  },

  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },

  removeBtn: {
    padding: 4
  },

  serviceInput: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  addManualBtn: {
    backgroundColor: "#16A34A",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12
  },

  addManualText: {
    color: "white",
    fontWeight: "700"
  }

})