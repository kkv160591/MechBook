import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native"

import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons
} from "@expo/vector-icons"

import {
  useEffect,
  useState
} from "react"

import {
  getJobById,
  updateJobStatus,
  deleteJob,
  assignWorker
} from "../../services/jobService"

export default function JobDetailsScreen({
  route,
  navigation
}: any) {

  const jobId =
    route.params.jobId

  const [loading, setLoading] =
    useState(true)

  const [job, setJob] =
    useState<any>(null)

  useEffect(() => {

    loadJob()

  }, [])

  const loadJob =
    async () => {

      try {

        const response =
          await getJobById(jobId)

        setJob(
          response.job
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

      }

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

      : "#DC2626"

  return (

    <ScrollView
      style={styles.container}
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
          Customer
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

      </View>

      {/* WORKER */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Assigned Worker
        </Text>

        {

          job.workerId

            ?

            <View style={styles.infoRow}>

              <Ionicons

                name="person-circle-outline"

                size={22}

                color="#2563EB"

              />

              <Text style={styles.infoText}>

                {job.workerId}

              </Text>

            </View>

            :

            <Text style={styles.emptyText}>

              No worker assigned

            </Text>

        }

      </View>

      {/* SERVICES */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Services
        </Text>

        {

          (job.services || []).map(

            (service: any, index: number) => (

              <View
                key={index}
                style={styles.serviceRow}
              >

                <Text
                  style={styles.serviceName}
                >

                  {service.name}

                </Text>

                <Text
                  style={styles.servicePrice}
                >

                  ₹

                  {

                    service.actualPrice ??

                    service.price ??

                    service.estimatedPrice

                  }

                </Text>

              </View>

            )

          )

        }

        <View style={styles.totalRow}>

          <Text style={styles.totalLabel}>
            Total
          </Text>

          <Text style={styles.totalPrice}>
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

          {job.notes || "No notes added."}

        </Text>

      </View>

      {/* ACTION BUTTONS */}

      <TouchableOpacity

        style={styles.primaryBtn}

        onPress={() =>
          navigation.navigate(
            "AssignWorker",
            {
              jobId: job.jobId
            }
          )
        }

      >

        <Ionicons
          name="person-add"
          size={20}
          color="white"
        />

        <Text style={styles.btnText}>
          Assign Worker
        </Text>

      </TouchableOpacity>

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

            loadJob()

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
          Change Status
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

    marginBottom: 14,

    color: "#111827"

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

  serviceRow: {

    flexDirection: "row",

    justifyContent: "space-between",

    marginBottom: 12

  },

  serviceName: {

    color: "#374151",

    fontSize: 15

  },

  servicePrice: {

    fontWeight: "700"

  },

  totalRow: {

    borderTopWidth: 1,

    borderColor: "#E5E7EB",

    paddingTop: 14,

    marginTop: 10,

    flexDirection: "row",

    justifyContent: "space-between"

  },

  totalLabel: {

    fontWeight: "700",

    fontSize: 17

  },

  totalPrice: {

    fontWeight: "700",

    fontSize: 18,

    color: "#16A34A"

  },

  notes: {

    color: "#374151",

    lineHeight: 22

  },

  primaryBtn: {

    backgroundColor: "#2563EB",

    borderRadius: 18,

    padding: 18,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 12

  },

  orangeBtn: {

    backgroundColor: "#F59E0B",

    borderRadius: 18,

    padding: 18,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 12

  },

  blueBtn: {

    backgroundColor: "#1D4ED8",

    borderRadius: 18,

    padding: 18,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 12

  },

  greenBtn: {

    backgroundColor: "#16A34A",

    borderRadius: 18,

    padding: 18,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 12

  },

  redBtn: {

    backgroundColor: "#DC2626",

    borderRadius: 18,

    padding: 18,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center"

  },

  btnText: {

    color: "white",

    fontWeight: "700",

    marginLeft: 10,

    fontSize: 15

  }

})