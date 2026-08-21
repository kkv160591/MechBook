import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native"

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
  createJob
} from "../../services/jobService"

import {
  getWorkers
} from "../../services/workerService"

import {
  getServiceTypes
} from "../../services/serviceTypesService"

import {
  getPlanUsage,
  PlanUsageResponse
} from "../../services/subscriptionService"

import DateTimePicker from "@react-native-community/datetimepicker"

export default function AddJobScreen({
  navigation
}: any) {

  const [submitted, setSubmitted] = useState(false)

  const scrollRef = useRef<ScrollView>(null)
  const customerNameRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const vehicleNumberRef = useRef<TextInput>(null)
  const vehicleModelRef = useRef<TextInput>(null)

  const customerNameY = useRef(0)
  const phoneY = useRef(0)
  const vehicleNumberY = useRef(0)
  const vehicleModelY = useRef(0)

  // LOADING
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [planUsageLoading, setPlanUsageLoading] = useState(true)
  const [planUsageError, setPlanUsageError] = useState(false)

  // DATA
  const [workers, setWorkers] = useState<any[]>([])
  const [serviceTypes, setServiceTypes] = useState<any[]>([])
  const [planUsage, setPlanUsage] = useState<PlanUsageResponse | null>(null)

  // CUSTOMER
  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")

  // VEHICLE
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [vehicleBrand, setVehicleBrand] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleType, setVehicleType] = useState("2 Wheeler")
  const [complaint, setComplaint] = useState("")
  const [odometer, setOdometer] = useState("")

  // WORKER
  const [workerId, setWorkerId] = useState("")
  const [workerName, setWorkerName] = useState("")
  const [showWorkerSuggestions, setShowWorkerSuggestions] = useState(false)

  // PAYMENT
  const [showPaymentSuggestions, setShowPaymentSuggestions] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState("Pending")
  const [paymentMethod, setPaymentMethod] = useState("")

  const paymentMethods = [
    "Cash",
    "UPI",
    "Card",
    "Bank Transfer"
  ]

  // JOB
  const [priority, setPriority] = useState("Normal")
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [notes, setNotes] = useState("")
  const [inspectionNotes, setInspectionNotes] = useState("")

  // SERVICES
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [serviceName, setServiceName] = useState("")
  const [servicePrice, setServicePrice] = useState("")
  const [serviceQty, setServiceQty] = useState("1")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const closeDropdowns = () => {
    Keyboard.dismiss()
    setShowSuggestions(false)
    setShowWorkerSuggestions(false)
    setShowPaymentSuggestions(false)
  }

  const searchedPaymentMethods = useMemo(() => {
    if (!paymentMethod.trim()) return paymentMethods
    return paymentMethods.filter(method =>
      method.toLowerCase().includes(paymentMethod.toLowerCase())
    )
  }, [paymentMethod])

  const searchedWorkers = useMemo(() => {
    if (!workerName.trim()) return workers
    return workers.filter(worker =>
      (worker.name || "").toLowerCase().includes(workerName.toLowerCase())
    )
  }, [workerName, workers])

  const searchedServices = useMemo(() => {
    if (!serviceName.trim()) return []
    return serviceTypes.filter(service =>
      (service.name || "").toLowerCase().includes(serviceName.toLowerCase())
    )
  }, [serviceName, serviceTypes])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setPlanUsageLoading(true)
      setPlanUsageError(false)

      const [workersRes, servicesRes, planUsageRes] = await Promise.all([
        getWorkers(),
        getServiceTypes(),
        getPlanUsage()
      ])

      setWorkers(workersRes?.workers || [])
      setServiceTypes(servicesRes?.services || [])
      setPlanUsage(planUsageRes || null)
    } catch (err: any) {
      setPlanUsageError(true)
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Unable to load workers, services or plan information."
      )
    } finally {
      setLoading(false)
      setPlanUsageLoading(false)
    }
  }

  const jobsUsed = Number(planUsage?.jobsUsed ?? 0)
  const jobsLimitRaw = planUsage?.jobsLimit
  const isUnlimited = String(jobsLimitRaw ?? "").toLowerCase() === "unlimited"
  const jobsLimit = isUnlimited ? null : Number(jobsLimitRaw ?? 0)
  const hasReachedJobLimit = !isUnlimited && jobsLimit !== null && jobsUsed >= jobsLimit

  const usagePercentage = isUnlimited
    ? 0
    : jobsLimit !== null && jobsLimit > 0
    ? Math.min(Math.round((jobsUsed / jobsLimit) * 100), 100)
    : 0

  const addService = (service: any) => {
    const exists = selectedServices.find(x => x.serviceId === service.serviceTypeId)
    if (exists) return

    setSelectedServices(prev => [
      ...prev,
      {
        serviceId: service.serviceTypeId,
        name: service.name,
        quantity: 1,
        estimatedPrice: Number(service.defaultPrice) || 0,
        actualPrice: Number(service.defaultPrice) || 0,
      }
    ])
  }

  const removeService = (index: number) => {
    setSelectedServices(prev => prev.filter((_, i) => i !== index))
  }

  const updateService = (index: number, field: string, value: any) => {
    setSelectedServices(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const addCurrentService = () => {
    if (!serviceName.trim()) return

    setSelectedServices(prev => [
      ...prev,
      {
        serviceId: null,
        name: serviceName,
        quantity: Number(serviceQty) || 1,
        estimatedPrice: Number(servicePrice) || 0,
        actualPrice: Number(servicePrice) || 0,
      }
    ])

    setServiceName("")
    setServicePrice("")
    setServiceQty("1")
    closeDropdowns()
  }

  const total = useMemo(() => {
    return selectedServices.reduce((sum, item) => sum + (Number(item.estimatedPrice) * Number(item.quantity)), 0)
  }, [selectedServices])

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

  const saveJob = async () => {
    if (planUsageLoading) {
      Alert.alert("Please wait", "Checking your plan usage...")
      return
    }

    if (planUsageError || !planUsage) {
      Alert.alert("Unable to Verify Plan", "We could not verify your current plan usage. Please try again.")
      return
    }

    if (hasReachedJobLimit) {
      Alert.alert(
        "Job Limit Reached",
        `Your ${planUsage?.planName || "current"} plan allows ${jobsLimit} jobs.\n\nYou have already used ${jobsUsed} jobs.\n\nPlease upgrade your plan to create more jobs.`
      )
      return
    }

    setSubmitted(true)
    const missingFields: string[] = []

    const cleanName = customerName.trim()
    const cleanPhone = phone.trim()
    const cleanVehNum = vehicleNumber.trim()
    const cleanVehModel = vehicleModel.trim()

    if (!cleanName) missingFields.push("Customer Name")
    if (!cleanPhone || cleanPhone.length !== 10) missingFields.push("Valid 10-digit Phone Number")
    if (!cleanVehNum) missingFields.push("Vehicle Number")
    if (!cleanVehModel) missingFields.push("Vehicle Model")
    if (selectedServices.length === 0) missingFields.push("At least one Service")

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

      Alert.alert("Validation Error", "Please correct the following fields:\n• " + missingFields.join("\n• "))
      return
    }

    try {
      setSaving(true)
      await createJob({
        customerName: cleanName,
        phone: cleanPhone,
        customerAddress,
        vehicleNumber: cleanVehNum,
        vehicleModel: cleanVehModel,
        vehicleBrand,
        vehicleType,
        odometer,
        complaint,
        inspectionNotes,
        workerId,
        priority,
        deliveryDate: deliveryDate ? deliveryDate.toISOString() : "",
        paymentStatus,
        paymentMethod,
        notes,
        services: selectedServices
      })

      Alert.alert("Success", "Job Created successfully!")
      navigation.goBack()
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 403) {
        Alert.alert(
          "Job Limit Reached",
          err?.response?.data?.message || "Your garage has reached the job limit for the current plan. Please upgrade your plan."
        )
        try {
          const latestUsage = await getPlanUsage()
          setPlanUsage(latestUsage)
        } catch (refreshError) {
          console.log("Failed to refresh plan usage:", refreshError)
        }
        return
      }

      Alert.alert("Error", err?.response?.data?.message || "Unable to create job. Please try again.")
    } finally {
      setSaving(false)
    }
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

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    )
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={closeDropdowns}
    >
      {/* PLAN USAGE */}
      <View style={styles.planUsageCard}>
        <View style={styles.planUsageHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.planUsageTitle}>
              {planUsage?.planName || planUsage?.planCode || "Current Plan"}
            </Text>
            <Text style={styles.planUsageSubtitle}>Job usage for this garage</Text>
          </View>
          <Text style={[styles.planUsageCount, hasReachedJobLimit && { color: "#DC2626" }]}>
            {isUnlimited ? `${jobsUsed} / Unlimited` : `${jobsUsed} / ${jobsLimit}`}
          </Text>
        </View>

        {!isUnlimited && jobsLimit !== null && (
          <View style={styles.usageBarBackground}>
            <View
              style={[
                styles.usageBar,
                {
                  width: `${usagePercentage}%`,
                  backgroundColor: hasReachedJobLimit
                    ? "#DC2626"
                    : usagePercentage >= 80
                    ? "#F59E0B"
                    : "#2563EB"
                }
              ]}
            />
          </View>
        )}

        {hasReachedJobLimit && (
          <Text style={styles.limitWarning}>
            Job limit reached. Upgrade your plan to create another job.
          </Text>
        )}

        {planUsageError && (
          <Text style={styles.limitWarning}>
            Unable to verify your plan. Please try again.
          </Text>
        )}
      </View>

      {/* CUSTOMER DETAILS */}
      <Text style={styles.heading}>Customer Details</Text>

      <RequiredLabel text="Customer Name" />
      <View onLayout={e => (customerNameY.current = e.nativeEvent.layout.y)}>
        <TextInput
          ref={customerNameRef}
          onFocus={closeDropdowns}
          style={[styles.input, submitted && !customerName.trim() && styles.inputError]}
          value={customerName}
          onChangeText={setCustomerName}
        />
        {submitted && !customerName.trim() && (
          <Text style={styles.errorText}>Customer Name is required.</Text>
        )}
      </View>

      <RequiredLabel text="Phone Number" />
      <View onLayout={e => (phoneY.current = e.nativeEvent.layout.y)}>
        <TextInput
          ref={phoneRef}
          onFocus={closeDropdowns}
          keyboardType="phone-pad"
          maxLength={10}
          style={[
            styles.input,
            submitted && (!phone.trim() || phone.trim().length !== 10) && styles.inputError
          ]}
          value={phone}
          onChangeText={setPhone}
        />
        {submitted && !phone.trim() && (
          <Text style={styles.errorText}>Phone Number is required.</Text>
        )}
        {submitted && phone.trim().length > 0 && phone.trim().length !== 10 && (
          <Text style={styles.errorText}>Phone Number must be exactly 10 digits.</Text>
        )}
      </View>

      <Text style={styles.label}>Customer Address</Text>
      <TextInput
        onFocus={closeDropdowns}
        style={styles.input}
        value={customerAddress}
        onChangeText={setCustomerAddress}
      />

      {/* VEHICLE DETAILS */}
      <Text style={styles.heading}>Vehicle Details</Text>

      <RequiredLabel text="Vehicle Number" />
      <View onLayout={e => (vehicleNumberY.current = e.nativeEvent.layout.y)}>
        <TextInput
          ref={vehicleNumberRef}
          onFocus={closeDropdowns}
          style={[styles.input, submitted && !vehicleNumber.trim() && styles.inputError]}
          value={vehicleNumber}
          onChangeText={text => setVehicleNumber(text.toUpperCase())}
        />
        {submitted && !vehicleNumber.trim() && (
          <Text style={styles.errorText}>Vehicle Number is required.</Text>
        )}
      </View>

      <Text style={styles.label}>Vehicle Brand</Text>
      <TextInput
        onFocus={closeDropdowns}
        style={styles.input}
        value={vehicleBrand}
        onChangeText={setVehicleBrand}
      />

      <RequiredLabel text="Vehicle Model" />
      <View onLayout={e => (vehicleModelY.current = e.nativeEvent.layout.y)}>
        <TextInput
          ref={vehicleModelRef}
          onFocus={closeDropdowns}
          style={[styles.input, submitted && !vehicleModel.trim() && styles.inputError]}
          value={vehicleModel}
          onChangeText={setVehicleModel}
        />
        {submitted && !vehicleModel.trim() && (
          <Text style={styles.errorText}>Vehicle Model is required.</Text>
        )}
      </View>

      <Text style={styles.label}>Current Odometer</Text>
      <TextInput
        onFocus={closeDropdowns}
        keyboardType="numeric"
        maxLength={7}
        style={styles.input}
        value={odometer}
        onChangeText={setOdometer}
      />

      <RequiredLabel text="Vehicle Type" />
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeButton, vehicleType === "2 Wheeler" && styles.selectedType]}
          onPress={() => setVehicleType("2 Wheeler")}
        >
          <Text>🏍 2 Wheeler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, vehicleType === "4 Wheeler" && styles.selectedType]}
          onPress={() => setVehicleType("4 Wheeler")}
        >
          <Text>🚗 4 Wheeler</Text>
        </TouchableOpacity>
      </View>

      {/* WORKER */}
      <Text style={styles.heading}>Worker</Text>
      <Text style={styles.label}>Assign Worker</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Select Worker"
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
      <Text style={styles.heading}>Job Details</Text>
      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityRow}>
        {["Low", "Normal", "High"].map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.priorityButton, priority === item && styles.selectedPriority]}
            onPress={() => setPriority(item)}
          >
            <Text style={{ fontWeight: "600", color: priority === item ? "white" : "#111827" }}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Expected Delivery Date</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: deliveryDate ? "#111827" : "#9CA3AF" }}>
          {deliveryDate ? formatDate(deliveryDate) : "Delivery Date"}
        </Text>
      </TouchableOpacity>

      {/* SERVICES */}
      <Text style={styles.heading}>Services</Text>
      <RequiredLabel text="Service" />
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
          <Text style={styles.label}>Estimate Price</Text>
          <TextInput
            onFocus={closeDropdowns}
            keyboardType="numeric"
            style={styles.input}
            value={servicePrice}
            onChangeText={setServicePrice}
            placeholder="Enter estimate"
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

      <TouchableOpacity style={styles.addServiceBtn} onPress={addCurrentService}>
        <Text style={styles.addServiceText}>Add Service</Text>
      </TouchableOpacity>

      {/* SELECTED SERVICES */}
      <Text style={styles.heading}>Selected Services</Text>

      {selectedServices.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={[styles.emptyText, submitted && { color: "#DC2626", fontWeight: "600" }]}>
            At least one service is required.
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

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.smallLabel}>Quantity</Text>
                <TextInput
                  onFocus={closeDropdowns}
                  style={styles.smallInput}
                  keyboardType="numeric"
                  value={String(service.quantity)}
                  onChangeText={text => updateService(index, "quantity", Number(text) || 1)}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.smallLabel}>Estimate Price</Text>
                <TextInput
                  onFocus={closeDropdowns}
                  style={styles.smallInput}
                  keyboardType="numeric"
                  value={String(service.estimatedPrice)}
                  onChangeText={text => updateService(index, "estimatedPrice", Number(text) || 0)}
                />
              </View>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalServiceText}>Subtotal</Text>
              <Text style={styles.totalServicePrice}>
                ₹ {Number(service.quantity) * Number(service.estimatedPrice)}
              </Text>
            </View>
          </View>
        ))
      )}

      {/* GRAND TOTAL */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Estimated Bill</Text>
        <Text style={styles.totalAmount}>₹ {total}</Text>
      </View>

      {/* NOTES & COMPLAINTS */}
      <Text style={styles.heading}>Customer Complaint</Text>
      <TextInput
        onFocus={closeDropdowns}
        multiline
        style={styles.notes}
        value={complaint}
        onChangeText={setComplaint}
      />

      <Text style={styles.heading}>Inspection Notes</Text>
      <TextInput
        onFocus={closeDropdowns}
        multiline
        style={styles.notes}
        value={inspectionNotes}
        onChangeText={setInspectionNotes}
      />

      {/* PAYMENT STATUS */}
      <Text style={styles.heading}>Payment Status</Text>
      <View style={styles.priorityRow}>
        {["Pending", "Advance", "Paid"].map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.priorityButton, paymentStatus === item && styles.selectedPriority]}
            onPress={() => setPaymentStatus(item)}
          >
            <Text style={{ color: paymentStatus === item ? "white" : "#111827" }}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Payment Method</Text>
        <TextInput
          placeholder="Select Payment Method"
          style={styles.input}
          value={paymentMethod}
          onFocus={() => {
            setShowPaymentSuggestions(true)
            setShowSuggestions(false)
            setShowWorkerSuggestions(false)
          }}
          onChangeText={text => {
            setPaymentMethod(text)
            setShowPaymentSuggestions(true)
          }}
        />

        {showPaymentSuggestions && (
          <View style={styles.suggestionContainer}>
            {searchedPaymentMethods.map(method => (
              <TouchableOpacity
                key={method}
                style={styles.workerSuggestion}
                onPress={() => {
                  setPaymentMethod(method)
                  setShowPaymentSuggestions(false)
                }}
              >
                <Text style={styles.cardTitle}>{method}</Text>
                <Ionicons name="card-outline" size={22} color="#2563EB" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* DATE & TIME PICKERS */}
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

      {/* CREATE JOB BUTTON */}
      <TouchableOpacity
        style={[
          styles.saveBtn,
          (hasReachedJobLimit || planUsageError) && { backgroundColor: "#9CA3AF" }
        ]}
        disabled={saving || planUsageLoading || hasReachedJobLimit || planUsageError}
        onPress={saveJob}
      >
        {saving || planUsageLoading ? (
          <ActivityIndicator color="white" />
        ) : hasReachedJobLimit ? (
          <Text style={styles.saveText}>Job Limit Reached</Text>
        ) : planUsageError ? (
          <Text style={styles.saveText}>Unable to Verify Plan</Text>
        ) : (
          <Text style={styles.saveText}>Create Job</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  planUsageCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  planUsageHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planUsageTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  planUsageSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 3 },
  planUsageCount: { fontSize: 16, fontWeight: "700", color: "#2563EB" },
  usageBarBackground: { height: 7, backgroundColor: "#E5E7EB", borderRadius: 10, overflow: "hidden", marginTop: 14 },
  usageBar: { height: "100%", borderRadius: 10 },
  limitWarning: { color: "#DC2626", fontSize: 12, fontWeight: "600", marginTop: 10, lineHeight: 18 },
  heading: { fontSize: 18, fontWeight: "700", color: "#111827", marginTop: 20, marginBottom: 12 },
  label: { fontWeight: "600", color: "#374151", marginBottom: 10 },
  input: { backgroundColor: "white", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 18, marginBottom: 14 },
  notes: { backgroundColor: "white", borderRadius: 18, paddingHorizontal: 16, paddingVertical: 16, minHeight: 120, textAlignVertical: "top" },
  typeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  typeButton: { width: "48%", backgroundColor: "white", borderRadius: 16, padding: 15, alignItems: "center" },
  selectedType: { borderWidth: 2, borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  priorityRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  priorityButton: { width: "31%", backgroundColor: "white", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  selectedPriority: { backgroundColor: "#2563EB" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  cardSubtitle: { color: "#6B7280", marginTop: 4 },
  addServiceBtn: { flexDirection: "row", backgroundColor: "#2563EB", borderRadius: 16, justifyContent: "center", alignItems: "center", padding: 16, marginTop: 12, marginBottom: 20 },
  addServiceText: { color: "white", fontWeight: "700", marginLeft: 8 },
  selectedServiceCard: { backgroundColor: "white", borderRadius: 18, padding: 16, marginBottom: 14 },
  selectedHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  smallLabel: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
  smallInput: { backgroundColor: "#F9FAFB", borderRadius: 12, padding: 12, textAlign: "center" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  totalServiceText: { fontWeight: "600", color: "#374151" },
  totalServicePrice: { fontWeight: "700", color: "#16A34A", fontSize: 16 },
  totalCard: { backgroundColor: "#111827", borderRadius: 18, padding: 20, marginTop: 8, marginBottom: 20 },
  totalLabel: { color: "#D1D5DB", fontSize: 15 },
  totalAmount: { color: "white", fontSize: 28, fontWeight: "700", marginTop: 8 },
  emptyCard: { backgroundColor: "white", padding: 24, borderRadius: 18, alignItems: "center" },
  emptyText: { color: "#6B7280" },
  saveBtn: { backgroundColor: "#2563EB", padding: 18, borderRadius: 18, alignItems: "center", marginTop: 10 },
  saveText: { color: "white", fontWeight: "700", fontSize: 16 },
  suggestionContainer: { position: "absolute", top: 58, left: 0, right: 0, backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", maxHeight: 220, zIndex: 1000, elevation: 20, overflow: "hidden" },
  suggestionItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  suggestionPrice: { fontWeight: "700", color: "#2563EB", fontSize: 15 },
  workerSuggestion: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  inputWrapper: { position: "relative", zIndex: 100, marginBottom: 0 },
  inputError: { borderWidth: 2, borderColor: "#EF4444" },
  errorText: { color: "#DC2626", fontSize: 13, marginTop: -8, marginBottom: 12, marginLeft: 4 }
})