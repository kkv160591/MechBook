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

import { useSettings } from "../../context/SettingsContext"
import { useTranslation } from "../../context/LanguageContext"
import DateTimePicker from "@react-native-community/datetimepicker"

export default function AddJobScreen({ navigation }: any) {
  const [submitted, setSubmitted] = useState(false)
  const { settings } = useSettings()
  const { t } = useTranslation();

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
  const [vehicleType, setVehicleType] = useState(t("jobs.twoWheeler"))
  const [complaint, setComplaint] = useState("")
  const [odometer, setOdometer] = useState("")

  // WORKER
  const [workerId, setWorkerId] = useState("")
  const [workerName, setWorkerName] = useState("")
  const [showWorkerSuggestions, setShowWorkerSuggestions] = useState(false)

  // PAYMENT & BILLING
  const [showPaymentSuggestions, setShowPaymentSuggestions] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(t("jobs.paymentPending"))
  const [paymentMethod, setPaymentMethod] = useState("")
  
  // LABOR & DISCOUNT (State initialized from Invoice Settings Context)
  const [laborCost, setLaborCost] = useState<string>("")
  const [discount, setDiscount] = useState<string>("")

  const paymentMethods = [
    t("jobs.methodCash"),
    t("jobs.methodUPI"),
    t("jobs.methodCard"),
    t("jobs.methodBankTransfer")
  ]

  // JOB
  const [priority, setPriority] = useState(t("jobs.priorityNormal"))
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

  // Set default labor cost and discount when settings context loads
  useEffect(() => {
    if (settings?.invoice) {
      if (settings.invoice.defaultLaborCost !== undefined) {
        setLaborCost(String(settings.invoice.defaultLaborCost))
      }
      if (settings.invoice.defaultDiscount !== undefined) {
        setDiscount(String(settings.invoice.defaultDiscount))
      }
    }
  }, [settings?.invoice])

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
  }, [paymentMethod, paymentMethods])

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
        t("jobs.alertErrorTitle"),
        err?.response?.data?.message || t("jobs.unableToLoadData")
      )
    } finally {
      setLoading(false)
      setPlanUsageLoading(false)
    }
  }

  const jobsUsed = Number(planUsage?.jobsUsed ?? 0)
  const jobsLimitRaw = planUsage?.jobsLimit

  const isUnlimited =
    Number(jobsLimitRaw) === -1 ||
    String(jobsLimitRaw ?? "").toLowerCase() === "unlimited"

  const jobsLimit = isUnlimited ? null : Number(jobsLimitRaw ?? 0)

  const hasReachedJobLimit =
    !isUnlimited &&
    jobsLimit !== null &&
    jobsLimit > 0 &&
    jobsUsed >= jobsLimit

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

  // BILLING CALCULATIONS
  const servicesSubtotal = useMemo(() => {
    return selectedServices.reduce((sum, item) => sum + (Number(item.estimatedPrice) * Number(item.quantity)), 0)
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

  const isLaborInvalid = useMemo(() => {
    if (!laborCost.trim()) return false
    const val = Number(laborCost)
    return isNaN(val) || val < 0
  }, [laborCost])

  const isDiscountInvalid = useMemo(() => {
    if (!discount.trim()) return false
    const val = Number(discount)
    return isNaN(val) || val < 0 || val > 100
  }, [discount])

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
      Alert.alert(t("jobs.pleaseWait"), t("jobs.checkingPlanUsage"))
      return
    }

    if (planUsageError || !planUsage) {
      Alert.alert(t("jobs.unableToVerifyPlanTitle"), t("jobs.unableToVerifyPlanMsg"))
      return
    }

    if (hasReachedJobLimit) {
      const plan = planUsage?.planName || t("jobs.current")
      
      Alert.alert(
        t("jobs.jobLimitReachedTitle"),
        `${t("jobs.jobLimitReachedMsg")}\n(${plan}: ${jobsUsed}/${jobsLimit})`
      )
      return
    }

    setSubmitted(true)
    const missingFields: string[] = []

    const cleanName = customerName.trim()
    const cleanPhone = phone.trim()
    const cleanVehNum = vehicleNumber.trim()
    const cleanVehModel = vehicleModel.trim()

    if (!cleanName) missingFields.push(t("jobs.customerName"))
    if (!cleanPhone || cleanPhone.length !== 10) missingFields.push(t("jobs.validPhone"))
    if (!cleanVehNum) missingFields.push(t("jobs.vehicleNumber"))
    if (!cleanVehModel) missingFields.push(t("jobs.vehicleModel"))
    if (selectedServices.length === 0) missingFields.push(t("jobs.atLeastOneServiceField"))

    // Billing Validation
    if (isLaborInvalid) missingFields.push(t("jobs.errNonNegativeLabor"))
    if (isDiscountInvalid) missingFields.push(t("jobs.errValidDiscount"))

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

      Alert.alert(t("jobs.alertValidationTitle"), t("jobs.validationErrorMsgList") + missingFields.join("\n• "))
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
        laborCost: parsedLabor,
        discount: parsedDiscount,
        totalAmount: grandTotal,
        notes,
        services: selectedServices
      })

      Alert.alert(t("jobs.alertSuccessTitle"), t("jobs.alertSuccessMsg"))
      navigation.goBack()
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 403) {
        Alert.alert(
          t("jobs.jobLimitReachedTitle"),
          err?.response?.data?.message || t("jobs.jobLimitReachedGarageMsg")
        )
        return
      }

      Alert.alert(t("jobs.alertErrorTitle"), err?.response?.data?.message || t("jobs.unableToCreateJob"))
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

      {/* CUSTOMER DETAILS */}
      <Text style={styles.heading}>{t("jobs.customerDetails")}</Text>

      <RequiredLabel text={t("jobs.customerName")} />
      <View onLayout={e => (customerNameY.current = e.nativeEvent.layout.y)}>
        <TextInput
          ref={customerNameRef}
          onFocus={closeDropdowns}
          style={[styles.input, submitted && !customerName.trim() && styles.inputError]}
          value={customerName}
          onChangeText={setCustomerName}
        />
        {submitted && !customerName.trim() && (
          <Text style={styles.errorText}>{t("jobs.valErrName")}</Text>
        )}
      </View>

      <RequiredLabel text={t("jobs.phoneNumber")} />
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
          <Text style={styles.errorText}>{t("jobs.valErrPhoneReq")}</Text>
        )}
        {submitted && phone.trim().length > 0 && phone.trim().length !== 10 && (
          <Text style={styles.errorText}>{t("jobs.valErrPhoneLen")}</Text>
        )}
      </View>

      <Text style={styles.label}>{t("jobs.customerAddress")}</Text>
      <TextInput
        onFocus={closeDropdowns}
        style={styles.input}
        value={customerAddress}
        onChangeText={setCustomerAddress}
      />

      {/* VEHICLE DETAILS */}
      <Text style={styles.heading}>{t("jobs.vehicleDetails")}</Text>

      <RequiredLabel text={t("jobs.vehicleNumber")} />
      <View onLayout={e => (vehicleNumberY.current = e.nativeEvent.layout.y)}>
        <TextInput
          ref={vehicleNumberRef}
          onFocus={closeDropdowns}
          style={[styles.input, submitted && !vehicleNumber.trim() && styles.inputError]}
          value={vehicleNumber}
          onChangeText={text => setVehicleNumber(text.toUpperCase())}
        />
        {submitted && !vehicleNumber.trim() && (
          <Text style={styles.errorText}>{t("jobs.valErrVehNum")}</Text>
        )}
      </View>

      <Text style={styles.label}>{t("jobs.vehicleBrand")}</Text>
      <TextInput
        onFocus={closeDropdowns}
        style={styles.input}
        value={vehicleBrand}
        onChangeText={setVehicleBrand}
      />

      <RequiredLabel text={t("jobs.vehicleModel")} />
      <View onLayout={e => (vehicleModelY.current = e.nativeEvent.layout.y)}>
        <TextInput
          ref={vehicleModelRef}
          onFocus={closeDropdowns}
          style={[styles.input, submitted && !vehicleModel.trim() && styles.inputError]}
          value={vehicleModel}
          onChangeText={setVehicleModel}
        />
        {submitted && !vehicleModel.trim() && (
          <Text style={styles.errorText}>{t("jobs.valErrVehModel")}</Text>
        )}
      </View>

      <Text style={styles.label}>{t("jobs.odometer")}</Text>
      <TextInput
        onFocus={closeDropdowns}
        keyboardType="numeric"
        maxLength={7}
        style={styles.input}
        value={odometer}
        onChangeText={setOdometer}
      />

      <RequiredLabel text={t("jobs.vehicleType")} />
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeButton, vehicleType === t("jobs.twoWheeler") && styles.selectedType]}
          onPress={() => setVehicleType(t("jobs.twoWheeler"))}
        >
          <Text>🏍 {t("jobs.twoWheeler")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, vehicleType === t("jobs.fourWheeler") && styles.selectedType]}
          onPress={() => setVehicleType(t("jobs.fourWheeler"))}
        >
          <Text>🚗 {t("jobs.fourWheeler")}</Text>
        </TouchableOpacity>
      </View>

      {/* WORKER */}
      <Text style={styles.heading}>{t("jobs.worker")}</Text>
      <Text style={styles.label}>{t("jobs.assignWorker")}</Text>
      <View style={[styles.inputWrapper, { zIndex: 10 }]}>
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
        {[t("jobs.priorityLow"), t("jobs.priorityNormal"), t("jobs.priorityHigh")].map(item => (
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

      <Text style={styles.label}>{t("jobs.expectedDelivery")}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: deliveryDate ? "#111827" : "#9CA3AF" }}>
          {deliveryDate ? formatDate(deliveryDate) : t("jobs.deliveryDate")}
        </Text>
      </TouchableOpacity>

      {/* SERVICES */}
      <Text style={styles.heading}>{t("jobs.services")}</Text>
      <RequiredLabel text={t("jobs.service")} />
      <View style={[styles.inputWrapper, { zIndex: 10 }]}>
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
            placeholder={t("jobs.enterEstimate")}
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

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.smallLabel}>{t("jobs.quantity")}</Text>
                <TextInput
                  onFocus={closeDropdowns}
                  style={styles.smallInput}
                  keyboardType="numeric"
                  value={String(service.quantity)}
                  onChangeText={text => updateService(index, "quantity", Number(text) || 1)}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.smallLabel}>{t("jobs.estimatePrice")}</Text>
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
              <Text style={styles.totalServiceText}>{t("jobs.subtotal")}</Text>
              <Text style={styles.totalServicePrice}>
                ₹ {Number(service.quantity) * Number(service.estimatedPrice)}
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
            style={[styles.input, submitted && isLaborInvalid && styles.inputError]}
            value={laborCost}
            onChangeText={setLaborCost}
            placeholder="0"
          />
          {submitted && isLaborInvalid && (
            <Text style={styles.errorText}>{t("jobs.errNonNegativeLabor")}</Text>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{t("jobs.discountPercent")}</Text>
          <TextInput
            onFocus={closeDropdowns}
            keyboardType="numeric"
            style={[styles.input, submitted && isDiscountInvalid && styles.inputError]}
            value={discount}
            onChangeText={setDiscount}
            placeholder="0"
          />
          {submitted && isDiscountInvalid && (
            <Text style={styles.errorText}>{t("jobs.errValidDiscount")}</Text>
          )}
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
            <Text style={[styles.summaryValue, { color: "#059669" }]}>- ₹ {discountAmount.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>{t("jobs.estimatedBill")}</Text>
          <Text style={styles.totalAmount}>₹ {grandTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* NOTES & COMPLAINTS */}
      <Text style={styles.heading}>{t("jobs.customerComplaint")}</Text>
      <TextInput
        onFocus={closeDropdowns}
        multiline
        style={styles.notes}
        value={complaint}
        onChangeText={setComplaint}
      />

      <Text style={styles.heading}>{t("jobs.inspectionNotes")}</Text>
      <TextInput
        onFocus={closeDropdowns}
        multiline
        style={styles.notes}
        value={inspectionNotes}
        onChangeText={setInspectionNotes}
      />

      {/* PAYMENT STATUS & METHOD */}
      <Text style={styles.heading}>{t("jobs.paymentStatus")}</Text>
      <View style={styles.priorityRow}>
        {[t("jobs.paymentPending"), t("jobs.paymentAdvance"), t("jobs.paymentPaid")].map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.priorityButton, paymentStatus === item && styles.selectedPriority]}
            onPress={() => setPaymentStatus(item)}
          >
            <Text style={{ color: paymentStatus === item ? "white" : "#111827" }}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.inputWrapper, { zIndex: 100 }]}>
        <Text style={styles.label}>{t("jobs.paymentMethod")}</Text>
        <TextInput
          placeholder={t("jobs.selectPaymentMethod")}
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
          <View style={[styles.suggestionContainer, styles.paymentDropdown]}>
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
          <Text style={styles.saveText}>{t("jobs.jobLimitReachedBtn")}</Text>
        ) : planUsageError ? (
          <Text style={styles.saveText}>{t("jobs.unableToVerifyBtn")}</Text>
        ) : (
          <Text style={styles.saveText}>{t("jobs.createJob")}</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 18, fontWeight: "700", marginVertical: 12, color: "#111827" },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  smallLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  input: { backgroundColor: "white", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 12, marginBottom: 12 },
  smallInput: { backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 8 },
  inputError: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  errorText: { color: "#DC2626", fontSize: 12, marginTop: -8, marginBottom: 8, marginLeft: 4 },
  row: { flexDirection: "row", gap: 12 },
  typeRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  typeButton: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", backgroundColor: "white" },
  selectedType: { backgroundColor: "#DBEAFE", borderColor: "#2563EB" },
  inputWrapper: { position: "relative", marginBottom: 8 },
  suggestionContainer: { backgroundColor: "white", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, position: "absolute", top: 72, left: 0, right: 0, zIndex: 1000, elevation: 10, maxHeight: 200, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  paymentDropdown: { top: 76, maxHeight: 180 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  workerSuggestion: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontWeight: "600", color: "#111827" },
  cardSubtitle: { fontSize: 12, color: "#6B7280" },
  suggestionPrice: { fontWeight: "700", color: "#059669" },
  priorityRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  priorityButton: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", backgroundColor: "white" },
  selectedPriority: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  addServiceBtn: { backgroundColor: "#2563EB", padding: 12, borderRadius: 10, alignItems: "center", marginVertical: 12 },
  addServiceText: { color: "white", fontWeight: "600" },
  emptyCard: { padding: 16, backgroundColor: "#F3F4F6", borderRadius: 10, alignItems: "center", marginBottom: 12 },
  emptyText: { color: "#6B7280" },
  selectedServiceCard: { backgroundColor: "white", padding: 12, borderRadius: 10, borderBottomWidth: 1, borderColor: "#E5E7EB", marginBottom: 12 },
  selectedHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  totalServiceText: { fontSize: 12, color: "#6B7280" },
  totalServicePrice: { fontWeight: "600", color: "#111827" },
  totalCard: { backgroundColor: "#1E293B", padding: 16, borderRadius: 12, marginVertical: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 2 },
  summaryLabel: { color: "#94A3B8", fontSize: 14 },
  summaryValue: { color: "white", fontSize: 14, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#334155", marginVertical: 8 },
  totalLabel: { color: "white", fontSize: 16, fontWeight: "600" },
  totalAmount: { color: "#38BDF8", fontSize: 20, fontWeight: "700" },
  notes: { backgroundColor: "white", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 12, height: 80, textAlignVertical: "top", marginBottom: 12 },
  saveBtn: { backgroundColor: "#2563EB", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 24, zIndex: 1, elevation: 1 },
  saveText: { color: "white", fontSize: 16, fontWeight: "700" }
})