import {
  View,
 Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native"

import {
  useEffect,
  useState
} from "react"

import {
  Ionicons
} from "@expo/vector-icons"

import {
  createJob
} from "../../services/jobService"

import {
  getWorkers
} from "../../services/workerService"

import {
  getServiceTypes
} from "../../services/serviceTypesService"

export default function AddJobScreen({
  navigation
}: any) {

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [workers, setWorkers] =
    useState<any[]>([])

  const [serviceTypes, setServiceTypes] =
    useState<any[]>([])

  const [customerName, setCustomerName] =
    useState("")

  const [phone, setPhone] =
    useState("")

  const [vehicleNumber, setVehicleNumber] =
    useState("")

  const [vehicleModel, setVehicleModel] =
    useState("")

  const [vehicleType, setVehicleType] =
    useState("2 Wheeler")

  const [workerId, setWorkerId] =
    useState("")

  const [selectedServices, setSelectedServices] =
    useState<any[]>([])

  const [notes, setNotes] =
    useState("")

  useEffect(() => {

    loadData()

  }, [])

  const loadData =
    async () => {

      try {

        const [

          workerResponse,

          serviceResponse

        ] = await Promise.all([

          getWorkers(),

          getServiceTypes()

        ])

        setWorkers(

          workerResponse.workers || []

        )

        setServiceTypes(

          serviceResponse.serviceTypes || []

        )

      }

      catch (error) {

        console.log(error)

        Alert.alert(

          "Error",

          "Failed to load data"

        )

      }

      finally {

        setLoading(false)

      }

    }

  const toggleService =
    (service: any) => {

      const exists =

        selectedServices.find(

          s => s.serviceTypeId === service.serviceTypeId

        )

      if (exists) {

        setSelectedServices(

          prev =>

            prev.filter(

              s =>

                s.serviceTypeId !==

                service.serviceTypeId

            )

        )

      }

      else {

        setSelectedServices(

          prev => [

            ...prev,

            {

              serviceId:

                service.serviceTypeId,

              name:

                service.name,

              estimatedPrice:

                service.defaultPrice

            }

          ]

        )

      }

    }

  const saveJob =
    async () => {

      if (

        !customerName ||

        !phone ||

        !vehicleNumber ||

        !vehicleModel

      ) {

        Alert.alert(

          "Validation",

          "Please fill all required fields."

        )

        return

      }

      if (

        selectedServices.length === 0

      ) {

        Alert.alert(

          "Validation",

          "Select at least one service."

        )

        return

      }

      try {

        setSaving(true)

        await createJob({

          customerName,

          phone,

          vehicleNumber,

          vehicleModel,

          vehicleType,

          workerId,

          services: selectedServices,

          notes

        })

        Alert.alert(

          "Success",

          "Job created successfully"

        )

        navigation.goBack()

      }

      catch (error) {

        console.log(error)

        Alert.alert(

          "Error",

          "Unable to create job"

        )

      }

      finally {

        setSaving(false)

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

  return (

    <ScrollView

      style={styles.container}

      showsVerticalScrollIndicator={false}

    >

      <Text style={styles.heading}>

        Customer Details

      </Text>

      <TextInput

        placeholder="Customer Name"

        style={styles.input}

        value={customerName}

        onChangeText={setCustomerName}

      />

      <TextInput

        placeholder="Phone Number"

        keyboardType="phone-pad"

        style={styles.input}

        value={phone}

        onChangeText={setPhone}

      />

      <Text style={styles.heading}>

        Vehicle Details

      </Text>

      <TextInput

        placeholder="Vehicle Number"

        style={styles.input}

        value={vehicleNumber}

        onChangeText={setVehicleNumber}

      />

      <TextInput

        placeholder="Vehicle Model"

        style={styles.input}

        value={vehicleModel}

        onChangeText={setVehicleModel}

      />

      <Text style={styles.label}>

        Vehicle Type

      </Text>

      <View style={styles.typeRow}>

        <TouchableOpacity

          style={[

            styles.typeButton,

            vehicleType === "2 Wheeler" &&

            styles.selectedType

          ]}

          onPress={() =>

            setVehicleType("2 Wheeler")

          }

        >

          <Text>

            2 Wheeler

          </Text>

        </TouchableOpacity>

        <TouchableOpacity

          style={[

            styles.typeButton,

            vehicleType === "4 Wheeler" &&

            styles.selectedType

          ]}

          onPress={() =>

            setVehicleType("4 Wheeler")

          }

        >

          <Text>

            4 Wheeler

          </Text>

        </TouchableOpacity>

      </View>
            <Text style={styles.heading}>
        Assign Worker
      </Text>

      <View style={styles.card}>

        {workers.map(worker => {

          const selected =
            workerId === worker.workerId

          return (

            <TouchableOpacity
              key={worker.workerId}
              style={[
                styles.selectCard,
                selected &&
                styles.selectedCard
              ]}
              onPress={() =>
                setWorkerId(worker.workerId)
              }
            >

              <View>

                <Text style={styles.cardTitle}>
                  {worker.name}
                </Text>

                <Text style={styles.cardSubtitle}>
                  {worker.role}
                </Text>

              </View>

              {selected && (

                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#2563EB"
                />

              )}

            </TouchableOpacity>

          )

        })}

      </View>

      <Text style={styles.heading}>
        Select Services
      </Text>

      <View style={styles.card}>

        {serviceTypes.map(service => {

          const selected =
            selectedServices.find(
              s =>
                s.serviceId ===
                service.serviceTypeId
            )

          return (

            <TouchableOpacity
              key={service.serviceTypeId}
              style={[
                styles.selectCard,
                selected &&
                styles.selectedCard
              ]}
              onPress={() =>
                toggleService(service)
              }
            >

              <View style={{ flex: 1 }}>

                <Text style={styles.cardTitle}>
                  {service.name}
                </Text>

                <Text style={styles.cardSubtitle}>
                  ₹{service.defaultPrice}
                </Text>

              </View>

              {selected && (

                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#16A34A"
                />

              )}

            </TouchableOpacity>

          )

        })}

      </View>

      <Text style={styles.heading}>
        Notes
      </Text>

      <TextInput
        style={styles.notes}
        multiline
        placeholder="Additional notes..."
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity
        style={styles.saveBtn}
        disabled={saving}
        onPress={saveJob}
      >

        {saving ? (

          <ActivityIndicator
            color="white"
          />

        ) : (

          <Text style={styles.saveText}>
            Create Job
          </Text>

        )}

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

  heading: {

    fontSize: 18,

    fontWeight: "700",

    color: "#111827",

    marginBottom: 12,

    marginTop: 16

  },

  label: {

    fontWeight: "600",

    marginBottom: 10,

    color: "#374151"

  },

  input: {

    backgroundColor: "white",

    borderRadius: 16,

    padding: 16,

    marginBottom: 14

  },

  card: {

    backgroundColor: "white",

    borderRadius: 18,

    padding: 12

  },

  typeRow: {

    flexDirection: "row",

    justifyContent: "space-between",

    marginBottom: 20

  },

  typeButton: {

    width: "48%",

    backgroundColor: "white",

    borderRadius: 14,

    padding: 16,

    alignItems: "center"

  },

  selectedType: {

    borderWidth: 2,

    borderColor: "#2563EB",

    backgroundColor: "#EFF6FF"

  },

  selectCard: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingVertical: 14,

    paddingHorizontal: 10,

    borderBottomWidth: 1,

    borderBottomColor: "#F3F4F6"

  },

  selectedCard: {

    backgroundColor: "#EFF6FF",

    borderRadius: 12

  },

  cardTitle: {

    fontSize: 16,

    fontWeight: "600",

    color: "#111827"

  },

  cardSubtitle: {

    color: "#6B7280",

    marginTop: 4

  },

  notes: {

    backgroundColor: "white",

    borderRadius: 18,

    padding: 16,

    minHeight: 120,

    textAlignVertical: "top"

  },

  saveBtn: {

    backgroundColor: "#2563EB",

    padding: 18,

    borderRadius: 18,

    alignItems: "center",

    marginTop: 24

  },

  saveText: {

    color: "white",

    fontWeight: "700",

    fontSize: 16

  }

})