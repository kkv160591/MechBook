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
  useMemo,
  useState
} from "react"

import {
  Ionicons
} from "@expo/vector-icons"

import {
  Picker
} from "@react-native-picker/picker"

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

  /* Customer */

  const [customerName, setCustomerName] =
    useState("")

  const [phone, setPhone] =
    useState("")

  /* Vehicle */

  const [vehicleNumber, setVehicleNumber] =
    useState("")

  const [vehicleModel, setVehicleModel] =
    useState("")

  const [vehicleType, setVehicleType] =
    useState("2 Wheeler")

  const [odometer, setOdometer] =
    useState("")

  /* Worker */

  const [workerId, setWorkerId] =
    useState("")

  /* Job */

  const [priority, setPriority] =
    useState("Normal")

  const [deliveryDate, setDeliveryDate] =
    useState("")

  const [notes, setNotes] =
    useState("")

  /* Services */

  const [selectedServices, setSelectedServices] =
    useState<any[]>([])

  const [customServiceName, setCustomServiceName] =
    useState("")

  const [customServicePrice, setCustomServicePrice] =
    useState("")

  useEffect(() => {

    loadData()

  }, [])

  const loadData =
    async () => {

      try {

        const [

          workersRes,

          servicesRes

        ] = await Promise.all([

          getWorkers(),

          getServiceTypes()

        ])

        setWorkers(

          workersRes.workers || []

        )

        setServiceTypes(

          servicesRes.serviceTypes || []

        )

      }

      catch (err) {

        console.log(err)

        Alert.alert(
          "Error",
          "Unable to load workers/services."
        )

      }

      finally {

        setLoading(false)

      }

    }

  const addService =
    (service: any) => {

      const exists =
        selectedServices.find(
          x =>
            x.serviceId ===
            service.serviceTypeId
        )

      if (exists) return

      setSelectedServices(prev => [

        ...prev,

        {

          serviceId:
            service.serviceTypeId,

          name:
            service.name,

          quantity: 1,

          estimatedPrice:
            service.defaultPrice,

          actualPrice:
            service.defaultPrice

        }

      ])

    }

  const removeService =
    (index: number) => {

      setSelectedServices(prev =>
        prev.filter((_, i) =>
          i !== index
        )
      )

    }

  const updateService =
    (
      index: number,
      field: string,
      value: any
    ) => {

      setSelectedServices(prev => {

        const copy = [...prev]

        copy[index] = {

          ...copy[index],

          [field]: value

        }

        return copy

      })

    }

  const addCustomService =
    () => {

      if (

        !customServiceName ||

        !customServicePrice

      ) {

        return

      }

      setSelectedServices(prev => [

        ...prev,

        {

          serviceId:
            Date.now().toString(),

          name:
            customServiceName,

          quantity: 1,

          estimatedPrice:
            Number(customServicePrice),

          actualPrice:
            Number(customServicePrice),

          custom: true

        }

      ])

      setCustomServiceName("")

      setCustomServicePrice("")

    }

  const total =
    useMemo(() => {

      return selectedServices.reduce(

        (sum, item) =>

          sum +

          (
            Number(item.actualPrice) *

            Number(item.quantity)
          ),

        0

      )

    }, [selectedServices])

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
          "Add at least one service."
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

          odometer,

          workerId,

          priority,

          deliveryDate,

          notes,

          services: selectedServices

        })

        Alert.alert(
          "Success",
          "Job Created"
        )

        navigation.goBack()

      }

      catch (err) {

        console.log(err)

        Alert.alert(
          "Error",
          "Unable to create job."
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

{/* CUSTOMER */}

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

{/* VEHICLE */}

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

<TextInput
placeholder="Current Odometer (KM)"
keyboardType="numeric"
style={styles.input}
value={odometer}
onChangeText={setOdometer}
/>

<Text style={styles.label}>
Vehicle Type
</Text>

<View style={styles.typeRow}>

<TouchableOpacity

style={[

styles.typeButton,

vehicleType==="2 Wheeler" &&

styles.selectedType

]}

onPress={()=>

setVehicleType("2 Wheeler")

}

>

<Text>

🏍 2 Wheeler

</Text>

</TouchableOpacity>

<TouchableOpacity

style={[

styles.typeButton,

vehicleType==="4 Wheeler" &&

styles.selectedType

]}

onPress={()=>

setVehicleType("4 Wheeler")

}

>

<Text>

🚗 4 Wheeler

</Text>

</TouchableOpacity>

</View>

{/* ASSIGN WORKER */}

<Text style={styles.heading}>
Assign Worker
</Text>

<View style={styles.pickerContainer}>

<Picker

selectedValue={workerId}

onValueChange={setWorkerId}

>

<Picker.Item

label="Select Worker"

value=""

/>

{

workers.map(worker=>(

<Picker.Item

key={worker.workerId}

label={`${worker.name} (${worker.role})`}

value={worker.workerId}

/>

))

}

</Picker>

</View>

{/* JOB DETAILS */}

<Text style={styles.heading}>
Job Details
</Text>

<Text style={styles.label}>
Priority
</Text>

<View style={styles.priorityRow}>

{

["Low","Normal","High"].map(item=>(

<TouchableOpacity

key={item}

style={[

styles.priorityButton,

priority===item &&

styles.selectedPriority

]}

onPress={()=>

setPriority(item)

}

>

<Text

style={{

fontWeight:"600",

color:

priority===item

?

"white"

:

"#111827"

}}

>

{item}

</Text>

</TouchableOpacity>

))

}

</View>

<TextInput

placeholder="Expected Delivery Date"

style={styles.input}

value={deliveryDate}

onChangeText={setDeliveryDate}

/>

{/* SERVICES */}

<Text style={styles.heading}>
Services
</Text>

{/* AVAILABLE SERVICES */}

<View style={styles.card}>

  <Text style={styles.sectionTitle}>
    Select Existing Service
  </Text>

  {

    serviceTypes.length === 0 ?

      <Text style={styles.emptyText}>
        No service types available.
      </Text>

      :

      serviceTypes.map(service => (

        <TouchableOpacity
          key={service.serviceTypeId}
          style={styles.serviceTypeRow}
          onPress={() => addService(service)}
        >

          <View style={{ flex: 1 }}>

            <Text style={styles.cardTitle}>
              {service.name}
            </Text>

            <Text style={styles.cardSubtitle}>
              ₹ {service.defaultPrice}
            </Text>

          </View>

          <Ionicons
            name="add-circle"
            size={26}
            color="#2563EB"
          />

        </TouchableOpacity>

      ))

  }

</View>

{/* CUSTOM SERVICE */}

<Text style={styles.heading}>
Custom Service
</Text>

<TextInput
  placeholder="Service Name"
  style={styles.input}
  value={customServiceName}
  onChangeText={setCustomServiceName}
/>

<TextInput
  placeholder="Price"
  keyboardType="numeric"
  style={styles.input}
  value={customServicePrice}
  onChangeText={setCustomServicePrice}
/>

<TouchableOpacity
  style={styles.addServiceBtn}
  onPress={addCustomService}
>

  <Ionicons
    name="add"
    size={20}
    color="white"
  />

  <Text style={styles.addServiceText}>
    Add Custom Service
  </Text>

</TouchableOpacity>

{/* SELECTED SERVICES */}

<Text style={styles.heading}>
Selected Services
</Text>

{

selectedServices.length === 0 ?

<View style={styles.emptyCard}>

<Text style={styles.emptyText}>

No services added yet.

</Text>

</View>

:

selectedServices.map((service,index)=>(

<View
key={index}
style={styles.selectedServiceCard}
>

<View
style={styles.selectedHeader}
>

<Text style={styles.cardTitle}>

{service.name}

</Text>

<TouchableOpacity
onPress={()=>removeService(index)}
>

<Ionicons
name="trash-outline"
size={22}
color="#DC2626"
/>

</TouchableOpacity>

</View>

<View
style={styles.row}
>

<View style={{flex:1}}>

<Text style={styles.smallLabel}>

Qty

</Text>

<TextInput

style={styles.smallInput}

keyboardType="numeric"

value={String(service.quantity)}

onChangeText={(text)=>

updateService(

index,

"quantity",

Number(text)||1

)

}

/>

</View>

<View style={{flex:1}}>

<Text style={styles.smallLabel}>

Price

</Text>

<TextInput

style={styles.smallInput}

keyboardType="numeric"

value={String(service.actualPrice)}

onChangeText={(text)=>

updateService(

index,

"actualPrice",

Number(text)||0

)

}

/>

</View>

</View>

<View
style={styles.totalRow}
>

<Text style={styles.totalServiceText}>

Subtotal

</Text>

<Text style={styles.totalServicePrice}>

₹ {service.quantity * service.actualPrice}

</Text>

</View>

</View>

))

}

{/* GRAND TOTAL */}

<View style={styles.totalCard}>

<Text style={styles.totalLabel}>

Estimated Total

</Text>

<Text style={styles.totalAmount}>

₹ {total}

</Text>

</View>

{/* NOTES */}

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

{

saving ?

<ActivityIndicator
color="white"
/>

:

<Text style={styles.saveText}>

Create Job

</Text>

}

</TouchableOpacity>

<View style={{height:50}} />

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
    marginTop: 20,
    marginBottom: 12
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10
  },

  label: {
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10
  },

  input: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14
  },

  notes: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    minHeight: 120,
    textAlignVertical: "top"
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10
  },

  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16
  },

  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },

  typeButton: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    alignItems: "center"
  },

  selectedType: {
    borderWidth: 2,
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF"
  },

  priorityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16
  },

  priorityButton: {
    width: "31%",
    backgroundColor: "white",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center"
  },

  selectedPriority: {
    backgroundColor: "#2563EB"
  },

  serviceTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6"
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

  addServiceBtn: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    marginBottom: 20
  },

  addServiceText: {
    color: "white",
    fontWeight: "700",
    marginLeft: 8
  },

  selectedServiceCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14
  },

  selectedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },

  smallLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6
  },

  smallInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    textAlign: "center"
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6"
  },

  totalServiceText: {
    fontWeight: "600",
    color: "#374151"
  },

  totalServicePrice: {
    fontWeight: "700",
    color: "#16A34A",
    fontSize: 16
  },

  totalCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 20,
    marginTop: 8,
    marginBottom: 20
  },

  totalLabel: {
    color: "#D1D5DB",
    fontSize: 15
  },

  totalAmount: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8
  },

  emptyCard: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 18,
    alignItems: "center"
  },

  emptyText: {
    color: "#6B7280"
  },

  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10
  },

  saveText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16
  }

})