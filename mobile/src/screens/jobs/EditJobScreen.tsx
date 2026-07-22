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
  Picker
} from "@react-native-picker/picker"

import {
  Ionicons
} from "@expo/vector-icons"

import {
  getWorkers
} from "../../services/workerService"

import {
  getServiceTypes
} from "../../services/serviceTypesService"

import {
  updateJob
} from "../../services/jobService"

export default function EditJobScreen({

  route,
  navigation

}: any) {

  const { job } = route.params

  const [loading,setLoading] =
    useState(true)

  const [saving,setSaving] =
    useState(false)

  const [workers,setWorkers] =
    useState<any[]>([])

  const [serviceTypes,setServiceTypes] =
    useState<any[]>([])

  /* Customer */

  const [customerName,setCustomerName] =
    useState("")

  const [phone,setPhone] =
    useState("")

  const [customerAddress,setCustomerAddress] =
    useState("")

  /* Vehicle */

  const [vehicleNumber,setVehicleNumber] =
    useState("")

  const [vehicleBrand,setVehicleBrand] =
    useState("")

  const [vehicleModel,setVehicleModel] =
    useState("")

  const [vehicleType,setVehicleType] =
    useState("2 Wheeler")

  const [odometer,setOdometer] =
    useState("")

  const [complaint,setComplaint] =
    useState("")

  /* Job */

  const [workerId,setWorkerId] =
    useState("")

  const [priority,setPriority] =
    useState("Normal")

  const [deliveryDate,setDeliveryDate] =
    useState("")

  const [inspectionNotes,setInspectionNotes] =
    useState("")

  const [paymentStatus,setPaymentStatus] =
    useState("Pending")

  const [paymentMethod,setPaymentMethod] =
    useState("")

  const [notes,setNotes] =
    useState("")

  /* Services */

  const [selectedServices,setSelectedServices] =
    useState<any[]>([])

  const [customServiceName,setCustomServiceName] =
    useState("")

  const [customServicePrice,setCustomServicePrice] =
    useState("")

  useEffect(() => {

    loadData()

  }, [])

  const loadData = async () => {

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

      /* Prefill */

      setCustomerName(job.customerName || "")
      setPhone(job.phone || "")
      setCustomerAddress(job.customerAddress || "")

      setVehicleNumber(job.vehicleNumber || "")
      setVehicleBrand(job.vehicleBrand || "")
      setVehicleModel(job.vehicleModel || "")
      setVehicleType(job.vehicleType || "2 Wheeler")

      setOdometer(String(job.odometer || ""))
      setComplaint(job.complaint || "")

      setWorkerId(job.workerId || "")
      setPriority(job.priority || "Normal")
      setDeliveryDate(job.deliveryDate || "")

      setInspectionNotes(job.inspectionNotes || "")

      setPaymentStatus(job.paymentStatus || "Pending")
      setPaymentMethod(job.paymentMethod || "")

      setNotes(job.notes || "")

      setSelectedServices(job.services || [])

    }

    catch(err){

      console.log(err)

      Alert.alert(
        "Error",
        "Unable to load job."
      )

    }

    finally{

      setLoading(false)

    }

  }

  const addService = (service:any)=>{

    const exists = selectedServices.find(

      x =>

      x.serviceId === service.serviceTypeId

    )

    if(exists) return

    setSelectedServices(prev => [

      ...prev,

      {

        serviceId: service.serviceTypeId,

        name: service.name,

        quantity:1,

        estimatedPrice:service.defaultPrice,

        actualPrice:service.defaultPrice

      }

    ])

  }

  const addCustomService = ()=>{

    if(

      !customServiceName ||

      !customServicePrice

    ){

      return

    }

    setSelectedServices(prev => [

      ...prev,

      {

        serviceId: Date.now().toString(),

        name: customServiceName,

        quantity:1,

        estimatedPrice:Number(customServicePrice),

        actualPrice:Number(customServicePrice),

        custom:true

      }

    ])

    setCustomServiceName("")
    setCustomServicePrice("")

  }

  const removeService = (index:number)=>{

    setSelectedServices(prev =>

      prev.filter((_,i)=>i!==index)

    )

  }

  const updateService=(

    index:number,

    field:string,

    value:any

  )=>{

    setSelectedServices(prev=>{

      const copy=[...prev]

      copy[index]={

        ...copy[index],

        [field]:value

      }

      return copy

    })

  }

  const total = useMemo(()=>{

    return selectedServices.reduce(

      (sum,item)=>

        sum +

        (

          Number(item.actualPrice) *

          Number(item.quantity)

        ),

      0

    )

  },[selectedServices])

  const saveChanges = async()=>{

    try{

      setSaving(true)

      await updateJob(

        job.jobId,

        {

          customerName,

          phone,

          customerAddress,

          vehicleNumber,

          vehicleBrand,

          vehicleModel,

          vehicleType,

          odometer,

          complaint,

          workerId,

          priority,

          deliveryDate,

          inspectionNotes,

          paymentStatus,

          paymentMethod,

          notes,

          services:selectedServices

        }

      )

      Alert.alert(

        "Success",

        "Job Updated"

      )

      navigation.goBack()

    }

    catch(err){

      console.log(err)

      Alert.alert(

        "Error",

        "Unable to update job."

      )

    }

    finally{

      setSaving(false)

    }

  }

  if(loading){

    return(

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
maxLength={10}
style={styles.input}
value={phone}
onChangeText={setPhone}
/>

<TextInput
placeholder="Customer Address"
style={styles.input}
value={customerAddress}
onChangeText={setCustomerAddress}
/>

{/* VEHICLE */}

<Text style={styles.heading}>
Vehicle Details
</Text>

<TextInput
placeholder="Vehicle Number"
style={styles.input}
value={vehicleNumber}
onChangeText={(text)=>
setVehicleNumber(text.toUpperCase())
}
/>

<TextInput
placeholder="Vehicle Brand"
style={styles.input}
value={vehicleBrand}
onChangeText={setVehicleBrand}
/>

<TextInput
placeholder="Vehicle Model"
style={styles.input}
value={vehicleModel}
onChangeText={setVehicleModel}
/>

<TextInput
placeholder="Current Odometer"
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
onPress={()=>setVehicleType("2 Wheeler")}
>

<Text>🏍 2 Wheeler</Text>

</TouchableOpacity>

<TouchableOpacity
style={[
styles.typeButton,
vehicleType==="4 Wheeler" &&
styles.selectedType
]}
onPress={()=>setVehicleType("4 Wheeler")}
>

<Text>🚗 4 Wheeler</Text>

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

{workers.map((worker:any)=>(

<Picker.Item
key={worker.workerId}
label={`${worker.name} (${worker.role})`}
value={worker.workerId}
/>

))}

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

{["Low","Normal","High"].map(item=>(

<TouchableOpacity
key={item}
style={[
styles.priorityButton,
priority===item &&
styles.selectedPriority
]}
onPress={()=>setPriority(item)}
>

<Text
style={{
color:
priority===item
?
"white"
:
"#111827",
fontWeight:"600"
}}
>

{item}

</Text>

</TouchableOpacity>

))}

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

{/* Existing Services */}

<View style={styles.card}>

  <Text style={styles.sectionTitle}>
    Add Existing Service
  </Text>

  {

    serviceTypes.length === 0 ?

    <Text style={styles.emptyText}>
      No service types available.
    </Text>

    :

    serviceTypes.map((service:any)=>(

      <TouchableOpacity
        key={service.serviceTypeId}
        style={styles.serviceTypeRow}
        onPress={()=>addService(service)}
      >

        <View style={{flex:1}}>

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

selectedServices.length===0 ?

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

<View style={styles.selectedHeader}>

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

<View style={styles.row}>

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

<View style={styles.totalRow}>

<Text style={styles.totalServiceText}>
Subtotal
</Text>

<Text style={styles.totalServicePrice}>
₹ {Number(service.quantity) * Number(service.actualPrice)}
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

{/* CUSTOMER COMPLAINT */}

<Text style={styles.heading}>
Customer Complaint
</Text>

<TextInput
  style={styles.notes}
  multiline
  placeholder="Customer complaint..."
  value={complaint}
  onChangeText={setComplaint}
/>

{/* INSPECTION */}

<Text style={styles.heading}>
Inspection Notes
</Text>

<TextInput
  style={styles.notes}
  multiline
  placeholder="Inspection notes..."
  value={inspectionNotes}
  onChangeText={setInspectionNotes}
/>

{/* PAYMENT */}

<Text style={styles.heading}>
Payment Status
</Text>

<View style={styles.priorityRow}>

  {["Pending","Advance","Paid"].map(item=>(

    <TouchableOpacity
      key={item}
      style={[
        styles.priorityButton,
        paymentStatus===item &&
        styles.selectedPriority
      ]}
      onPress={()=>setPaymentStatus(item)}
    >

      <Text
        style={{
          color:
            paymentStatus===item
            ? "white"
            : "#111827",
          fontWeight:"600"
        }}
      >
        {item}
      </Text>

    </TouchableOpacity>

  ))}

</View>

<View style={styles.pickerContainer}>

<Picker
selectedValue={paymentMethod}
onValueChange={setPaymentMethod}
>

<Picker.Item
label="Select Payment Method"
value=""
/>

<Picker.Item
label="Cash"
value="Cash"
/>

<Picker.Item
label="UPI"
value="UPI"
/>

<Picker.Item
label="Card"
value="Card"
/>

<Picker.Item
label="Bank Transfer"
value="Bank Transfer"
/>

</Picker>

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

{/* SAVE */}

<TouchableOpacity
style={styles.saveBtn}
onPress={saveChanges}
disabled={saving}
>

{

saving ?

<ActivityIndicator color="white"/>

:

<Text style={styles.saveText}>
Update Job
</Text>

}

</TouchableOpacity>

<View style={{height:40}}/>

</ScrollView>

)

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F3F4F6",
padding:16
},

loader:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

heading:{
fontSize:18,
fontWeight:"700",
color:"#111827",
marginTop:20,
marginBottom:12
},

sectionTitle:{
fontSize:15,
fontWeight:"700",
marginBottom:10,
color:"#111827"
},

label:{
fontWeight:"600",
marginBottom:10,
color:"#374151"
},

input:{
backgroundColor:"white",
borderRadius:16,
padding:16,
marginBottom:14
},

notes:{
backgroundColor:"white",
borderRadius:18,
padding:16,
minHeight:120,
textAlignVertical:"top",
marginBottom:16
},

pickerContainer:{
backgroundColor:"white",
borderRadius:16,
overflow:"hidden",
marginBottom:16
},

card:{
backgroundColor:"white",
borderRadius:18,
padding:14,
marginBottom:16
},

typeRow:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:16
},

typeButton:{
width:"48%",
backgroundColor:"white",
borderRadius:16,
padding:15,
alignItems:"center"
},

selectedType:{
borderWidth:2,
borderColor:"#2563EB",
backgroundColor:"#EFF6FF"
},

priorityRow:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:16
},

priorityButton:{
width:"31%",
paddingVertical:14,
borderRadius:14,
backgroundColor:"white",
alignItems:"center"
},

selectedPriority:{
backgroundColor:"#2563EB"
},

serviceTypeRow:{
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between",
paddingVertical:14,
borderBottomWidth:1,
borderBottomColor:"#F3F4F6"
},

cardTitle:{
fontSize:16,
fontWeight:"600",
color:"#111827"
},

cardSubtitle:{
color:"#6B7280",
marginTop:4
},

selectedServiceCard:{
backgroundColor:"white",
borderRadius:18,
padding:16,
marginBottom:14
},

selectedHeader:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginBottom:14
},

row:{
flexDirection:"row",
justifyContent:"space-between",
gap:12
},

smallLabel:{
fontSize:13,
color:"#6B7280",
marginBottom:6
},

smallInput:{
backgroundColor:"#F9FAFB",
borderRadius:12,
padding:12,
textAlign:"center"
},

totalRow:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:16,
paddingTop:12,
borderTopWidth:1,
borderTopColor:"#F3F4F6"
},

totalServiceText:{
fontWeight:"600",
color:"#374151"
},

totalServicePrice:{
fontWeight:"700",
fontSize:16,
color:"#16A34A"
},

totalCard:{
backgroundColor:"#111827",
borderRadius:18,
padding:20,
marginBottom:20
},

totalLabel:{
color:"#D1D5DB"
},

totalAmount:{
color:"white",
fontSize:28,
fontWeight:"700",
marginTop:8
},

addServiceBtn:{
backgroundColor:"#2563EB",
padding:16,
borderRadius:16,
flexDirection:"row",
justifyContent:"center",
alignItems:"center",
marginBottom:20
},

addServiceText:{
color:"white",
fontWeight:"700",
marginLeft:8
},

emptyCard:{
backgroundColor:"white",
padding:24,
borderRadius:18,
alignItems:"center"
},

emptyText:{
color:"#6B7280"
},

saveBtn:{
backgroundColor:"#2563EB",
padding:18,
borderRadius:18,
alignItems:"center",
marginTop:10
},

saveText:{
color:"white",
fontSize:16,
fontWeight:"700"
}

})