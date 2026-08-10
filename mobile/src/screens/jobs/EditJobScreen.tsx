import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard
} from "react-native"

import DateTimePicker from "@react-native-community/datetimepicker"

import {
  useEffect,
  useMemo,
  useState,
  useRef
} from "react"

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

  const [submitted, setSubmitted] = useState(false);

  const [showWorkerSuggestions, setShowWorkerSuggestions] = useState(false)

  const [showPaymentSuggestions, setShowPaymentSuggestions] = useState(false)

  const scrollRef = useRef<ScrollView>(null);

  const customerNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const vehicleNumberRef = useRef<TextInput>(null);
  const vehicleModelRef = useRef<TextInput>(null);

  const customerNameY = useRef(0);
  const phoneY = useRef(0);
  const vehicleNumberY = useRef(0);
  const vehicleModelY = useRef(0);

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

  const [workerName, setWorkerName] = useState("")

  const searchedWorkers = useMemo(() => {
  
        if (!workerName.trim())
            return workers
  
        return workers.filter(worker =>
  
            (worker.name || "")
                .toLowerCase()
                .includes(workerName.toLowerCase())
  
        )
  
    }, [workerName, workers])

  const [priority,setPriority] =
    useState("Normal")

  const [deliveryDate, setDeliveryDate] =
    useState<Date | null>(null)

  const [showDatePicker, setShowDatePicker] =
    useState(false)

  const [showTimePicker, setShowTimePicker] =
    useState(false)

  const [inspectionNotes,setInspectionNotes] =
    useState("")

  const [paymentStatus,setPaymentStatus] =
    useState("Pending")

  const [paymentMethod,setPaymentMethod] =
    useState("")

  const [notes,setNotes] =
    useState("")

  const paymentMethods = [
  "Cash",
  "UPI",
  "Card",
  "Bank Transfer"
]

const searchedPaymentMethods = useMemo(() => {

  if (!paymentMethod.trim())
    return paymentMethods

  return paymentMethods.filter(method =>
    method
      .toLowerCase()
      .includes(paymentMethod.toLowerCase())
  )

}, [paymentMethod])

  /* Services */

  const [selectedServices,setSelectedServices] =
    useState<any[]>([])

  const [serviceName, setServiceName] = useState("")
  const [servicePrice, setServicePrice] = useState("")
  const [serviceQty, setServiceQty] = useState("1")

  const [showSuggestions, setShowSuggestions] =
      useState(false)

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
        servicesRes.services || []
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

      const existingWorker = (workersRes.workers || []).find(
        (worker: any) =>
          String(worker.workerId) ===
          String(job.workerId)
      )

      setWorkerName(
        existingWorker?.name || ""
      )
      setPriority(job.priority || "Normal")
      setDeliveryDate(
        job.deliveryDate
          ? new Date(job.deliveryDate)
          : null
      )

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

  const removeService =
    (index: number) => {

      setSelectedServices(prev =>
        prev.filter((_, i) =>
          i !== index
        )
      )

    }

  const closeDropdowns = () => {
        Keyboard.dismiss();
  
        setShowSuggestions(false);
        setShowWorkerSuggestions(false);
        setShowPaymentSuggestions(false);
    };

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

  const searchedServices = useMemo(() => {
  
        if (!serviceName.trim())
            return []
  
        return serviceTypes.filter(service =>
  
            (service.name || "")
                .toLowerCase()
                .includes(serviceName.toLowerCase())
  
        )
  
    }, [serviceName, serviceTypes])

  const addCurrentService = () => {

    if (!serviceName.trim())
        return

    setSelectedServices(prev => [

        ...prev,

        {

            serviceId: null,

            name: serviceName,

            quantity: Number(serviceQty) || 1,

            estimatedPrice: Number(servicePrice) || 0,

            actualPrice: Number(servicePrice) || 0

        }

    ])

    setServiceName("")
    setServicePrice("")
    setServiceQty("1")
    closeDropdowns();

}

const onDateChange = (
  event: any,
  selectedDate?: Date
) => {

  setShowDatePicker(false)

  if (!selectedDate) return

  const current =
    deliveryDate || new Date()

  current.setFullYear(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  )

  setDeliveryDate(new Date(current))

  setShowTimePicker(true)

}

const onTimeChange = (
  event: any,
  selectedTime?: Date
) => {

  setShowTimePicker(false)

  if (!selectedTime) return

  const current =
    deliveryDate || new Date()

  current.setHours(
    selectedTime.getHours(),
    selectedTime.getMinutes()
  )

  setDeliveryDate(new Date(current))

}

  const saveChanges = async()=>{

    const missingFields = [];
    setSubmitted(true);
    if (!customerName.trim())
        missingFields.push("Customer Name");
    
    if (!phone.trim())
        missingFields.push("Phone Number");
    
    if (!vehicleNumber.trim())
        missingFields.push("Vehicle Number");
    
    if (!vehicleModel.trim())
        missingFields.push("Vehicle Model");
    
    if (selectedServices.length === 0)
        missingFields.push("At least one Service");
    
    if (missingFields.length > 0) {
    
        if (!customerName.trim()) {
    
            scrollRef.current?.scrollTo({
                y: customerNameY.current - 20,
                animated: true,
            });
    
            setTimeout(() => {
                customerNameRef.current?.focus();
            }, 300);
    
        }
    
        else if (!phone.trim()) {
    
            scrollRef.current?.scrollTo({
                y: phoneY.current - 20,
                animated: true,
            });
    
            setTimeout(() => {
                phoneRef.current?.focus();
            }, 300);
    
        }
    
        else if (!vehicleNumber.trim()) {
    
            scrollRef.current?.scrollTo({
                y: vehicleNumberY.current - 20,
                animated: true,
            });
    
            setTimeout(() => {
                vehicleNumberRef.current?.focus();
            }, 300);
    
        }
    
        else if (!vehicleModel.trim()) {
    
            scrollRef.current?.scrollTo({
                y: vehicleModelY.current - 20,
                animated: true,
            });
    
            setTimeout(() => {
                vehicleModelRef.current?.focus();
            }, 300);
    
        }
    
        Alert.alert(
            "Missing Required Fields",
            "• " + missingFields.join("\n• ")
        );
    
        return;
    }
    
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

          deliveryDate:
            deliveryDate
              ? deliveryDate.toISOString()
              : "",

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

  const formatDate = (date: Date) => {
  
    return date.toLocaleString("en-IN", {
  
      day: "2-digit",
  
      month: "short",
  
      year: "numeric",
  
      hour: "2-digit",
  
      minute: "2-digit"
  
    })
  
  }
  
  const RequiredLabel = ({ text }: { text: string }) => (
      <Text style={styles.label}>
          {text}
          <Text style={{ color: "#DC2626" }}> *</Text>
      </Text>
  );

  return (

<ScrollView 
ref={scrollRef} 
style={styles.container} 
keyboardShouldPersistTaps="handled" 
onScrollBeginDrag={closeDropdowns}
>

{/* CUSTOMER */}

<Text style={styles.heading}>
Customer Details
</Text>

<RequiredLabel text="Customer Name" />
<TextInput
ref={customerNameRef}
style={[
  styles.input,
  submitted &&
  !customerName.trim() &&
  styles.inputError
]}
value={customerName}
onChangeText={setCustomerName}
onFocus={closeDropdowns}
/>

{submitted &&
!customerName.trim() && (
  <Text style={styles.errorText}>
    Customer Name is required.
  </Text>
)}

<RequiredLabel text="Phone Number" />
<TextInput
ref={phoneRef}
keyboardType="phone-pad"
maxLength={10}
style={[
  styles.input,
  submitted &&
  !phone.trim() &&
  styles.inputError
]}
value={phone}
onChangeText={setPhone}
onFocus={closeDropdowns}
/>

{submitted &&
!phone.trim() && (
  <Text style={styles.errorText}>
    Phone Number is required.
  </Text>
)}

<Text style={styles.label}> Customer Address </Text>
<TextInput
style={styles.input}
value={customerAddress}
onChangeText={setCustomerAddress}
onFocus={closeDropdowns}
/>

{/* VEHICLE */}

<Text style={styles.heading}>
Vehicle Details
</Text>
<RequiredLabel text="Vehicle Number" />
<TextInput
ref={vehicleNumberRef}
style={[
  styles.input,
  submitted &&
  !vehicleNumber.trim() &&
  styles.inputError
]}
value={vehicleNumber}
onChangeText={(text) =>
  setVehicleNumber(text.toUpperCase())
}
onFocus={closeDropdowns}
/>

{submitted &&
!vehicleNumber.trim() && (
  <Text style={styles.errorText}>
    Vehicle Number is required.
  </Text>
)}

<Text style={styles.label}> Vehicle Brand </Text>
<TextInput
style={styles.input}
value={vehicleBrand}
onChangeText={setVehicleBrand}
onFocus={closeDropdowns}
/>

<RequiredLabel text="Vehicle Model" />
<TextInput
ref={vehicleModelRef}
style={[
  styles.input,
  submitted &&
  !vehicleModel.trim() &&
  styles.inputError
]}
value={vehicleModel}
onChangeText={setVehicleModel}
onFocus={closeDropdowns}
/>

{submitted &&
!vehicleModel.trim() && (
  <Text style={styles.errorText}>
    Vehicle Model is required.
  </Text>
)}

<Text style={styles.label}> Current Odometer </Text>
<TextInput
keyboardType="numeric"
style={styles.input}
value={odometer}
onChangeText={setOdometer}
onFocus={closeDropdowns}
/>

<RequiredLabel text="Vehicle Type" />
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

<View
    style={[
        styles.inputWrapper,
        showWorkerSuggestions && { marginBottom: 220 }
    ]}
>

<TextInput
    placeholder="Select Worker"
    style={styles.input}
    value={workerName}
    onFocus={() => {

        setShowWorkerSuggestions(true);
        setShowSuggestions(false);
        setShowPaymentSuggestions(false);

    }}
    onChangeText={(text) => {

        setWorkerName(text)

        setShowWorkerSuggestions(true)

    }}
/>

{
showWorkerSuggestions && (
<View style={styles.suggestionContainer}>


    {

        searchedWorkers.map(worker => (

        <TouchableOpacity

            key={worker.workerId}

            style={styles.workerSuggestion}

            onPress={() => {

                setWorkerId(worker.workerId)

                setWorkerName(worker.name)

                setShowWorkerSuggestions(false)

            }}

        >

            <View>

                <Text style={styles.cardTitle}>
                    {worker.name}
                </Text>

                <Text style={styles.cardSubtitle}>
                    {worker.role}
                </Text>

            </View>

            <Ionicons
                name="person-circle"
                size={26}
                color="#2563EB"
            />

        </TouchableOpacity>

        ))

    }

</View>
)
}
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

<Text style={styles.label}>
Expected Delivery Date
</Text>

<TouchableOpacity
style={styles.input}
onPress={() => {

  setShowDatePicker(true)

}}
>

<Text
style={{
color: deliveryDate
? "#111827"
: "#9CA3AF"
}}
>

{deliveryDate

? formatDate(deliveryDate)

: "Delivery Date"}

</Text>

</TouchableOpacity>

{/* SERVICES */}

<Text style={styles.heading}>
Services
</Text>

<RequiredLabel text="Service" />
<View
    style={[
        styles.inputWrapper,
        showSuggestions && { marginBottom: 220 }
    ]}
>
<TextInput
    style={styles.input}
    value={serviceName}
    onFocus={() => {

        setShowSuggestions(true);
        setShowWorkerSuggestions(false);
        setShowPaymentSuggestions(false);

    }}
    onChangeText={(text) => {

        setServiceName(text)

        setShowSuggestions(true)

    }}
/>

{
showSuggestions &&
searchedServices.length > 0 && (
<View style={styles.suggestionContainer}>

    {searchedServices.map(service => (

    <TouchableOpacity

        key={service.serviceTypeId}

        style={styles.suggestionItem}

        onPress={() => {

            setServiceName(service.name)
            setServicePrice(String(service.defaultPrice))
            closeDropdowns();
            setShowWorkerSuggestions(false)
            setShowPaymentSuggestions(false)

        }}

    >

        <View style={{ flex: 1 }}>

            <Text style={styles.cardTitle}>
                {service.name}
            </Text>

            <Text style={styles.cardSubtitle}>
                {service.category}
            </Text>

        </View>

        <Text style={styles.suggestionPrice}>
            ₹ {service.defaultPrice}
        </Text>

    </TouchableOpacity>

    ))}

</View>
)
}
</View>

<View style={styles.row}>

    <View style={{ flex: 2 }}>
        <Text style={styles.label}>Price</Text>

        <TextInput
            onFocus={closeDropdowns}
            keyboardType="numeric"
            style={styles.input}
            value={servicePrice}
            onChangeText={setServicePrice}
        />
    </View>

    <View style={{ flex: 1 }}>
        <Text style={styles.label}>Quantity</Text>

        <TextInput
            onFocus={closeDropdowns}
            keyboardType="numeric"
            style={styles.input}
            value={serviceQty}
            onChangeText={setServiceQty}
        />
    </View>

</View>

<TouchableOpacity

style={styles.addServiceBtn}

onPress={addCurrentService}

>

<Text style={styles.addServiceText}>

Add Service

</Text>

</TouchableOpacity>

{/* SELECTED SERVICES */}

<Text style={styles.heading}>
Selected Services
</Text>

{

selectedServices.length === 0 ?

<View style={styles.emptyCard}>

<Text
style={[
styles.emptyText,
submitted && {
color:"#DC2626",
fontWeight:"600"
}
]}
>
At least one service is required.
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

onFocus={closeDropdowns}

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

onFocus={closeDropdowns}

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
  onFocus={closeDropdowns}
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
  onFocus={closeDropdowns}
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
:"#111827"
}}
>
{item}
</Text>

</TouchableOpacity>

))}

</View>

<View
    style={[
        styles.inputWrapper,
        showPaymentSuggestions && { marginBottom: 220 }
    ]}
>
  <Text style={styles.label}>
Payment Method
</Text>
<TextInput
    placeholder="Select Payment Method"
    style={styles.input}
    value={paymentMethod}
    onFocus={() => {

        setShowPaymentSuggestions(true);
        setShowSuggestions(false);
        setShowWorkerSuggestions(false);

    }}
    onChangeText={(text) => {

        setPaymentMethod(text)

        setShowPaymentSuggestions(true)

    }}
/>

{
showPaymentSuggestions && (

<View style={styles.suggestionContainer}>

        {

        searchedPaymentMethods.map(method => (

            <TouchableOpacity

                key={method}

                style={styles.workerSuggestion}

                onPress={() => {

                    setPaymentMethod(method)

                    setShowPaymentSuggestions(false)

                }}

            >

                <Text style={styles.cardTitle}>

                    {method}

                </Text>

                <Ionicons

                    name="card-outline"

                    size={22}

                    color="#2563EB"

                />

            </TouchableOpacity>

        ))

        }

</View>
)
}
</View>
{
showDatePicker && (

<DateTimePicker
    value={deliveryDate || new Date()}
    mode="date"
    minimumDate={new Date()}
    display="default"
    onChange={onDateChange}
/>

)
}

{
showTimePicker && (

<DateTimePicker
    value={deliveryDate || new Date()}
    mode="time"
    display="default"
    onChange={onTimeChange}
/>

)
}

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
onFocus={closeDropdowns}
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

input: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 14
  },

notes: {
    backgroundColor: "white",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 120,
    textAlignVertical: "top"
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

suggestionContainer: {
    position: "absolute",
    top: 58,
    left: 0,
    right: 0,

    backgroundColor: "#fff",

    borderRadius: 14,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    maxHeight: 220,

    zIndex: 1000,
    elevation: 20,

    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
        width: 0,
        height: 4,
    },
},

suggestionItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6"
  },

  suggestionPrice: {
      fontWeight: "700",
      color: "#2563EB",
      fontSize: 15
  },

  workerSuggestion: {

      flexDirection: "row",

      justifyContent: "space-between",

      alignItems: "center",

      paddingHorizontal: 16,

      paddingVertical: 14,

      borderBottomWidth: 1,

      borderBottomColor: "#F3F4F6"

  },

inputError: {
    borderWidth: 2,
    borderColor: "#EF4444",
},

errorText: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
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

row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

smallLabel:{
fontSize:13,
color:"#6B7280",
marginBottom:6
},

addServiceBtn: {
  flexDirection: "row",
  backgroundColor: "#2563EB",
  borderRadius: 16,
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
  marginTop: 12,
  marginBottom: 20,
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

inputWrapper: {
    position: "relative",
    zIndex: 100,
    marginBottom: 0,
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