import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from "react-native"

import {
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons"

import { useEffect, useMemo, useState } from "react"

import { useRoute } from "@react-navigation/native"

import { getJobById } from "../../services/jobService"

export default function InvoiceScreen() {

  const route = useRoute<any>()

  const { jobId } = route.params

  const [loading, setLoading] = useState(true)

  const [job, setJob] = useState<any>(null)

  useEffect(() => {

    loadJob()

  }, [])

  const loadJob = async () => {

    try {

      const response = await getJobById(jobId)

      setJob(response.job)

    }

    catch (err) {

      console.log(err)

    }

    finally {

      setLoading(false)

    }

  }

  const partsTotal = useMemo(() => {

    if (!job) return 0

    return job.services.reduce(

      (sum: number, item: any) =>

        sum +

        Number(item.actualPrice || 0) *

        Number(item.quantity || 1),

      0

    )

  }, [job])

  const labourCharge = job?.labourCharge || 0

  const discount = job?.discount || 0

  const gstPercent = job?.gstPercent || 0

  const subTotal = partsTotal + labourCharge

  const gstAmount =
    (subTotal - discount) *
    gstPercent / 100

  const roundOff =
    Math.round(subTotal - discount + gstAmount) -
    (subTotal - discount + gstAmount)

  const grandTotal =
    Math.round(
      subTotal -
      discount +
      gstAmount
    )

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

{/* GARAGE HEADER */}

<View style={styles.header}>

<View style={styles.logoContainer}>

<MaterialCommunityIcons
  name="garage"
  size={50}
  color="#2563EB"
/>

</View>

<Text style={styles.garageName}>
My Garage
</Text>

<Text style={styles.garageSubtitle}>
Complete Car & Bike Care
</Text>

<Text style={styles.garageAddress}>
123 MG Road, Raipur, Chhattisgarh
</Text>

<Text style={styles.garagePhone}>
+91 9876543210
</Text>

<Text style={styles.gst}>
GSTIN : 22ABCDE1234F1Z5
</Text>

<View style={styles.invoiceStrip}>

<View>

<Text style={styles.invoiceLabel}>
Invoice No
</Text>

<Text style={styles.invoiceValue}>
INV-{job.jobId.slice(0,8).toUpperCase()}
</Text>

</View>

<View>

<Text style={styles.invoiceLabel}>
Invoice Date
</Text>

<Text style={styles.invoiceValue}>
{new Date(job.createdAt).toLocaleDateString()}
</Text>

</View>

</View>

</View>

{/* CUSTOMER */}

<View style={styles.card}>

<Text style={styles.cardTitle}>
Customer Details
</Text>

<View style={styles.infoRow}>

<Ionicons
name="person-outline"
size={18}
color="#2563EB"
/>

<Text style={styles.infoText}>
{job.customerName}
</Text>

</View>

<View style={styles.infoRow}>

<Ionicons
name="call-outline"
size={18}
color="#2563EB"
/>

<Text style={styles.infoText}>
{job.phone}
</Text>

</View>

<View style={styles.infoRow}>

<Ionicons
name="location-outline"
size={18}
color="#2563EB"
/>

<Text style={styles.infoText}>
{job.customerAddress || "-"}
</Text>

</View>

</View>

{/* VEHICLE */}

<View style={styles.card}>

<Text style={styles.cardTitle}>
Vehicle Details
</Text>

<View style={styles.vehicleHeader}>

<MaterialCommunityIcons

name={
job.vehicleType === "2 Wheeler"
?
"motorbike"
:
"car"
}

size={42}

color="#2563EB"

/>

<View style={{marginLeft:15}}>

<Text style={styles.vehicleNumber}>
{job.vehicleNumber}
</Text>

<Text style={styles.vehicleModel}>
{job.vehicleBrand} {job.vehicleModel}
</Text>

</View>

</View>

<View style={styles.divider}/>

<View style={styles.grid}>

<View style={styles.gridItem}>

<Text style={styles.label}>
Vehicle Type
</Text>

<Text style={styles.value}>
{job.vehicleType}
</Text>

</View>

<View style={styles.gridItem}>

<Text style={styles.label}>
Odometer
</Text>

<Text style={styles.value}>
{job.odometer || "-"} KM
</Text>

</View>

<View style={styles.gridItem}>

<Text style={styles.label}>
Assigned Worker
</Text>

<Text style={styles.value}>
{job.workerName || "-"}
</Text>

</View>

<View style={styles.gridItem}>

<Text style={styles.label}>
Priority
</Text>

<Text style={styles.value}>
{job.priority || "Normal"}
</Text>

</View>

</View>

</View>

{/* JOB DETAILS */}

<View style={styles.card}>

<Text style={styles.cardTitle}>
Job Information
</Text>

<Text style={styles.sectionLabel}>
Complaint
</Text>

<Text style={styles.description}>
{job.complaint || "-"}
</Text>

<View style={{height:15}}/>

<Text style={styles.sectionLabel}>
Inspection Notes
</Text>

<Text style={styles.description}>
{job.inspectionNotes || "-"}
</Text>

</View>

<View style={styles.card}>

<Text style={styles.cardTitle}>
Services Performed
</Text>

{/* TABLE HEADER */}

<View style={styles.tableHeader}>

<Text style={[styles.tableCell,{flex:3,fontWeight:"700"}]}>
Service
</Text>

<Text style={styles.tableCell}>
Qty
</Text>

<Text style={styles.tableCell}>
Rate
</Text>

<Text style={styles.tableCell}>
Amount
</Text>

</View>

{

job.services.map((service:any,index:number)=>(

<View
key={index}
style={styles.tableRow}
>

<Text
style={[
styles.tableCell,
{flex:3}
]}
>

{service.name}

</Text>

<Text style={styles.tableCell}>

{service.quantity}

</Text>

<Text style={styles.tableCell}>

₹{service.actualPrice}

</Text>

<Text style={styles.tableCell}>

₹{service.quantity * service.actualPrice}

</Text>

</View>

))

}

</View>

{/* BILL SUMMARY */}

<View style={styles.card}>

<Text style={styles.cardTitle}>
Bill Summary
</Text>

<View style={styles.summaryRow}>

<Text style={styles.summaryLabel}>
Parts Total
</Text>

<Text style={styles.summaryValue}>
₹{partsTotal}
</Text>

</View>

<View style={styles.summaryRow}>

<Text style={styles.summaryLabel}>
Labour Charge
</Text>

<Text style={styles.summaryValue}>
₹{labourCharge}
</Text>

</View>

<View style={styles.summaryRow}>

<Text style={styles.summaryLabel}>
Subtotal
</Text>

<Text style={styles.summaryValue}>
₹{subTotal}
</Text>

</View>

<View style={styles.summaryRow}>

<Text style={styles.summaryLabel}>
Discount
</Text>

<Text style={styles.summaryValue}>
- ₹{discount}
</Text>

</View>

<View style={styles.summaryRow}>

<Text style={styles.summaryLabel}>
GST ({gstPercent}%)
</Text>

<Text style={styles.summaryValue}>
₹{gstAmount.toFixed(2)}
</Text>

</View>

<View style={styles.summaryRow}>

<Text style={styles.summaryLabel}>
Round Off
</Text>

<Text style={styles.summaryValue}>
₹{roundOff.toFixed(2)}
</Text>

</View>

<View style={styles.divider}/>

<View style={styles.summaryRow}>

<Text style={styles.grandLabel}>
Grand Total
</Text>

<Text style={styles.grandValue}>
₹{grandTotal}
</Text>

</View>

</View>

{/* PAYMENT */}

<View style={styles.card}>

<Text style={styles.cardTitle}>
Payment Details
</Text>

<View style={styles.infoRow}>

<Ionicons
name="wallet-outline"
size={18}
color="#2563EB"
/>

<Text style={styles.infoText}>
Status : {job.paymentStatus || "Pending"}
</Text>

</View>

<View style={styles.infoRow}>

<Ionicons
name="card-outline"
size={18}
color="#2563EB"
/>

<Text style={styles.infoText}>
Method : {job.paymentMethod || "-"}
</Text>

</View>

<View style={styles.infoRow}>

<Ionicons
name="cash-outline"
size={18}
color="#2563EB"
/>

<Text style={styles.infoText}>
Amount Paid : ₹{job.amountPaid || 0}
</Text>

</View>

<View style={styles.infoRow}>

<Ionicons
name="cash"
size={18}
color="#DC2626"
/>

<Text
style={{
fontWeight:"700",
color:"#DC2626",
marginLeft:10
}}
>

Balance :
₹{grandTotal-(job.amountPaid||0)}

</Text>

</View>

</View>

{/* WARRANTY */}

<View style={styles.card}>

<Text style={styles.cardTitle}>
Warranty
</Text>

<Text style={styles.description}>

• Labour warranty : 30 Days

</Text>

<Text style={styles.description}>

• Genuine spare warranty depends on manufacturer.

</Text>

<Text style={styles.description}>

• Warranty void if vehicle is repaired elsewhere.

</Text>

</View>

{/* TERMS */}

<View style={styles.card}>

<Text style={styles.cardTitle}>
Terms & Conditions
</Text>

<Text style={styles.description}>

• Goods once sold will not be taken back.

</Text>

<Text style={styles.description}>

• Please verify your vehicle before delivery.

</Text>

<Text style={styles.description}>

• Garage is not responsible for valuables left inside vehicle.

</Text>

<Text style={styles.description}>

• Thank you for choosing our garage.

</Text>

</View>

{/* SIGNATURES */}

<View style={styles.card}>

<View
style={{
flexDirection:"row",
justifyContent:"space-between"
}}
>

<View style={{alignItems:"center"}}>

<View style={styles.signatureLine}/>

<Text style={styles.signatureText}>
Customer Signature
</Text>

</View>

<View style={{alignItems:"center"}}>

<View style={styles.signatureLine}/>

<Text style={styles.signatureText}>
Authorized Signatory
</Text>

</View>

</View>

</View>

{/* ACTION BUTTONS */}

<TouchableOpacity

disabled={job.status !== "completed"}

style={[

styles.primaryButton,

job.status !== "completed" &&

styles.disabledButton

]}

>

<Ionicons

name="document-text-outline"

size={22}

color="white"

/>

<Text style={styles.primaryButtonText}>

Generate PDF Invoice

</Text>

</TouchableOpacity>

<TouchableOpacity
style={styles.secondaryButton}
>

<Ionicons
name="share-social-outline"
size={22}
color="#2563EB"
/>

<Text style={styles.secondaryButtonText}>
Share Invoice
</Text>

</TouchableOpacity>

<TouchableOpacity
style={styles.secondaryButton}
>

<Ionicons
name="print-outline"
size={22}
color="#2563EB"
/>

<Text style={styles.secondaryButtonText}>
Print Invoice
</Text>

</TouchableOpacity>

<View style={{height:40}}/>

</ScrollView>

)

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F3F4F6"
},

loader:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

/* HEADER */

header:{
backgroundColor:"white",
paddingVertical:28,
paddingHorizontal:20,
alignItems:"center",
marginBottom:16,
borderBottomLeftRadius:22,
borderBottomRightRadius:22,
elevation:2
},

logoContainer:{
width:90,
height:90,
borderRadius:45,
backgroundColor:"#EFF6FF",
justifyContent:"center",
alignItems:"center",
marginBottom:15
},

logo:{
width:65,
height:65
},

garageName:{
fontSize:24,
fontWeight:"700",
color:"#111827"
},

garageSubtitle:{
marginTop:4,
fontSize:15,
color:"#374151"
},

garageAddress:{
marginTop:10,
color:"#6B7280",
textAlign:"center"
},

garagePhone:{
marginTop:4,
color:"#6B7280"
},

gst:{
marginTop:6,
fontWeight:"600",
color:"#111827"
},

invoiceStrip:{
marginTop:22,
paddingTop:18,
borderTopWidth:1,
borderColor:"#E5E7EB",
width:"100%",
flexDirection:"row",
justifyContent:"space-between"
},

invoiceLabel:{
fontSize:12,
color:"#6B7280"
},

invoiceValue:{
marginTop:4,
fontWeight:"700",
fontSize:15,
color:"#111827"
},

/* CARD */

card:{
backgroundColor:"white",
marginHorizontal:16,
marginBottom:16,
borderRadius:20,
padding:18,
elevation:2
},

cardTitle:{
fontSize:18,
fontWeight:"700",
marginBottom:16,
color:"#111827"
},

/* COMMON */

infoRow:{
flexDirection:"row",
alignItems:"center",
marginBottom:12
},

infoText:{
marginLeft:10,
flex:1,
fontSize:15,
color:"#374151"
},

divider:{
height:1,
backgroundColor:"#E5E7EB",
marginVertical:18
},

/* VEHICLE */

vehicleHeader:{
flexDirection:"row",
alignItems:"center"
},

vehicleNumber:{
fontSize:20,
fontWeight:"700",
color:"#111827"
},

vehicleModel:{
marginTop:4,
color:"#6B7280"
},

grid:{
flexDirection:"row",
flexWrap:"wrap",
justifyContent:"space-between"
},

gridItem:{
width:"48%",
marginBottom:16
},

label:{
fontSize:12,
color:"#6B7280",
marginBottom:6
},

value:{
fontWeight:"600",
fontSize:15,
color:"#111827"
},

sectionLabel:{
fontWeight:"700",
fontSize:15,
marginBottom:8,
color:"#111827"
},

description:{
fontSize:14,
lineHeight:24,
color:"#4B5563"
},

/* TABLE */

tableHeader:{
flexDirection:"row",
paddingBottom:12,
borderBottomWidth:1,
borderBottomColor:"#E5E7EB"
},

tableRow:{
flexDirection:"row",
paddingVertical:14,
borderBottomWidth:1,
borderBottomColor:"#F3F4F6"
},

tableCell:{
flex:1,
fontSize:13,
color:"#374151",
textAlign:"center"
},

/* SUMMARY */

summaryRow:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginBottom:14
},

summaryLabel:{
fontSize:15,
color:"#374151"
},

summaryValue:{
fontSize:15,
fontWeight:"600",
color:"#111827"
},

grandLabel:{
fontSize:21,
fontWeight:"700",
color:"#111827"
},

grandValue:{
fontSize:28,
fontWeight:"700",
color:"#16A34A"
},

/* SIGNATURE */

signatureLine:{
width:120,
borderBottomWidth:1.5,
borderBottomColor:"#9CA3AF",
marginBottom:8,
marginTop:40
},

signatureText:{
fontSize:13,
color:"#6B7280"
},

/* BUTTONS */

primaryButton:{
backgroundColor:"#2563EB",
marginHorizontal:16,
marginBottom:12,
paddingVertical:18,
borderRadius:18,
alignItems:"center",
justifyContent:"center",
flexDirection:"row",
elevation:2
},

primaryButtonText:{
marginLeft:10,
color:"white",
fontWeight:"700",
fontSize:16
},

secondaryButton:{
backgroundColor:"white",
marginHorizontal:16,
marginBottom:12,
paddingVertical:18,
borderRadius:18,
alignItems:"center",
justifyContent:"center",
flexDirection:"row",
borderWidth:1,
borderColor:"#E5E7EB"
},

secondaryButtonText:{
marginLeft:10,
fontSize:16,
fontWeight:"700",
color:"#2563EB"
},

disabledButton:{
backgroundColor:"#9CA3AF"
}

})