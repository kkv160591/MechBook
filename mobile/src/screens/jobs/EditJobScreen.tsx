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
import { useCallback, useMemo, useState, useRef } from "react"
import { useFocusEffect } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"

import { getWorkers } from "../../services/workerService"
import { getServiceTypes } from "../../services/serviceTypesService"
import { updateJob, getJobById } from "../../services/jobService"

import { useTranslation } from "../../context/LanguageContext"

export default function EditJobScreen({ route, navigation }: any) {
  const { t } = useTranslation()
  const { job } = route.params

  const [submitted, setSubmitted] = useState(false)
  const [showWorkerSuggestions, setShowWorkerSuggestions] = useState(false)
  const [showPaymentSuggestions, setShowPaymentSuggestions] = useState(false)

  const scrollRef = useRef<ScrollView>(null)
  const customerNameRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const vehicleNumberRef = useRef<TextInput>(null)
  const vehicleModelRef = useRef<TextInput>(null)

  const customerNameY = useRef(0)
  const phoneY = useRef(0)
  const vehicleNumberY = useRef(0)
  const vehicleModelY = useRef(0)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [workers, setWorkers] = useState<any[]>([])
  const [serviceTypes, setServiceTypes] = useState<any[]>([])

  /* Customer */
  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")

  /* Vehicle */
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [vehicleBrand, setVehicleBrand] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleType, setVehicleType] = useState("2 Wheeler")
  const [odometer, setOdometer] = useState("")
  const [complaint, setComplaint] = useState("")

  /* Job */
  const [workerId, setWorkerId] = useState("")
  const [workerName, setWorkerName] = useState("")

  /* Labor & Discount States */
  const [laborCost, setLaborCost] = useState<string>("")
  const [discount, setDiscount] = useState<string>("")

  const searchedWorkers = useMemo(() => {
    if (!workerName.trim()) return workers
    return workers.filter(worker =>
      (worker.name || "").toLowerCase().includes(workerName.toLowerCase())
    )
  }, [workerName, workers])

  const [priority, setPriority] = useState("Normal")
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [inspectionNotes, setInspectionNotes] = useState("")
  const [notes, setNotes] = useState("")

  /* Services */
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [serviceName, setServiceName] = useState("")
  const [servicePrice, setServicePrice] = useState("")
  const [serviceQty, setServiceQty] = useState("1")
  const [showSuggestions, setShowSuggestions] = useState(false)

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [job.jobId])
  )

  const loadData = async () => {
    try {
      setLoading(true)
      const [workersRes, servicesRes, jobRes] = await Promise.all([
        getWorkers(),
        getServiceTypes(),
        getJobById(job.jobId)
      ])

      const latestJob = jobRes.job
      setWorkers(workersRes.workers || [])
      setServiceTypes(servicesRes.services || [])

      setCustomerName(latestJob.customerName || "")
      setPhone(latestJob.phone || "")
      setCustomerAddress(latestJob.customerAddress || "")
      setVehicleNumber(latestJob.vehicleNumber || "")
      setVehicleBrand(latestJob.vehicleBrand || "")
      setVehicleModel(latestJob.vehicleModel || "")
      setVehicleType(latestJob.vehicleType || "2 Wheeler")
      setOdometer(String(latestJob.odometer || ""))
      setComplaint(latestJob.complaint || "")

      setWorkerId(latestJob.workerId || "")
      const existingWorker = (workersRes.workers || []).find(
        (worker: any) => String(worker.workerId) === String(latestJob.workerId)
      )
      setWorkerName(existingWorker?.name || "")

      setPriority(latestJob.priority || "Normal")
      setDeliveryDate(latestJob.deliveryDate ? new Date(latestJob.deliveryDate) : null)
      setInspectionNotes(latestJob.inspectionNotes || "")
      setNotes(latestJob.notes || "")
      setSelectedServices(latestJob.services || [])

      // Populate initial billing fields
      setLaborCost(latestJob.laborCost !== undefined && latestJob.laborCost !== null ? String(latestJob.laborCost) : "0")
      setDiscount(latestJob.discount !== undefined && latestJob.discount !== null ? String(latestJob.discount) : "0")
    } catch (err: any) {
      Alert.alert(t("jobs.alertErrorTitle"), err?.response?.data?.message || t("jobs.unableToLoadJobDetails"))
    } finally {
      setLoading(false)
    }
  }

  const removeService = (index: number) => {
    setSelectedServices(prev => prev.filter((_, i) => i !== index))
  }

  const closeDropdowns = () => {
    Keyboard.dismiss()
    setShowSuggestions(false)
    setShowWorkerSuggestions(false)
    setShowPaymentSuggestions(false)
  }

  const updateService = (index: number, field: string, value: any) => {
    setSelectedServices(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  /* Billing Calculations */
  const servicesSubtotal = useMemo(() => {
    return selectedServices.reduce((sum, item) => {
      const estimated = Number(item.estimatedPrice || 0)
      const actual = item.actualPrice !== null && item.actualPrice !== undefined && item.actualPrice !== ""
        ? Number(item.actualPrice)
        : estimated
      return sum + actual * Number(item.quantity || 0)
    }, 0)
  }, [selectedServices])

  const parsedLabor = useMemo(() => {
    const val = parseFloat(laborCost)
    return isNaN(val) || val < 0 ? 0 : val
  }, [laborCost])

  const parsedDiscount = useMemo(() => {
    const val = parseFloat(discount)
    return isNaN(val) || val < 0 ? 0 : val
  }, [discount])

  const discountAmount = useMemo(() => {
    const rawTotal = servicesSubtotal + parsedLabor
    return (rawTotal * Math.min(parsedDiscount, 100)) / 100
  }, [servicesSubtotal, parsedLabor, parsedDiscount])

  const grandTotal = useMemo(() => {
    const sub = servicesSubtotal + parsedLabor
    return Math.max(0, sub - discountAmount)
  }, [servicesSubtotal, parsedLabor, discountAmount])

  const searchedServices = useMemo(() => {
    if (!serviceName.trim()) return []
    return serviceTypes.filter(service =>
      (service.name || "").toLowerCase().includes(serviceName.toLowerCase())
    )
  }, [serviceName, serviceTypes])

  const addCurrentService = () => {
    if (!serviceName.trim()) return

    setSelectedServices(prev => [
      ...prev,
      {
        serviceId: null,
        name: serviceName,
        quantity: Number(serviceQty) || 1,
        estimatedPrice: Number(servicePrice) || 0,
        actualPrice: null
      }
    ])

    setServiceName("")
    setServicePrice("")
    setServiceQty("1")
    closeDropdowns()
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (!selectedDate) return

    const current = deliveryDate || new Date()
    current.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    setDeliveryDate(new Date(current))
    setShowTimePicker(true)
  }

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false)
    if (!selectedTime) return

    const current = deliveryDate || new Date()
    current.setHours(selectedTime.getHours(), selectedTime.getMinutes())
    setDeliveryDate(new Date(current))
  }

  const saveChanges = async () => {
    setSubmitted(true)
    const missingFields = []

    const cleanName = customerName.trim()
    const cleanPhone = phone.trim()
    const cleanVehNum = vehicleNumber.trim()
    const cleanVehModel = vehicleModel.trim()

    if (!cleanName) missingFields.push(t("jobs.customerName"))
    if (!cleanPhone || cleanPhone.length !== 10) missingFields.push(t("jobs.valErrPhoneLen"))
    if (!cleanVehNum) missingFields.push(t("jobs.vehicleNumber"))
    if (!cleanVehModel) missingFields.push(t("jobs.vehicleModel"))
    if (selectedServices.length === 0) missingFields.push(t("jobs.atLeastOneService"))

    if (missingFields.length > 0) {
      if (!cleanName) {
        scrollRef.current?.scrollTo({ y: Math.max(0, customerNameY.current - 20), animated: true })
        setTimeout(() => customerNameRef.current?.focus(), 300)
      } else if (!cleanPhone || cleanPhone.length !== 10) {
        scrollRef.current?.scrollTo({ y: Math.max(0, phoneY.current - 20), animated: true })
        setTimeout(() => phoneRef.current?.focus(), 300)
      } else if (!cleanVehNum) {
        scrollRef.current?.scrollTo({ y: Math.max(0, vehicleNumberY.current - 20), animated: true })
        setTimeout(() => vehicleNumberRef.current?.focus(), 300)
      } else if (!cleanVehModel) {
        scrollRef.current?.scrollTo({ y: Math.max(0, vehicleModelY.current - 20), animated: true })
        setTimeout(() => vehicleModelRef.current?.focus(), 300)
      }

      Alert.alert(t("jobs.alertValidationTitle"), t("jobs.alertValidationMsg") + missingFields.join("\n• "))
      return
    }

    try {
      setSaving(true)
      await updateJob(job.jobId, {
        customerName: cleanName,
        phone: cleanPhone,
        customerAddress,
        vehicleNumber: cleanVehNum,
        vehicleBrand,
        vehicleModel: cleanVehModel,
        vehicleType,
        odometer,
        complaint,
        workerId,
        priority,
        deliveryDate: deliveryDate ? deliveryDate.toISOString() : "",
        inspectionNotes,
        notes,
        services: selectedServices,
        laborCost: parsedLabor,
        discount: parsedDiscount,
        totalAmount: grandTotal
      })

      Alert.alert(t("jobs.alertSuccessTitle"), t("jobs.jobUpdatedSuccess"))
      navigation.goBack()
    } catch (err: any) {
      Alert.alert(t("jobs.alertErrorTitle"), err?.response?.data?.message || t("jobs.unableToUpdateJob"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
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
      {text}<Text style={{ color: "#DC2626" }}> *</Text>
    </Text>
  )

  const getPriorityLabel = (p: string) => {
    switch (p) {
      case "Low": return t("jobs.priorityLow")
      case "Normal": return t("jobs.priorityNormal")
      case "High": return t("jobs.priorityHigh")
      default: return p
    }
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={closeDropdowns}
    >
      {/* CUSTOMER */}
      <Text style={styles.heading}>{t("jobs.customerDetails")}</Text>

      <RequiredLabel text={t("jobs.customerName")} />
      <View onLayout={e => (customerNameY.current = e.nativeEvent.layout.y)}>
        <TextInput
          ref={customerNameRef}
          style={[styles.input, submitted && !customerName.trim() && styles.inputError]}
          value={customerName}
          onChangeText={setCustomerName}
          onFocus={closeDropdowns}
        />
        {submitted && !customerName.trim() && (
          <Text style={styles.errorText}>{t("jobs.valErrName")}</Text>
        )}
      </View>

      <RequiredLabel text={t("jobs.phoneNumber")} />
      <View onLayout={e => (phoneY.current = e.nativeEvent.layout.y)}>
        <TextInput
          ref={phoneRef}
          keyboardType="phone-pad"
          maxLength={10}
          style={[
            styles.input,
            submitted && (!phone.trim() || phone.trim().length !== 10) && styles.inputError
          ]}
          value={phone}
          onChangeText={setPhone}
          onFocus={closeDropdowns}
        />
        {submitted && !phone.trim() && (
          <Text style={styles.errorText}>{t("jobs.valErrPhoneReq")}</Text>
        )}
        {submitted && phone.trim().length > 0 && phone.trim().length !== 10 && (
          <Text style={styles.errorText}>{t("jobs.valErrPhoneLen")}</Text>
        )}
      </View>

      <Text style={styles.label}>{t("jobs.customerAddress")}</Text>
      <TextInput
        style={styles.input}
        value={customerAddress}
        onChangeText={setCustomerAddress}
        onFocus={closeDropdowns}
      />

      {/* VEHICLE */}
      <Text style={styles.heading}>{t("jobs.vehicleDetails")}</Text>

      <RequiredLabel text={t("jobs.vehicleNumber")} />
      <View onLayout={e => (vehicleNumberY.current = e.nativeEvent.layout.y)}>
        <TextInput
          ref={vehicleNumberRef}
          style={[styles.input, submitted && !vehicleNumber.trim() && styles.inputError]}
          value={vehicleNumber}
          onChangeText={text => setVehicleNumber(text.toUpperCase())}
          onFocus={closeDropdowns}
        />
        {submitted && !vehicleNumber.trim() && (
          <Text style={styles.errorText}>{t("jobs.valErrVehNum")}</Text>
        )}
      </View>

      <Text style={styles.label}>{t("jobs.vehicleBrand")}</Text>
      <TextInput
        style={styles.input}
        value={vehicleBrand}
        onChangeText={setVehicleBrand}
        onFocus={closeDropdowns}
      />

      <RequiredLabel text={t("jobs.vehicleModel")} />
      <View onLayout={e => (vehicleModelY.current = e.nativeEvent.layout.y)}>
        <TextInput
          ref={vehicleModelRef}
          style={[styles.input, submitted && !vehicleModel.trim() && styles.inputError]}
          value={vehicleModel}
          onChangeText={setVehicleModel}
          onFocus={closeDropdowns}
        />
        {submitted && !vehicleModel.trim() && (
          <Text style={styles.errorText}>{t("jobs.valErrVehModel")}</Text>
        )}
      </View>

      <Text style={styles.label}>{t("jobs.odometer")}</Text>
      <TextInput
        keyboardType="numeric"
        style={styles.input}
        value={odometer}
        onChangeText={setOdometer}
        onFocus={closeDropdowns}
      />

      <RequiredLabel text={t("jobs.vehicleType")} />
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeButton, vehicleType === "2 Wheeler" && styles.selectedType]}
          onPress={() => setVehicleType("2 Wheeler")}
        >
          <Text>🏍 {t("jobs.twoWheeler")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, vehicleType === "4 Wheeler" && styles.selectedType]}
          onPress={() => setVehicleType("4 Wheeler")}
        >
          <Text>🚗 {t("jobs.fourWheeler")}</Text>
        </TouchableOpacity>
      </View>

      {/* WORKER */}
      <Text style={styles.heading}>{t("jobs.assignWorker")}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("jobs.selectWorker")}
          style={styles.input}
          value={workerName}
          onFocus={() => {
            setShowWorkerSuggestions(true)
            setShowSuggestions(false)
            setShowPaymentSuggestions(false)
          }}
          onChangeText={text => {
            setWorkerName(text)
            setShowWorkerSuggestions(true)
          }}
        />

        {showWorkerSuggestions && (
          <View style={styles.suggestionContainer}>
            {searchedWorkers.map(worker => (
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
                  <Text style={styles.cardTitle}>{worker.name}</Text>
                  <Text style={styles.cardSubtitle}>{worker.role}</Text>
                </View>
                <Ionicons name="person-circle" size={26} color="#2563EB" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* JOB DETAILS */}
      <Text style={styles.heading}>{t("jobs.jobDetails")}</Text>
      <Text style={styles.label}>{t("jobs.priority")}</Text>
      <View style={styles.priorityRow}>
        {["Low", "Normal", "High"].map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.priorityButton, priority === item && styles.selectedPriority]}
            onPress={() => setPriority(item)}
          >
            <Text style={{ color: priority === item ? "white" : "#111827", fontWeight: "600" }}>
              {getPriorityLabel(item)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t("jobs.expectedDelivery")}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: deliveryDate ? "#111827" : "#9CA3AF" }}>
          {deliveryDate ? formatDate(deliveryDate) : t("jobs.deliveryDate")}
        </Text>
      </TouchableOpacity>

      {/* SERVICES */}
      <Text style={styles.heading}>{t("jobs.services")}</Text>
      <RequiredLabel text={t("jobs.service")} />
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={serviceName}
          onFocus={() => {
            setShowSuggestions(true)
            setShowWorkerSuggestions(false)
            setShowPaymentSuggestions(false)
          }}
          onChangeText={text => {
            setServiceName(text)
            setShowSuggestions(true)
          }}
        />

        {showSuggestions && searchedServices.length > 0 && (
          <View style={styles.suggestionContainer}>
            {searchedServices.map(service => (
              <TouchableOpacity
                key={service.serviceTypeId}
                style={styles.suggestionItem}
                onPress={() => {
                  setServiceName(service.name)
                  setServicePrice(String(service.defaultPrice))
                  closeDropdowns()
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{service.name}</Text>
                  <Text style={styles.cardSubtitle}>{service.category}</Text>
                </View>
                <Text style={styles.suggestionPrice}>₹ {service.defaultPrice}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.row}>
        <View style={{ flex: 2 }}>
          <Text style={styles.label}>{t("jobs.estimatePrice")}</Text>
          <TextInput
            onFocus={closeDropdowns}
            keyboardType="numeric"
            style={styles.input}
            value={servicePrice}
            onChangeText={setServicePrice}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{t("jobs.quantity")}</Text>
          <TextInput
            onFocus={closeDropdowns}
            keyboardType="numeric"
            style={styles.input}
            value={serviceQty}
            onChangeText={setServiceQty}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.addServiceBtn} onPress={addCurrentService}>
        <Text style={styles.addServiceText}>{t("jobs.addService")}</Text>
      </TouchableOpacity>

      {/* SELECTED SERVICES */}
      <Text style={styles.heading}>{t("jobs.selectedServices")}</Text>

      {selectedServices.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={[styles.emptyText, submitted && { color: "#DC2626", fontWeight: "600" }]}>
            {t("jobs.atLeastOneService")}
          </Text>
        </View>
      ) : (
        selectedServices.map((service, index) => (
          <View key={index} style={styles.selectedServiceCard}>
            <View style={styles.selectedHeader}>
              <Text style={styles.cardTitle}>{service.name}</Text>
              <TouchableOpacity onPress={() => removeService(index)}>
                <Ionicons name="trash-outline" size={22} color="#DC2626" />
              </TouchableOpacity>
            </View>

            <View style={styles.servicePricingRow}>
              <View style={styles.serviceField}>
                <Text style={styles.smallLabel}>{t("jobs.qty")}</Text>
                <TextInput
                  onFocus={closeDropdowns}
                  style={styles.smallInput}
                  keyboardType="numeric"
                  value={String(service.quantity ?? 1)}
                  onChangeText={text => updateService(index, "quantity", text === "" ? "" : Number(text))}
                />
              </View>

              <View style={styles.serviceField}>
                <Text style={styles.smallLabel}>{t("jobs.estimated")}</Text>
                <View style={styles.readOnlyPrice}>
                  <Text style={styles.readOnlyPriceText}>₹ {Number(service.estimatedPrice || 0)}</Text>
                </View>
              </View>

              <View style={styles.serviceField}>
                <Text style={styles.smallLabel}>
                  {t("jobs.actualPrice")} <Text style={styles.optionalText}>({t("jobs.optional")})</Text>
                </Text>
                <TextInput
                  onFocus={closeDropdowns}
                  style={styles.smallInput}
                  keyboardType="numeric"
                  placeholder={t("jobs.useEstimate")}
                  value={
                    service.actualPrice === null || service.actualPrice === undefined
                      ? ""
                      : String(service.actualPrice)
                  }
                  onChangeText={text => updateService(index, "actualPrice", text === "" ? null : Number(text))}
                />
              </View>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalServiceText}>{t("jobs.subtotal")}</Text>
              <Text style={styles.totalServicePrice}>
                ₹{" "}
                {Number(service.quantity || 0) *
                  (service.actualPrice !== null && service.actualPrice !== undefined && service.actualPrice !== ""
                    ? Number(service.actualPrice)
                    : Number(service.estimatedPrice || 0))}
              </Text>
            </View>
          </View>
        ))
      )}

      {/* LABOR & DISCOUNT BILLING SECTION */}
      <Text style={styles.heading}>{t("jobs.laborAndAdditionalCharges")}</Text>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{t("jobs.laborCharge")}</Text>
          <TextInput
            onFocus={closeDropdowns}
            keyboardType="numeric"
            style={styles.input}
            value={laborCost}
            onChangeText={setLaborCost}
            placeholder="0"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{t("jobs.discountPercent")}</Text>
          <TextInput
            onFocus={closeDropdowns}
            keyboardType="numeric"
            style={styles.input}
            value={discount}
            onChangeText={setDiscount}
            placeholder="0"
          />
        </View>
      </View>

      {/* GRAND TOTAL SUMMARY CARD */}
      <View style={styles.totalCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t("jobs.servicesSubtotal")}</Text>
          <Text style={styles.summaryValue}>₹ {servicesSubtotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t("jobs.laborFee")}</Text>
          <Text style={styles.summaryValue}>+ ₹ {parsedLabor}</Text>
        </View>
        {parsedDiscount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("jobs.discountLabel")} ({parsedDiscount}%):</Text>
            <Text style={[styles.summaryValue, { color: "#059669" }]}>
              - ₹ {discountAmount.toFixed(2)}
            </Text>
          </View>
        )}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>{t("jobs.estimatedBill")}</Text>
          <Text style={styles.totalAmount}>₹ {grandTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* COMPLAINT & INSPECTION */}
      <Text style={styles.heading}>{t("jobs.customerComplaint")}</Text>
      <TextInput
        style={styles.notes}
        multiline
        placeholder={t("jobs.customerComplaintPlaceholder")}
        value={complaint}
        onChangeText={setComplaint}
        onFocus={closeDropdowns}
      />

      <Text style={styles.heading}>{t("jobs.inspectionNotes")}</Text>
      <TextInput
        style={styles.notes}
        multiline
        placeholder={t("jobs.inspectionNotesPlaceholder")}
        value={inspectionNotes}
        onChangeText={setInspectionNotes}
        onFocus={closeDropdowns}
      />

      {showDatePicker && (
        <DateTimePicker
          value={deliveryDate || new Date()}
          mode="date"
          minimumDate={new Date()}
          display="default"
          onChange={onDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={deliveryDate || new Date()}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      {/* SAVE */}
      <TouchableOpacity style={styles.saveBtn} onPress={saveChanges} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveText}>{t("jobs.updateJob")}</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 18, fontWeight: "700", color: "#111827", marginTop: 20, marginBottom: 12 },
  label: { fontWeight: "600", marginBottom: 10, color: "#374151" },
  input: { backgroundColor: "white", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 18, marginBottom: 14 },
  notes: { backgroundColor: "white", borderRadius: 18, paddingHorizontal: 16, paddingVertical: 16, minHeight: 120, textAlignVertical: "top" },
  typeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  suggestionContainer: { position: "absolute", top: 58, left: 0, right: 0, backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", maxHeight: 220, zIndex: 1000, elevation: 20, overflow: "hidden" },
  suggestionItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  suggestionPrice: { fontWeight: "700", color: "#2563EB", fontSize: 15 },
  workerSuggestion: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  inputError: { borderWidth: 2, borderColor: "#EF4444" },
  errorText: { color: "#DC2626", fontSize: 13, marginTop: -8, marginBottom: 12, marginLeft: 4 },
  typeButton: { width: "48%", backgroundColor: "white", borderRadius: 16, padding: 15, alignItems: "center" },
  selectedType: { borderWidth: 2, borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  priorityRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  priorityButton: { width: "31%", paddingVertical: 14, borderRadius: 14, backgroundColor: "white", alignItems: "center" },
  selectedPriority: { backgroundColor: "#2563EB" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  cardSubtitle: { color: "#6B7280", marginTop: 4 },
  selectedServiceCard: { backgroundColor: "white", borderRadius: 18, padding: 16, marginBottom: 14 },
  selectedHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  smallLabel: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
  addServiceBtn: { flexDirection: "row", backgroundColor: "#2563EB", borderRadius: 16, justifyContent: "center", alignItems: "center", padding: 16, marginTop: 12, marginBottom: 20 },
  smallInput: { backgroundColor: "#F9FAFB", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 12, textAlign: "center", minHeight: 46, borderWidth: 1, borderColor: "#E5E7EB" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  totalServiceText: { fontWeight: "600", color: "#374151" },
  inputWrapper: { position: "relative", zIndex: 100, marginBottom: 0 },
  totalServicePrice: { fontWeight: "700", fontSize: 16, color: "#16A34A" },
  totalCard: { backgroundColor: "#111827", borderRadius: 18, padding: 20, marginBottom: 20 },
  totalLabel: { color: "#D1D5DB" },
  totalAmount: { color: "white", fontSize: 28, fontWeight: "700", marginTop: 8 },
  addServiceText: { color: "white", fontWeight: "700", marginLeft: 8 },
  emptyCard: { backgroundColor: "white", padding: 24, borderRadius: 18, alignItems: "center" },
  emptyText: { color: "#6B7280" },
  saveBtn: { backgroundColor: "#2563EB", padding: 18, borderRadius: 18, alignItems: "center", marginTop: 10 },
  saveText: { color: "white", fontSize: 16, fontWeight: "700" },
  optionalText: { color: "#9CA3AF", fontWeight: "400" },
  servicePricingRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  serviceField: { flex: 1 },
  readOnlyPrice: { backgroundColor: "#F3F4F6", borderRadius: 12, minHeight: 46, paddingHorizontal: 12, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  readOnlyPriceText: { color: "#374151", fontWeight: "600", fontSize: 14 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 2 },
  summaryLabel: { color: "#94A3B8", fontSize: 14 },
  summaryValue: { color: "white", fontSize: 14, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#334155", marginVertical: 8 },
})