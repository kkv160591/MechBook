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
import { getInventory } from "../../services/inventoryService"
import { updateJob, getJobById } from "../../services/jobService"

import { useTranslation } from "../../context/LanguageContext"

export default function EditJobScreen({ route, navigation }: any) {
  const { t } = useTranslation()
  const { job } = route.params

  const [step, setStep] = useState<number>(1)
  const [submitted, setSubmitted] = useState(false)
  const [showWorkerSuggestions, setShowWorkerSuggestions] = useState(false)

  const scrollRef = useRef<ScrollView>(null)
  const customerNameRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const vehicleNumberRef = useRef<TextInput>(null)
  const vehicleModelRef = useRef<TextInput>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [workers, setWorkers] = useState<any[]>([])
  const [serviceTypes, setServiceTypes] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])

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

  /* Worker & Job Details */
  const [workerId, setWorkerId] = useState("")
  const [workerName, setWorkerName] = useState("")
  const [priority, setPriority] = useState("Normal")
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [inspectionNotes, setInspectionNotes] = useState("")
  const [notes, setNotes] = useState("")

  /* Services & Parts */
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [serviceName, setServiceName] = useState("")
  const [servicePrice, setServicePrice] = useState("")
  const [serviceQty, setServiceQty] = useState("1")
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false)

  const [selectedParts, setSelectedParts] = useState<any[]>([])
  const [partName, setPartName] = useState("")
  const [partPrice, setPartPrice] = useState("")
  const [partQty, setPartQty] = useState("1")
  const [showPartSuggestions, setShowPartSuggestions] = useState(false)

  /* Billing & Calculations */
  const [laborCost, setLaborCost] = useState<string>("")
  const [discount, setDiscount] = useState<string>("")
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [job.jobId])
  )

  const loadData = async () => {
    try {
      setLoading(true)
      const [workersRes, servicesRes, inventoryRes, jobRes] = await Promise.all([
        getWorkers(),
        getServiceTypes(),
        getInventory(),
        getJobById(job.jobId)
      ])

      const latestJob = jobRes.job
      setWorkers(workersRes.workers || [])
      setServiceTypes(servicesRes.services || [])
      setInventory(inventoryRes.inventory || inventoryRes.items || [])

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
      setSelectedParts(latestJob.parts || [])

      setLaborCost(latestJob.laborCost !== undefined && latestJob.laborCost !== null ? String(latestJob.laborCost) : "0")
      setDiscount(latestJob.discount !== undefined && latestJob.discount !== null ? String(latestJob.discount) : "0")
      setDiscountType(latestJob.discountType || "percentage")
    } catch (err: any) {
      Alert.alert(t("jobs.alertErrorTitle"), err?.response?.data?.message || t("jobs.unableToLoadJobDetails"))
    } finally {
      setLoading(false)
    }
  }

  const closeDropdowns = () => {
    Keyboard.dismiss()
    setShowServiceSuggestions(false)
    setShowPartSuggestions(false)
    setShowWorkerSuggestions(false)
  }

  /* Searches & Calculations */
  const searchedWorkers = useMemo(() => {
    if (!workerName.trim()) return workers
    return workers.filter(worker =>
      (worker.name || "").toLowerCase().includes(workerName.toLowerCase())
    )
  }, [workerName, workers])

  const searchedServices = useMemo(() => {
    if (!serviceName.trim()) return []
    return serviceTypes.filter(s =>
      (s.name || "").toLowerCase().includes(serviceName.toLowerCase())
    )
  }, [serviceName, serviceTypes])

  const searchedParts = useMemo(() => {
    if (!partName.trim()) return []
    return inventory.filter(i =>
      (i.name || "").toLowerCase().includes(partName.toLowerCase())
    )
  }, [partName, inventory])

  const servicesSubtotal = useMemo(() => {
    return selectedServices.reduce((sum, item) => {
      const price = item.actualPrice !== null && item.actualPrice !== undefined && item.actualPrice !== ""
        ? Number(item.actualPrice)
        : Number(item.estimatedPrice || 0)
      return sum + price * Number(item.quantity || 1)
    }, 0)
  }, [selectedServices])

  const partsSubtotal = useMemo(() => {
    return selectedParts.reduce((sum, item) => {
      const price = Number(item.price || item.unitPrice || 0)
      return sum + price * Number(item.quantity || 1)
    }, 0)
  }, [selectedParts])

  const parsedLabor = useMemo(() => {
    const val = parseFloat(laborCost)
    return isNaN(val) || val < 0 ? 0 : val
  }, [laborCost])

  const parsedDiscount = useMemo(() => {
    const val = parseFloat(discount)
    return isNaN(val) || val < 0 ? 0 : val
  }, [discount])

  const discountAmount = useMemo(() => {
    const sub = servicesSubtotal + partsSubtotal + parsedLabor
    if (discountType === "percentage") {
      return (sub * Math.min(parsedDiscount, 100)) / 100
    }
    return Math.min(parsedDiscount, sub)
  }, [servicesSubtotal, partsSubtotal, parsedLabor, parsedDiscount, discountType])

  const grandTotal = useMemo(() => {
    const sub = servicesSubtotal + partsSubtotal + parsedLabor
    return Math.max(0, sub - discountAmount)
  }, [servicesSubtotal, partsSubtotal, parsedLabor, discountAmount])

  /* Item Actions */
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

  const addCurrentPart = () => {
    if (!partName.trim()) return
    setSelectedParts(prev => [
      ...prev,
      {
        partId: null,
        name: partName,
        quantity: Number(partQty) || 1,
        price: Number(partPrice) || 0
      }
    ])
    setPartName("")
    setPartPrice("")
    setPartQty("1")
    closeDropdowns()
  }

  const removeService = (index: number) => {
    setSelectedServices(prev => prev.filter((_, i) => i !== index))
  }

  const removePart = (index: number) => {
    setSelectedParts(prev => prev.filter((_, i) => i !== index))
  }

  const updateService = (index: number, field: string, value: any) => {
    setSelectedServices(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  /* Date Pickers */
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

  /* Wizard Steps Handler */
  const validateAndNextStep = () => {
    setSubmitted(true)
    if (step === 1) {
      if (!customerName.trim() || !phone.trim() || phone.trim().length !== 10 || !vehicleNumber.trim() || !vehicleModel.trim()) {
        Alert.alert(t("jobs.alertValidationTitle"), t("jobs.fillRequiredFields"))
        return
      }
      setSubmitted(false)
      setStep(2)
    } else if (step === 2) {
      if (selectedServices.length === 0) {
        Alert.alert(t("jobs.alertValidationTitle"), t("jobs.atLeastOneService"))
        return
      }
      setSubmitted(false)
      setStep(3)
    }
  }

  const handleSave = async () => {
    setSubmitted(true)

    try {
      setSaving(true)
      await updateJob(job.jobId, {
        customerName: customerName.trim(),
        phone: phone.trim(),
        customerAddress,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        vehicleBrand,
        vehicleModel: vehicleModel.trim(),
        vehicleType,
        odometer,
        complaint,
        workerId,
        priority,
        deliveryDate: deliveryDate ? deliveryDate.toISOString() : "",
        inspectionNotes,
        notes,
        services: selectedServices,
        parts: selectedParts,
        laborCost: parsedLabor,
        discount: parsedDiscount,
        discountType,
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

  return (
  <View style={styles.mainContainer}>
    {/* Wizard Progress Bar Header */}
    <View style={styles.stepHeader}>
      {[1, 2, 3].map((i) => (
        <TouchableOpacity 
          key={i} 
          style={styles.stepTab} 
          onPress={() => setStep(i)}
        >
          <View style={[styles.stepBadge, step === i && styles.activeStepBadge]}>
            <Text style={[styles.stepBadgeText, step === i && styles.activeStepBadgeText]}>
              {i}
            </Text>
          </View>
          <Text style={[styles.stepTabText, step === i && styles.activeStepTabText]}>
            {i === 1 ? t("jobs.stepCustomer") : i === 2 ? t("jobs.stepServices") : t("jobs.stepBilling")}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    <ScrollView
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={closeDropdowns}
      contentContainerStyle={styles.scrollContent}
    >
      {/* STEP 1: CUSTOMER & VEHICLE */}
      {step === 1 && (
        <>
          {/* CONTAINER 1: CUSTOMER DETAILS */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="person-outline" size={20} color="#2563EB" />
              <Text style={styles.cardHeaderTitle}>{t("jobs.customerDetails")}</Text>
            </View>
            
            <RequiredLabel text={t("jobs.customerName")} />
            <TextInput
              ref={customerNameRef}
              style={[styles.input, submitted && !customerName.trim() && styles.inputError]}
              value={customerName}
              onChangeText={setCustomerName}
              onFocus={closeDropdowns}
            />

            <RequiredLabel text={t("jobs.phoneNumber")} />
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

            <Text style={styles.label}>{t("jobs.customerAddress")}</Text>
            <TextInput
              style={styles.input}
              value={customerAddress}
              onChangeText={setCustomerAddress}
              onFocus={closeDropdowns}
            />
          </View>

          {/* CONTAINER 2: VEHICLE DETAILS */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="car-outline" size={18} color="#2563EB" />
              <Text style={styles.cardHeaderTitle}>{t("jobs.vehicleDetails")}</Text>
            </View>

            <RequiredLabel text={t("jobs.vehicleNumber")} />
            <TextInput
              ref={vehicleNumberRef}
              style={[styles.input, submitted && !vehicleNumber.trim() && styles.inputError]}
              value={vehicleNumber}
              onChangeText={text => setVehicleNumber(text.toUpperCase())}
              onFocus={closeDropdowns}
            />

            <View style={styles.row}>
              <View style={styles.flexOne}>
                <Text style={styles.label}>{t("jobs.vehicleBrand")}</Text>
                <TextInput
                  style={styles.input}
                  value={vehicleBrand}
                  onChangeText={setVehicleBrand}
                  onFocus={closeDropdowns}
                />
              </View>

              <View style={styles.flexOne}>
                <RequiredLabel text={t("jobs.vehicleModel")} />
                <TextInput
                  ref={vehicleModelRef}
                  style={[styles.input, submitted && !vehicleModel.trim() && styles.inputError]}
                  value={vehicleModel}
                  onChangeText={setVehicleModel}
                  onFocus={closeDropdowns}
                />
              </View>
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
                <Text style={vehicleType === "2 Wheeler" ? styles.typeButtonTextSelected : styles.typeButtonText}>
                  🏍 {t("jobs.twoWheeler")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, vehicleType === "4 Wheeler" && styles.selectedType]}
                onPress={() => setVehicleType("4 Wheeler")}
              >
                <Text style={vehicleType === "4 Wheeler" ? styles.typeButtonTextSelected : styles.typeButtonText}>
                  🚗 {t("jobs.fourWheeler")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CONTAINER 3: COMPLAINT NOTES */}
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>{t("jobs.customerComplaint")}</Text>
            <TextInput
              style={styles.notes}
              multiline
              placeholder={t("jobs.customerComplaintPlaceholder")}
              value={complaint}
              onChangeText={setComplaint}
              onFocus={closeDropdowns}
            />
          </View>
        </>
      )}

      {/* STEP 2: SERVICES & PARTS */}
      {step === 2 && (
        <>
          {/* WORKER CONTAINER */}
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>{t("jobs.assignWorker")}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder={t("jobs.selectWorker")}
                style={styles.input}
                value={workerName}
                onFocus={() => {
                  setShowWorkerSuggestions(true);
                  setShowServiceSuggestions(false);
                  setShowPartSuggestions(false);
                }}
                onChangeText={text => {
                  setWorkerName(text);
                  setShowWorkerSuggestions(true);
                }}
              />

              {showWorkerSuggestions && (
                <View style={styles.suggestionContainer}>
                  {searchedWorkers.map(worker => (
                    <TouchableOpacity
                      key={worker.workerId}
                      style={styles.workerSuggestion}
                      onPress={() => {
                        setWorkerId(worker.workerId);
                        setWorkerName(worker.name);
                        setShowWorkerSuggestions(false);
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
          </View>

          {/* SERVICES CONTAINER */}
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>{t("jobs.services")}</Text>
            <RequiredLabel text={t("jobs.service")} />
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={serviceName}
                onFocus={() => {
                  setShowServiceSuggestions(true);
                  setShowWorkerSuggestions(false);
                  setShowPartSuggestions(false);
                }}
                onChangeText={text => {
                  setServiceName(text);
                  setShowServiceSuggestions(true);
                }}
              />

              {showServiceSuggestions && searchedServices.length > 0 && (
                <View style={styles.suggestionContainer}>
                  {searchedServices.map(service => (
                    <TouchableOpacity
                      key={service.serviceTypeId}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setServiceName(service.name);
                        setServicePrice(String(service.defaultPrice));
                        closeDropdowns();
                      }}
                    >
                      <View style={styles.flexOne}>
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
              <View style={styles.flexTwo}>
                <Text style={styles.label}>{t("jobs.estimatePrice")}</Text>
                <TextInput
                  onFocus={closeDropdowns}
                  keyboardType="numeric"
                  style={styles.input}
                  value={servicePrice}
                  onChangeText={setServicePrice}
                />
              </View>

              <View style={styles.flexOne}>
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

            {selectedServices.map((service, index) => (
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
                    <Text style={styles.smallLabel}>{t("jobs.actualPrice")}</Text>
                    <TextInput
                      style={styles.smallInput}
                      keyboardType="numeric"
                      placeholder={t("jobs.useEstimate")}
                      value={service.actualPrice === null || service.actualPrice === undefined ? "" : String(service.actualPrice)}
                      onChangeText={text => updateService(index, "actualPrice", text === "" ? null : Number(text))}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* PARTS & INVENTORY CONTAINER */}
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>{t("jobs.partsAndInventory")}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder={t("jobs.partName")}
                style={styles.input}
                value={partName}
                onFocus={() => {
                  setShowPartSuggestions(true);
                  setShowServiceSuggestions(false);
                  setShowWorkerSuggestions(false);
                }}
                onChangeText={text => {
                  setPartName(text);
                  setShowPartSuggestions(true);
                }}
              />

              {showPartSuggestions && searchedParts.length > 0 && (
                <View style={styles.suggestionContainer}>
                  {searchedParts.map(item => (
                    <TouchableOpacity
                      key={item.inventoryId || item.id}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setPartName(item.name);
                        setPartPrice(String(item.price || item.unitPrice || 0));
                        closeDropdowns();
                      }}
                    >
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.suggestionPrice}>₹ {item.price || item.unitPrice}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.row}>
              <View style={styles.flexTwo}>
                <Text style={styles.label}>{t("jobs.price")}</Text>
                <TextInput
                  keyboardType="numeric"
                  style={styles.input}
                  value={partPrice}
                  onChangeText={setPartPrice}
                />
              </View>

              <View style={styles.flexOne}>
                <Text style={styles.label}>{t("jobs.quantity")}</Text>
                <TextInput
                  keyboardType="numeric"
                  style={styles.input}
                  value={partQty}
                  onChangeText={setPartQty}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.addServiceBtn} onPress={addCurrentPart}>
              <Text style={styles.addServiceText}>{t("jobs.addPart")}</Text>
            </TouchableOpacity>

            {selectedParts.map((part, index) => (
              <View key={index} style={styles.selectedServiceCard}>
                <View style={styles.selectedHeader}>
                  <Text style={styles.cardTitle}>{part.name} (x{part.quantity})</Text>
                  <TouchableOpacity onPress={() => removePart(index)}>
                    <Ionicons name="trash-outline" size={22} color="#DC2626" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardSubtitle}>₹ {part.price} {t("jobs.each")}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* STEP 3: BILLING & NOTES */}
      {step === 3 && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>{t("jobs.jobDetails")}</Text>
            <Text style={styles.label}>{t("jobs.priority")}</Text>
            <View style={styles.priorityRow}>
              {["Low", "Normal", "High"].map(item => (
                <TouchableOpacity
                  key={item}
                  style={[styles.priorityButton, priority === item && styles.selectedPriority]}
                  onPress={() => setPriority(item)}
                >
                  <Text style={priority === item ? styles.priorityTextSelected : styles.priorityText}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t("jobs.expectedDelivery")}</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={deliveryDate ? styles.deliveryDateText : styles.placeholderText}>
                {deliveryDate ? formatDate(deliveryDate) : t("jobs.deliveryDate")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>{t("jobs.laborAndAdditionalCharges")}</Text>
            <View style={styles.row}>
              <View style={styles.flexOne}>
                <Text style={styles.label}>{t("jobs.laborCharge")}</Text>
                <TextInput
                  keyboardType="numeric"
                  style={styles.input}
                  value={laborCost}
                  onChangeText={setLaborCost}
                  placeholder="0"
                />
              </View>

              <View style={styles.flexOne}>
                <Text style={styles.label}>{t("jobs.discount")}</Text>
                <TextInput
                  keyboardType="numeric"
                  style={styles.input}
                  value={discount}
                  onChangeText={setDiscount}
                  placeholder="0"
                />
              </View>
            </View>

            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeButton, discountType === "percentage" && styles.selectedType]}
                onPress={() => setDiscountType("percentage")}
              >
                <Text style={discountType === "percentage" ? styles.typeButtonTextSelected : styles.typeButtonText}>
                  % {t("jobs.percentage")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, discountType === "fixed" && styles.selectedType]}
                onPress={() => setDiscountType("fixed")}
              >
                <Text style={discountType === "fixed" ? styles.typeButtonTextSelected : styles.typeButtonText}>
                  ₹ {t("jobs.fixedAmount")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.totalCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("jobs.servicesSubtotal")}</Text>
                <Text style={styles.summaryValue}>₹ {servicesSubtotal}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("jobs.partsSubtotal")}</Text>
                <Text style={styles.summaryValue}>₹ {partsSubtotal}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("jobs.laborFee")}</Text>
                <Text style={styles.summaryValue}>+ ₹ {parsedLabor}</Text>
              </View>
              {discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t("jobs.discount")}:</Text>
                  <Text style={[styles.summaryValue, styles.discountText]}>- ₹ {discountAmount.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>{t("jobs.estimatedBill")}</Text>
                <Text style={styles.totalAmount}>₹ {grandTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>{t("jobs.inspectionNotes")}</Text>
            <TextInput
              style={styles.notes}
              multiline
              placeholder={t("jobs.inspectionNotesPlaceholder")}
              value={inspectionNotes}
              onChangeText={setInspectionNotes}
              onFocus={closeDropdowns}
            />
          </View>
        </>
      )}

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

      <View style={styles.bottomBar}>
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(prev => prev - 1)}>
            <Text style={styles.backBtnText}>{t("jobs.back")}</Text>
          </TouchableOpacity>
        )}

        {step < 3 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={validateAndNextStep}>
            <Text style={styles.nextBtnText}>{t("jobs.btnNext")}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveText}>{t("jobs.updateJob")}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  </View>
);
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },

  /* Layout & Utility Flex Styles */
  flex1: { flex: 1 },
  flexOne: { flex: 1 },
  flexTwo: { flex: 2 },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  bottomSpacer: {
    height: 40,
  },

  /* Card Containers */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 16, fontWeight: "700", color: "#1F2937", marginLeft: 8
  },
  cardHeaderRow: {
    flexDirection: "row", alignItems: "center", marginBottom: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", paddingBottom: 8
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  /* Step Header Navigation Bar */
  stepHeader: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "space-between",
  },
  stepTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  activeStepTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2563EB",
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 11,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  activeStepBadge: {
    backgroundColor: "#2563EB",
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },
  activeStepBadgeText: {
    color: "#FFFFFF",
  },
  stepTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeStepTabText: {
    color: "#111827",
    fontWeight: "700",
  },

  /* Form Controls & Labels */
  heading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginTop: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6
  },
  input: {
    borderWidth: 1, borderColor: "#D1D5DB", backgroundColor: "#FFFFFF", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 12, color: "#111827"
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  notes: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    color: "#111827",
    marginBottom: 14,
  },
  deliveryDateText: {
    color: "#111827",
  },
  placeholderText: {
    color: "#9CA3AF",
  },

  /* Vehicle Type Selection Toggle */
  typeRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  selectedType: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  typeButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
  },
  typeButtonTextSelected: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 13,
  },
  selectedTypeText: {
    color: "#2563EB",
  },

  /* Auto-complete / Dropdowns */
  inputWrapper: {
    position: "relative",
    zIndex: 10,
  },
  suggestionContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    maxHeight: 200,
    zIndex: 999,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  workerSuggestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  suggestionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  suggestionPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },

  /* Add Buttons & Item Cards */
  addServiceBtn: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#2563EB",
    borderStyle: "dashed",
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  addServiceText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14,
  },
  selectedServiceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 12,
  },
  selectedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  servicePricingRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  serviceField: {
    flex: 1,
  },
  smallLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
  readOnlyPrice: {
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: "center",
  },
  readOnlyPriceText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
  },

  /* Priority Selector */
  priorityRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  selectedPriority: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  priorityText: {
    color: "#111827",
    fontWeight: "600",
  },
  priorityTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  /* Bill Summary Card */
  totalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#4B5563",
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  discountText: {
    color: "#059669",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2563EB",
  },

  /* Navigation & Action Bars */
  bottomBar: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  fixedBottomBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  backBtnText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 15,
  },
  nextBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 6,
    backgroundColor: "#2563EB",
    alignItems: "center",
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 6,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});