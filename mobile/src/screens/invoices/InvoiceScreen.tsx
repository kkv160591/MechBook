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

import { getGarageProfile } from "../../services/garageService"

import { getWorkers } from "../../services/workerService"

import {
  getGSTSettings,
  getInvoiceSettings
} from "../../services/settingsService"

export default function InvoiceScreen() {
  const route = useRoute<any>()
  const { jobId } = route.params

  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<any>(null)
  const [garage, setGarage] = useState<any>(null)
  const [gstSettings, setGSTSettings] = useState<any>(null)
  const [invoiceSettings, setInvoiceSettings] = useState<any>(null)
  const [workers, setWorkers] = useState<any[]>([])

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      const [jobRes, garageRes, gst, invoice, workersRes] = await Promise.all([
        getJobById(jobId),
        getGarageProfile(),
        getGSTSettings(),
        getInvoiceSettings(),
        getWorkers(),
      ])

      setJob(jobRes.job)
      setGarage(garageRes.garage)
      setGSTSettings(gst)
      setInvoiceSettings(invoice)
      setWorkers(workersRes.workers || [])
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  // Find worker details matching JobDetailScreen logic
  const assignedWorker = useMemo(() => {
    if (!job?.workerId || !workers.length) return null
    return workers.find(
      (worker: any) => String(worker.workerId) === String(job.workerId)
    )
  }, [job, workers])

  // 1. Calculate Services/Parts Subtotal (Matching JobDetailScreen logic)
  const partsTotal = useMemo(() => {
    if (!job?.services) return 0
    return job.services.reduce((sum: number, item: any) => {
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
  }, [job])

  // 2. Labor Cost (Property: laborCost)
  const laborFee = Number(job?.laborCost ?? invoiceSettings?.defaultLaborCost ?? 0)

  // 3. Raw Subtotal before Discount & GST
  const subTotal = partsTotal + laborFee

  // 4. Discount Calculation
  const discountType = job?.discountType || invoiceSettings?.defaultDiscountType || "percentage"
  const rawDiscountValue = Number(job?.discount ?? invoiceSettings?.defaultDiscount ?? 0)

  const discountAmount = useMemo(() => {
    if (discountType === "percentage") {
      return (subTotal * Math.min(rawDiscountValue, 100)) / 100
    }
    return Math.min(rawDiscountValue, subTotal)
  }, [subTotal, discountType, rawDiscountValue])

  // 5. Taxable Base & GST Calculations
  const taxableAmount = Math.max(0, subTotal - discountAmount)
  const gstPercent = gstSettings?.enabled ? Number(gstSettings.defaultRate || 0) : 0
  const gstAmount = (taxableAmount * gstPercent) / 100

  // 6. Final Bill & Rounding
  const rawGrandTotal = taxableAmount + gstAmount
  const grandTotal = Math.round(rawGrandTotal)
  const roundOff = grandTotal - rawGrandTotal

  if (loading || !garage || !gstSettings || !invoiceSettings || !job) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* GARAGE HEADER */}
      <View style={styles.header}>
        {invoiceSettings.showGarageLogo && (
          <View style={styles.logoContainer}>
            {garage.logo ? (
              <Image source={{ uri: garage.logo }} style={styles.logo} />
            ) : (
              <MaterialCommunityIcons name="garage" size={50} color="#2563EB" />
            )}
          </View>
        )}

        <Text style={styles.garageName}>{garage.garageName}</Text>
        <Text style={styles.garageSubtitle}>Owner : {garage.ownerName}</Text>

        {invoiceSettings.showGarageAddress && (
          <>
            <Text style={styles.garageAddress}>
              {garage.address} {garage.city}, {garage.state} {garage.pincode}
            </Text>
            <Text style={styles.garagePhone}>{garage.phone}</Text>
          </>
        )}

        {invoiceSettings.showGSTNumber && gstSettings.enabled && (
          <Text style={styles.gst}>GSTIN : {gstSettings.gstNumber}</Text>
        )}

        <View style={styles.invoiceStrip}>
          <View>
            <Text style={styles.invoiceLabel}>Invoice No</Text>
            <Text style={styles.invoiceValue}>
              INV-{(job._id || job.jobId || "").slice(0, 8).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>Invoice Date</Text>
            <Text style={styles.invoiceValue}>
              {new Date(job.createdAt || Date.now()).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* CUSTOMER */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Customer Details</Text>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color="#2563EB" />
          <Text style={styles.infoText}>{job.customerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color="#2563EB" />
          <Text style={styles.infoText}>{job.phone}</Text>
        </View>
        {invoiceSettings.showCustomerAddress && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#2563EB" />
            <Text style={styles.infoText}>{job.customerAddress || "-"}</Text>
          </View>
        )}
      </View>

      {/* VEHICLE DETAILS */}
      {invoiceSettings.showVehicleDetails && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vehicle Details</Text>
          <View style={styles.vehicleHeader}>
            <MaterialCommunityIcons
              name={job.vehicleType === "2 Wheeler" ? "motorbike" : "car"}
              size={42}
              color="#2563EB"
            />
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.vehicleNumber}>{job.vehicleNumber}</Text>
              <Text style={styles.vehicleModel}>
                {job.vehicleBrand} {job.vehicleModel}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Vehicle Type</Text>
              <Text style={styles.value}>{job.vehicleType || "-"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Odometer</Text>
              <Text style={styles.value}>
                {job.odometer ? `${job.odometer} KM` : "-"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Assigned Worker</Text>
              <Text style={styles.value}>
                {job.workerName || assignedWorker?.name || "-"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Priority</Text>
              <Text style={styles.value}>{job.priority || "Normal"}</Text>
            </View>
          </View>
        </View>
      )}

      {/* JOB INFORMATION */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Job Information</Text>
        <Text style={styles.sectionLabel}>Complaint</Text>
        <Text style={styles.description}>{job.complaint || "-"}</Text>

        <View style={{ height: 12 }} />

        <Text style={styles.sectionLabel}>Inspection Notes</Text>
        <Text style={styles.description}>{job.inspectionNotes || "-"}</Text>

        {job.deliveryDate && (
          <>
            <View style={{ height: 12 }} />
            <Text style={styles.sectionLabel}>Estimated Delivery</Text>
            <Text style={styles.description}>
              {new Date(job.deliveryDate).toLocaleString()}
            </Text>
          </>
        )}
      </View>

      {/* SERVICES PERFORMED */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Services Performed</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, { flex: 3, fontWeight: "700" }]}>Service</Text>
          <Text style={styles.tableCell}>Qty</Text>
          <Text style={styles.tableCell}>Rate</Text>
          <Text style={styles.tableCell}>Amount</Text>
        </View>

        {(job.services || []).map((service: any, index: number) => {
          const quantity = Number(service.quantity || 0)
          const estimatedPrice = Number(service.estimatedPrice || 0)
          const actualPrice =
            service.actualPrice !== null &&
            service.actualPrice !== undefined &&
            service.actualPrice !== ""
              ? Number(service.actualPrice)
              : estimatedPrice
          const itemTotal = quantity * actualPrice

          return (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>{service.name}</Text>
              <Text style={styles.tableCell}>{quantity}</Text>
              <Text style={styles.tableCell}>₹{actualPrice}</Text>
              <Text style={styles.tableCell}>₹{itemTotal.toFixed(2)}</Text>
            </View>
          )
        })}
      </View>

      {/* BILL SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bill Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Services Subtotal</Text>
          <Text style={styles.summaryValue}>₹{partsTotal.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Labor Fee</Text>
          <Text style={styles.summaryValue}>+ ₹{laborFee.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{subTotal.toFixed(2)}</Text>
        </View>

        {discountAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Discount {discountType === "percentage" ? `(${rawDiscountValue}%)` : "(Fixed)"}
            </Text>
            <Text style={[styles.summaryValue, { color: "#059669" }]}>
              - ₹{discountAmount.toFixed(2)}
            </Text>
          </View>
        )}

        {gstSettings.enabled && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST ({gstPercent}%)</Text>
            <Text style={styles.summaryValue}>+ ₹{gstAmount.toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Round Off</Text>
          <Text style={styles.summaryValue}>₹{roundOff.toFixed(2)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.grandLabel}>Grand Total</Text>
          <Text style={styles.grandValue}>₹{grandTotal}</Text>
        </View>
      </View>

      {/* WARRANTY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Warranty Terms</Text>
        <Text style={styles.description}>
          {invoiceSettings.defaultWarranty || "• Genuine spare warranty depends on manufacturer terms."}
        </Text>
      </View>

      {/* TERMS & CONDITIONS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Terms & Conditions</Text>
        <Text style={styles.description}>
          {invoiceSettings.terms || "• Please inspect your vehicle before taking delivery."}
        </Text>
      </View>

      {/* FOOTER NOTE */}
      {invoiceSettings.footerNote ? (
        <View style={styles.card}>
          <Text style={{ textAlign: "center", color: "#6B7280" }}>
            {invoiceSettings.footerNote}
          </Text>
        </View>
      ) : null}

      {/* SIGNATURES */}
      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ alignItems: "center" }}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Customer Signature</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Authorized Signatory</Text>
          </View>
        </View>
      </View>

      {/* ACTIONS */}
      <TouchableOpacity
        disabled={job.status !== "completed"}
        style={[
          styles.primaryButton,
          job.status !== "completed" && styles.disabledButton,
        ]}
      >
        <Ionicons name="document-text-outline" size={22} color="white" />
        <Text style={styles.primaryButtonText}>Generate PDF Invoice</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton}>
        <Ionicons name="share-social-outline" size={22} color="#2563EB" />
        <Text style={styles.secondaryButtonText}>Share Invoice</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton}>
        <Ionicons name="print-outline" size={22} color="#2563EB" />
        <Text style={styles.secondaryButtonText}>Print Invoice</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
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