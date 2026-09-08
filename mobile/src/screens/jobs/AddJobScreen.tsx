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
  FlatList
} from "react-native"

import { useEffect, useMemo, useState, useRef } from "react"
import { Ionicons } from "@expo/vector-icons"
import { createJob } from "../../services/jobService"
import { getWorkers } from "../../services/workerService"
import { getServiceTypes } from "../../services/serviceTypesService"
import { getInventory } from "../../services/inventoryService"
import { getPlanUsage, PlanUsageResponse } from "../../services/subscriptionService"

import { useAuth } from "../../context/AuthContext"
import { useSettings } from "../../context/SettingsContext"
import { useTranslation } from "../../context/LanguageContext"
import DateTimePicker from "@react-native-community/datetimepicker"

export default function AddJobScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [submitted, setSubmitted] = useState(false)
  const { user } = useAuth()
  const { settings } = useSettings()
  const { t } = useTranslation()

  const scrollRef = useRef<ScrollView>(null)
  const customerNameRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const vehicleNumberRef = useRef<TextInput>(null)
  const vehicleModelRef = useRef<TextInput>(null)

  // LOADING STATES
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [planUsageLoading, setPlanUsageLoading] = useState(true)
  const [planUsageError, setPlanUsageError] = useState(false)

  // DATA LISTS
  const [workers, setWorkers] = useState<any[]>([])
  const [serviceTypes, setServiceTypes] = useState<any[]>([])
  const [inventoryList, setInventoryList] = useState<any[]>([])
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

  // LABOR & DISCOUNT
  const [laborCost, setLaborCost] = useState<string>("")
  const [discount, setDiscount] = useState<string>("")

  // JOB METADATA
  const [priority, setPriority] = useState(t("jobs.priorityNormal"))
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [inspectionNotes, setInspectionNotes] = useState("")

  // SERVICES
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [serviceName, setServiceName] = useState("")
  const [servicePrice, setServicePrice] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  // INVENTORY / PARTS SELECTION
  const [selectedParts, setSelectedParts] = useState<any[]>([])
  const [selectedPartItem, setSelectedPartItem] = useState<any | null>(null)
  const [partName, setPartName] = useState("")
  const [partPrice, setPartPrice] = useState("")
  const [partQty, setPartQty] = useState("1")

  useEffect(() => {
    if (user && (user.userType === "worker" || user.role === "worker")) {
      setWorkerId(user.workerId || user._id || user.id || "")
      setWorkerName(user.name || user.workerName || user.ownerName || "")
    }
  }, [user])

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
  }

  const searchedWorkers = useMemo(() => {
    if (!workerName.trim()) return workers
    return workers.filter(w => (w.name || "").toLowerCase().includes(workerName.toLowerCase()))
  }, [workerName, workers])

  const searchedServices = useMemo(() => {
    if (!serviceName.trim()) return []
    return serviceTypes.filter(s => (s.name || "").toLowerCase().includes(serviceName.toLowerCase()))
  }, [serviceName, serviceTypes])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setPlanUsageLoading(true)
      setPlanUsageError(false)

      const [workersRes, servicesRes, inventoryRes, planUsageRes] = await Promise.all([
        getWorkers(),
        getServiceTypes(),
        getInventory ? getInventory() : Promise.resolve([]),
        getPlanUsage()
      ])

      setWorkers(workersRes?.workers || [])
      setServiceTypes(servicesRes?.services || [])
      setInventoryList(inventoryRes?.inventory || inventoryRes || [])
      setPlanUsage(planUsageRes || null)
    } catch (err: any) {
      setPlanUsageError(true)
      Alert.alert(t("jobs.alertErrorTitle"), err?.response?.data?.message || t("jobs.unableToLoadData"))
    } finally {
      setLoading(false)
      setPlanUsageLoading(false)
    }
  }

  const jobsUsed = Number(planUsage?.jobsUsed ?? 0)
  const jobsLimitRaw = planUsage?.jobsLimit
  const isUnlimited = Number(jobsLimitRaw) === -1 || String(jobsLimitRaw ?? "").toLowerCase() === "unlimited"
  const jobsLimit = isUnlimited ? null : Number(jobsLimitRaw ?? 0)
  const hasReachedJobLimit = !isUnlimited && jobsLimit !== null && jobsLimit > 0 && jobsUsed >= jobsLimit

  // SERVICES HANDLERS
  const removeService = (index: number) => setSelectedServices(prev => prev.filter((_, i) => i !== index))
  
  const updateServicePrice = (index: number, value: string) => {
    const numValue = Number(value) || 0
    setSelectedServices(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], estimatedPrice: numValue, actualPrice: numValue }
      return copy
    })
  }

  const addCurrentService = () => {
    if (!serviceName.trim()) return
    const price = Number(servicePrice) || 0
    setSelectedServices(prev => [...prev, { serviceId: null, name: serviceName, quantity: 1, estimatedPrice: price, actualPrice: price }])
    setServiceName("")
    setServicePrice("")
    closeDropdowns()
  }

  // PARTS HANDLERS
  const handleSelectInventoryItem = (item: any) => {
    setSelectedPartItem(item)
    setPartName(item.name || "")
    setPartPrice(String(item.price || item.unitPrice || 0))
  }

  const addCurrentPart = () => {
    if (!partName.trim()) {
      Alert.alert(t("jobs.alertErrorTitle"), t("jobs.valErrPartName"))
      return
    }
    const requestedQty = parseInt(partQty) || 1
    const unitPrice = parseFloat(partPrice) || 0

    if (selectedPartItem) {
      const availableStock = selectedPartItem.stock ?? selectedPartItem.quantity ?? 0
      const partId = selectedPartItem.id || selectedPartItem._id
      const alreadyAddedQty = selectedParts.filter(p => p.inventoryId === partId).reduce((sum, p) => sum + p.quantity, 0)

      if (availableStock <= 0 || (alreadyAddedQty + requestedQty) > availableStock) {
        Alert.alert(t("jobs.outOfStock"), t("jobs.insufficientStock"))
        return
      }
    }

    setSelectedParts(prev => [
      ...prev,
      {
        inventoryId: selectedPartItem ? (selectedPartItem.id || selectedPartItem._id) : null,
        name: partName,
        quantity: requestedQty,
        unitPrice,
        totalPrice: requestedQty * unitPrice
      }
    ])
    setSelectedPartItem(null)
    setPartName("")
    setPartPrice("")
    setPartQty("1")
    closeDropdowns()
  }

  const removePart = (index: number) => setSelectedParts(prev => prev.filter((_, i) => i !== index))

  // Extract discount type from settings with fallback to 'percentage'
  const discountType = settings?.invoice?.defaultDiscountType || "percentage"

  // BILLING CALCULATIONS
  const servicesSubtotal = useMemo(
    () => selectedServices.reduce((sum, item) => sum + Number(item.estimatedPrice || 0), 0),
    [selectedServices]
  )

  const partsSubtotal = useMemo(
    () => selectedParts.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0),
    [selectedParts]
  )

  const parsedLabor = useMemo(() => {
    const v = parseFloat(laborCost)
    return isNaN(v) || v < 0 ? 0 : v
  }, [laborCost])

  // Raw total before discount
  const rawSubtotal = useMemo(
    () => servicesSubtotal + partsSubtotal + parsedLabor,
    [servicesSubtotal, partsSubtotal, parsedLabor]
  )

  const parsedDiscount = useMemo(() => {
    const v = parseFloat(discount)
    if (isNaN(v) || v < 0) return 0
    // Cap at 100 if it's percentage mode, otherwise return raw amount
    return discountType === "percentage" ? Math.min(v, 100) : v
  }, [discount, discountType])

  // Calculate discount value based on configuration
  const discountAmount = useMemo(() => {
    if (discountType === "percentage") {
      return (rawSubtotal * parsedDiscount) / 100
    }
    // Fixed / Amount type discount
    return Math.min(parsedDiscount, rawSubtotal)
  }, [rawSubtotal, parsedDiscount, discountType])

  // Final Grand Total
  const grandTotal = useMemo(
    () => Math.max(0, rawSubtotal - discountAmount),
    [rawSubtotal, discountAmount]
  )

  const handleNext = () => {
    setSubmitted(true)
    if (currentStep === 1) {
      if (!customerName.trim() || phone.trim().length !== 10 || !vehicleNumber.trim() || !vehicleModel.trim()) {
        Alert.alert(t("jobs.alertValidationTitle"), t("jobs.fillStep1Alert"))
        return
      }
    } else if (currentStep === 2) {
      if (selectedServices.length === 0 && selectedParts.length === 0) {
        Alert.alert(t("jobs.alertValidationTitle"), t("jobs.atLeastOneServiceField"))
        return
      }
    }
    setSubmitted(false)
    setCurrentStep(prev => Math.min(prev + 1, 3))
    scrollRef.current?.scrollTo({ y: 0, animated: true })
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    scrollRef.current?.scrollTo({ y: 0, animated: true })
  }

  const saveJob = async () => {
    if (hasReachedJobLimit) return
    try {
      setSaving(true)
      await createJob({
        customerName: customerName.trim(),
        phone: phone.trim(),
        customerAddress,
        vehicleNumber: vehicleNumber.trim(),
        vehicleModel: vehicleModel.trim(),
        vehicleBrand,
        vehicleType,
        odometer,
        complaint,
        inspectionNotes,
        workerId,
        workerName,
        priority,
        deliveryDate: deliveryDate ? deliveryDate.toISOString() : "",
        laborCost: parsedLabor,
        discount: parsedDiscount,
        totalAmount: grandTotal,
        services: selectedServices,
        parts: selectedParts
      })
      Alert.alert(t("jobs.alertSuccessTitle"), t("jobs.alertSuccessMsg"))
      navigation.goBack()
    } catch (err: any) {
      Alert.alert(t("jobs.alertErrorTitle"), err?.response?.data?.message || t("jobs.unableToCreateJob"))
    } finally {
      setSaving(false)
    }
  }

  const RequiredLabel = ({ text }: { text: string }) => (
    <Text style={styles.label}>{text}<Text style={{ color: "#DC2626" }}> *</Text></Text>
  )

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#2563EB" /></View>

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      {/* STEP INDICATOR */}
      <View style={styles.stepContainer}>
        {[
          { step: 1, label: t("jobs.stepCustomer") },
          { step: 2, label: t("jobs.stepServices") },
          { step: 3, label: t("jobs.stepBilling") }
        ].map((item) => (
          <View key={item.step} style={styles.stepItem}>
            <View style={[styles.stepBadge, currentStep === item.step && styles.activeBadge, currentStep > item.step && styles.completedBadge]}>
              <Text style={[styles.stepBadgeText, (currentStep >= item.step) && styles.activeBadgeText]}>
                {currentStep > item.step ? "✓" : item.step}
              </Text>
            </View>
            <Text style={[styles.stepLabel, currentStep === item.step && styles.activeStepLabel]}>{item.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView ref={scrollRef} style={styles.container} keyboardShouldPersistTaps="handled" onScrollBeginDrag={closeDropdowns}>
        {/* STEP 1: CUSTOMER & VEHICLE */}
        {currentStep === 1 && (
          <>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={20} color="#2563EB" />
                <Text style={styles.sectionHeading}>{t("jobs.customerDetails")}</Text>
              </View>

              <RequiredLabel text={t("jobs.customerName")} />
              <TextInput ref={customerNameRef} onFocus={closeDropdowns} style={[styles.input, submitted && !customerName.trim() && styles.inputError]} value={customerName} onChangeText={setCustomerName} />

              <RequiredLabel text={t("jobs.phoneNumber")} />
              <TextInput ref={phoneRef} onFocus={closeDropdowns} keyboardType="phone-pad" maxLength={10} style={[styles.input, submitted && (phone.trim().length !== 10) && styles.inputError]} value={phone} onChangeText={setPhone} />

              <Text style={styles.label}>{t("jobs.customerAddress")}</Text>
              <TextInput onFocus={closeDropdowns} style={styles.input} value={customerAddress} onChangeText={setCustomerAddress} />
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="car-outline" size={20} color="#2563EB" />
                <Text style={styles.sectionHeading}>{t("jobs.vehicleDetails")}</Text>
              </View>

              <RequiredLabel text={t("jobs.vehicleNumber")} />
              <TextInput ref={vehicleNumberRef} onFocus={closeDropdowns} style={[styles.input, submitted && !vehicleNumber.trim() && styles.inputError]} value={vehicleNumber} onChangeText={text => setVehicleNumber(text.toUpperCase())} />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t("jobs.vehicleBrand")}</Text>
                  <TextInput onFocus={closeDropdowns} style={styles.input} value={vehicleBrand} onChangeText={setVehicleBrand} />
                </View>
                <View style={{ flex: 1 }}>
                  <RequiredLabel text={t("jobs.vehicleModel")} />
                  <TextInput ref={vehicleModelRef} onFocus={closeDropdowns} style={[styles.input, submitted && !vehicleModel.trim() && styles.inputError]} value={vehicleModel} onChangeText={setVehicleModel} />
                </View>
              </View>

              <Text style={styles.label}>{t("jobs.odometer")}</Text>
              <TextInput onFocus={closeDropdowns} keyboardType="numeric" maxLength={7} style={styles.input} value={odometer} onChangeText={setOdometer} />

              <RequiredLabel text={t("jobs.vehicleType")} />
              <View style={styles.typeRow}>
                <TouchableOpacity style={[styles.typeButton, vehicleType === t("jobs.twoWheeler") && styles.selectedType]} onPress={() => setVehicleType(t("jobs.twoWheeler"))}>
                  <Text style={[styles.typeButtonText, vehicleType === t("jobs.twoWheeler") && styles.selectedTypeButtonText]}>🏍 {t("jobs.twoWheeler")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeButton, vehicleType === t("jobs.fourWheeler") && styles.selectedType]} onPress={() => setVehicleType(t("jobs.fourWheeler"))}>
                  <Text style={[styles.typeButtonText, vehicleType === t("jobs.fourWheeler") && styles.selectedTypeButtonText]}>🚗 {t("jobs.fourWheeler")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* STEP 2: WORKER, SERVICES & PARTS */}
        {currentStep === 2 && (
          <>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="people-outline" size={20} color="#2563EB" />
                <Text style={styles.sectionHeading}>{t("jobs.workerAndAssignment")}</Text>
              </View>

              <Text style={styles.label}>{t("jobs.assignWorker")}</Text>
              <View style={[styles.inputWrapper, { zIndex: 10 }]}>
                <TextInput style={styles.input} value={workerName} onFocus={() => setShowWorkerSuggestions(true)} onChangeText={text => { setWorkerName(text); setShowWorkerSuggestions(true) }} />
                {showWorkerSuggestions && (
                  <View style={styles.suggestionContainer}>
                    {searchedWorkers.map(w => (
                      <TouchableOpacity key={w.workerId || w._id} style={styles.workerSuggestion} onPress={() => { setWorkerId(w.workerId || w._id); setWorkerName(w.name); setShowWorkerSuggestions(false) }}>
                        <Text style={styles.cardTitle}>{w.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <Text style={styles.label}>{t("jobs.priority")}</Text>
              <View style={styles.priorityRow}>
                {[t("jobs.priorityLow"), t("jobs.priorityNormal"), t("jobs.priorityHigh")].map(item => (
                  <TouchableOpacity key={item} style={[styles.priorityButton, priority === item && styles.selectedPriority]} onPress={() => setPriority(item)}>
                    <Text style={{ fontWeight: "600", color: priority === item ? "white" : "#374151" }}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>{t("jobs.deliveryDate")}</Text>
              <TouchableOpacity 
                style={styles.input} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: deliveryDate ? "#000" : "#9CA3AF" }}>
                  {deliveryDate ? deliveryDate.toLocaleString() : "Select Delivery Date & Time"}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={deliveryDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDeliveryDate(selectedDate);
                      setShowTimePicker(true); // Trigger time picker after date selection
                    }
                  }}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={deliveryDate || new Date()}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime && deliveryDate) {
                      const updatedDate = new Date(deliveryDate);
                      updatedDate.setHours(selectedTime.getHours());
                      updatedDate.setMinutes(selectedTime.getMinutes());
                      setDeliveryDate(updatedDate);
                    }
                  }}
                />
              )}
            </View>

            {/* SERVICES */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="construct-outline" size={20} color="#2563EB" />
                <Text style={styles.sectionHeading}>{t("jobs.services")}</Text>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.label}>{t("jobs.service")}</Text>
                  <TextInput style={styles.input} value={serviceName} onFocus={() => setShowSuggestions(true)} onChangeText={text => { setServiceName(text); setShowSuggestions(true) }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t("jobs.estimatePrice")}</Text>
                  <TextInput keyboardType="numeric" style={styles.input} value={servicePrice} onChangeText={setServicePrice} />
                </View>
              </View>

              <TouchableOpacity style={styles.addServiceBtn} onPress={addCurrentService}>
                <Ionicons name="add-circle-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.addServiceText}>{t("jobs.addService")}</Text>
              </TouchableOpacity>

              {selectedServices.map((service, index) => (
                <View key={index} style={styles.selectedServiceCard}>
                  <View style={styles.selectedHeader}>
                    <Text style={styles.cardTitle}>{service.name}</Text>
                    <TouchableOpacity onPress={() => removeService(index)}><Ionicons name="trash-outline" size={20} color="#DC2626" /></TouchableOpacity>
                  </View>
                  <View style={styles.rowAlign}>
                    <Text style={styles.smallLabel}>Cost (₹):</Text>
                    <TextInput style={styles.inlinePriceInput} keyboardType="numeric" value={String(service.estimatedPrice)} onChangeText={text => updateServicePrice(index, text)} />
                  </View>
                </View>
              ))}
            </View>

            {/* SPARE PARTS */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="cube-outline" size={20} color="#2563EB" />
                <Text style={styles.sectionHeading}>{t("jobs.sparePartsAndInventory")}</Text>
              </View>

              <Text style={styles.label}>{t("jobs.partName")}</Text>
              <TextInput style={styles.input} value={partName} onChangeText={setPartName} />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t("jobs.quantity")}</Text>
                  <TextInput keyboardType="numeric" style={styles.input} value={partQty} onChangeText={setPartQty} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t("jobs.unitPrice")}</Text>
                  <TextInput keyboardType="numeric" style={styles.input} value={partPrice} onChangeText={setPartPrice} />
                </View>
              </View>

              <TouchableOpacity style={styles.addServiceBtn} onPress={addCurrentPart}>
                <Ionicons name="add-circle-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.addServiceText}>{t("jobs.addPart")}</Text>
              </TouchableOpacity>

              {selectedParts.map((part, index) => (
                <View key={index} style={styles.selectedServiceCard}>
                  <View style={styles.selectedHeader}>
                    <Text style={styles.cardTitle}>{part.name}</Text>
                    <TouchableOpacity onPress={() => removePart(index)}><Ionicons name="trash-outline" size={20} color="#DC2626" /></TouchableOpacity>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalServiceText}>{part.quantity} x ₹{part.unitPrice}</Text>
                    <Text style={styles.totalServicePrice}>₹ {part.totalPrice}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* STEP 3: BILLING & NOTES */}
        {currentStep === 3 && (
          <>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="receipt-outline" size={20} color="#2563EB" />
                <Text style={styles.sectionHeading}>{t("jobs.laborAndAdditionalCharges")}</Text>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t("jobs.laborCharge")}</Text>
                  <TextInput keyboardType="numeric" style={styles.input} value={laborCost} onChangeText={setLaborCost} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t("jobs.discountPercent")}</Text>
                  <TextInput keyboardType="numeric" style={styles.input} value={discount} onChangeText={setDiscount} />
                </View>
              </View>

              <View style={styles.totalCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t("jobs.servicesSubtotal")}</Text>
                  <Text style={styles.summaryValue}>₹ {servicesSubtotal.toFixed(2)}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t("jobs.partsSubtotal")}</Text>
                  <Text style={styles.summaryValue}>+ ₹ {partsSubtotal.toFixed(2)}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t("jobs.laborFee")}</Text>
                  <Text style={styles.summaryValue}>+ ₹ {parsedLabor.toFixed(2)}</Text>
                </View>

                {parsedDiscount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: "#DC2626" }]}>
                      Discount {discountType === "percentage" ? `(${parsedDiscount}%)` : ""}
                    </Text>
                    <Text style={[styles.summaryValue, { color: "#DC2626" }]}>
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
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text-outline" size={20} color="#2563EB" />
                <Text style={styles.sectionHeading}>{t("jobs.customerComplaint")}</Text>
              </View>
              <TextInput multiline style={styles.notes} value={complaint} onChangeText={setComplaint} />

              <Text style={[styles.sectionHeading, { fontSize: 15, marginTop: 16 }]}>{t("jobs.inspectionNotes")}</Text>
              <TextInput multiline style={styles.notes} value={inspectionNotes} onChangeText={setInspectionNotes} />
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FOOTER BUTTONS */}
      <View style={styles.footerBar}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backBtnText}>{t("jobs.btnBack")}</Text>
          </TouchableOpacity>
        )}

        {currentStep < 3 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{t("jobs.btnNext")}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.saveBtn, hasReachedJobLimit && { backgroundColor: "#9CA3AF" }]} disabled={saving || hasReachedJobLimit} onPress={saveJob}>
            {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>{t("jobs.createJob")}</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  stepContainer: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#FFF", padding: 14, borderBottomWidth: 1, borderColor: "#E5E7EB" },
  stepItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#E5E7EB", justifyContent: "center", alignItems: "center" },
  activeBadge: { backgroundColor: "#2563EB" },
  completedBadge: { backgroundColor: "#059669" },
  stepBadgeText: { fontSize: 12, fontWeight: "700", color: "#4B5563" },
  activeBadgeText: { color: "#FFF" },
  stepLabel: { fontSize: 12, fontWeight: "500", color: "#6B7280" },
  activeStepLabel: { color: "#111827", fontWeight: "700" },
  sectionCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", paddingBottom: 8 },
  sectionHeading: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginLeft: 8 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#D1D5DB", backgroundColor: "#FFFFFF", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 12, color: "#111827" },
  inputError: { borderColor: "#DC2626" },
  row: { flexDirection: "row", gap: 10 },
  typeRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  typeButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8, alignItems: "center", backgroundColor: "#FFF" },
  selectedType: { backgroundColor: "#EFF6FF", borderColor: "#2563EB" },
  typeButtonText: { fontWeight: "500", color: "#374151" },
  selectedTypeButtonText: { color: "#2563EB", fontWeight: "700" },
  priorityRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  priorityButton: { flex: 1, padding: 10, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8, alignItems: "center" },
  selectedPriority: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  inputWrapper: { position: "relative" },
  suggestionContainer: { position: "absolute", top: 50, left: 0, right: 0, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, zIndex: 100 },
  workerSuggestion: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  addServiceBtn: { flexDirection: "row", backgroundColor: "#2563EB", padding: 12, borderRadius: 8, alignItems: "center", justifyContent: "center", marginVertical: 4 },
  addServiceText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
  selectedServiceCard: { backgroundColor: "#F9FAFB", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 8 },
  selectedHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowAlign: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  smallLabel: { fontSize: 13, color: "#4B5563" },
  inlinePriceInput: { borderWidth: 1, borderColor: "#D1D5DB", backgroundColor: "#FFF", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 13, minWidth: 80, textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  totalServiceText: { fontWeight: "500", color: "#4B5563", fontSize: 13 },
  totalServicePrice: { fontWeight: "700", color: "#111827", fontSize: 13 },
  totalCard: { backgroundColor: "#F9FAFB", padding: 14, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB", marginTop: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel: { color: "#4B5563", fontSize: 13 },
  summaryValue: { color: "#111827", fontWeight: "600", fontSize: 13 },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#111827" },
  totalAmount: { fontSize: 17, fontWeight: "700", color: "#2563EB" },
  notes: { borderWidth: 1, borderColor: "#D1D5DB", backgroundColor: "#FFF", borderRadius: 8, padding: 10, height: 70, textAlignVertical: "top", fontSize: 14 },
  footerBar: { flexDirection: "row", padding: 16, backgroundColor: "#FFF", borderTopWidth: 1, borderColor: "#E5E7EB", gap: 12 },
  backBtn: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: "#D1D5DB", alignItems: "center" },
  backBtnText: { color: "#374151", fontWeight: "600", fontSize: 15 },
  nextBtn: { flex: 2, padding: 14, borderRadius: 8, backgroundColor: "#2563EB", alignItems: "center" },
  nextBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  saveBtn: { flex: 2, backgroundColor: "#059669", padding: 14, borderRadius: 8, alignItems: "center" },
  saveText: { color: "#FFF", fontWeight: "700", fontSize: 15 }
})