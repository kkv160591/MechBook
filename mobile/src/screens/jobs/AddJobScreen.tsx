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

import { useEffect, useMemo, useState, useRef } from "react"
import { Ionicons } from "@expo/vector-icons"
import { createJob } from "../../services/jobService"
import { getWorkers } from "../../services/workerService"
import { getServiceTypes } from "../../services/serviceTypesService"
import { getInventory } from "../../services/inventoryService"
import { getCustomers } from "../../services/customerService"
import {
  getPlanUsage,
  PlanUsageResponse,
} from "../../services/subscriptionService"

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

  // ==============================
  // LOADING STATES
  // ==============================

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [planUsageLoading, setPlanUsageLoading] = useState(true)
  const [planUsageError, setPlanUsageError] = useState(false)

  // ==============================
  // DATA LISTS
  // ==============================

  const [workers, setWorkers] = useState<any[]>([])
  const [serviceTypes, setServiceTypes] = useState<any[]>([])
  const [inventoryList, setInventoryList] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [planUsage, setPlanUsage] =
    useState<PlanUsageResponse | null>(null)

  // ==============================
  // CUSTOMER
  // ==============================

  const [customerId, setCustomerId] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false)

  // ==============================
  // VEHICLE
  // ==============================

  const [vehicleNumber, setVehicleNumber] = useState("")
  const [vehicleBrand, setVehicleBrand] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleType, setVehicleType] =
    useState(t("jobs.twoWheeler"))
  const [complaint, setComplaint] = useState("")
  const [odometer, setOdometer] = useState("")

  // ==============================
  // WORKER
  // ==============================

  const [workerId, setWorkerId] = useState("")
  const [workerName, setWorkerName] = useState("")
  const [showWorkerSuggestions, setShowWorkerSuggestions] =
    useState(false)

  // ==============================
  // LABOR & DISCOUNT
  // ==============================

  const [laborCost, setLaborCost] = useState<string>("")
  const [discount, setDiscount] = useState<string>("")

  // ==============================
  // JOB METADATA
  // ==============================

  const [priority, setPriority] = useState(
    t("jobs.priorityNormal")
  )

  const [deliveryDate, setDeliveryDate] =
    useState<Date | null>(null)

  const [showDatePicker, setShowDatePicker] =
    useState(false)

  const [showTimePicker, setShowTimePicker] =
    useState(false)

  const [inspectionNotes, setInspectionNotes] =
    useState("")

  // ==============================
  // SERVICES
  // ==============================

  const [selectedServices, setSelectedServices] =
    useState<any[]>([])

  const [serviceName, setServiceName] = useState("")
  const [servicePrice, setServicePrice] = useState("")

  const [showSuggestions, setShowSuggestions] =
    useState(false)

  // ==============================
  // INVENTORY / PARTS
  // ==============================

  const [selectedParts, setSelectedParts] =
    useState<any[]>([])

  const [selectedPartItem, setSelectedPartItem] =
    useState<any | null>(null)

  const [partName, setPartName] = useState("")
  const [partPrice, setPartPrice] = useState("")
  const [partQty, setPartQty] = useState("1")

  const [showPartSuggestions, setShowPartSuggestions] =
    useState(false)

  // ==============================
  // WORKER AUTO-FILL FOR WORKER LOGIN
  // ==============================

  useEffect(() => {
    if (
      user &&
      (user.userType === "worker" ||
        user.role === "worker")
    ) {
      setWorkerId(
        user.workerId ||
          user._id ||
          user.id ||
          ""
      )

      setWorkerName(
        user.name ||
          user.workerName ||
          user.ownerName ||
          ""
      )
    }
  }, [user])

  // ==============================
  // DEFAULT INVOICE SETTINGS
  // ==============================

  useEffect(() => {
    if (settings?.invoice) {
      if (
        settings.invoice.defaultLaborCost !==
        undefined
      ) {
        setLaborCost(
          String(
            settings.invoice.defaultLaborCost
          )
        )
      }

      if (
        settings.invoice.defaultDiscount !==
        undefined
      ) {
        setDiscount(
          String(
            settings.invoice.defaultDiscount
          )
        )
      }
    }
  }, [settings?.invoice])

  // ==============================
  // CLOSE DROPDOWNS
  // ==============================

  const closeDropdowns = () => {
    Keyboard.dismiss()

    setShowCustomerSuggestions(false)
    setShowSuggestions(false)
    setShowPartSuggestions(false)
    setShowWorkerSuggestions(false)

    setCustomerSearchField(null)
  }

  // ==============================
  // SEARCH WORKERS
  // ==============================

  const searchedWorkers = useMemo(() => {
    if (!workerName.trim()) {
      return workers
    }

    return workers.filter((worker) =>
      (worker.name || "")
        .toLowerCase()
        .includes(workerName.toLowerCase())
    )
  }, [workerName, workers])

  // ==============================
  // SEARCH SERVICES
  // ==============================

  const searchedServices = useMemo(() => {
    if (!serviceName.trim()) {
      return []
    }

    return serviceTypes.filter((service) =>
      (service.name || "")
        .toLowerCase()
        .includes(serviceName.toLowerCase())
    )
  }, [serviceName, serviceTypes])

  // ==============================
  // SEARCH INVENTORY PARTS
  // ==============================

  const searchedParts = useMemo(() => {
    if (!partName.trim()) {
      return []
    }

    return inventoryList.filter((item) =>
      (item.name || "")
        .toLowerCase()
        .includes(partName.toLowerCase())
    )
  }, [partName, inventoryList])

  // ==============================
  // CUSTOMER SEARCH FIELD
  // ==============================

  type CustomerSearchField = "name" | "phone" | null

  const [customerSearchField, setCustomerSearchField] =
    useState<CustomerSearchField>(null)


  // ==============================
  // CUSTOMER HELPERS
  // ==============================

  const getCustomerId = (cust: any) =>
    cust._id ||
    cust.id ||
    cust.customerId ||
    null

  const getCustomerName = (cust: any) =>
    cust.name ||
    cust.customerName ||
    ""

  const getCustomerPhone = (cust: any) =>
    cust.phone ||
    cust.phoneNumber ||
    ""

  const getCustomerAddress = (cust: any) =>
    cust.address ||
    cust.customerAddress ||
    ""


  // ==============================
  // SEARCH CUSTOMERS
  // ==============================

  const searchedCustomers = useMemo(() => {
    // IMPORTANT:
    // Only search using the field that the user
    // is currently editing.
    //
    // This prevents the old phone number from causing
    // the previously selected customer to appear again
    // when the user changes the customer name.

    if (customerSearchField === "name") {
      const searchName =
        customerName.trim().toLowerCase()

      if (!searchName) {
        return []
      }

      return customers.filter((cust) => {
        const name =
          getCustomerName(cust)
            .toLowerCase()

        return name.includes(searchName)
      })
    }

    if (customerSearchField === "phone") {
      const searchPhone =
        phone.trim()

      if (!searchPhone) {
        return []
      }

      return customers.filter((cust) => {
        const customerPhone =
          getCustomerPhone(cust)

        return customerPhone.includes(
          searchPhone
        )
      })
    }

    return []
  }, [
    customerName,
    phone,
    customers,
    customerSearchField,
  ])


  // ==============================
  // POPULATE CUSTOMER
  // ==============================

  const populateCustomer = (customer: any) => {
    const id = getCustomerId(customer)
    const name = getCustomerName(customer)
    const customerPhone = getCustomerPhone(customer)
    const address = getCustomerAddress(customer)

    setCustomerId(id)

    setCustomerName(name)

    setPhone(customerPhone)

    setCustomerAddress(address)

    setCustomerSearchField(null)

    setShowCustomerSuggestions(false)

    Keyboard.dismiss()
  }


  // ==============================
  // CUSTOMER NAME CHANGE
  // ==============================

  const handleCustomerNameChange = (
    text: string
  ) => {
    setCustomerName(text)

    // The user is manually changing the customer name.
    // Therefore the previously selected customer ID
    // is no longer valid.

    setCustomerId(null)

    // IMPORTANT:
    // Do NOT allow the old phone number to participate
    // in this search.

    setCustomerSearchField("name")

    setShowCustomerSuggestions(
      text.trim().length > 0
    )
  }


  // ==============================
  // CUSTOMER PHONE CHANGE
  // ==============================

  const handleCustomerPhoneChange = (
    text: string
  ) => {
    const cleaned =
      text.replace(
        /[^0-9]/g,
        ""
      )

    setPhone(cleaned)

    // The user is manually changing the phone number.
    // Therefore the previously selected customer ID
    // is no longer valid.

    setCustomerId(null)

    // Search ONLY by phone while editing phone.

    setCustomerSearchField("phone")

    setShowCustomerSuggestions(
      cleaned.length > 0
    )
  }

  // ==============================
  // LOAD DATA
  // ==============================

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setPlanUsageLoading(true)
      setPlanUsageError(false)

      const [
        workersRes,
        servicesRes,
        inventoryRes,
        customersRes,
        planUsageRes,
      ] = await Promise.all([
        getWorkers(),
        getServiceTypes(),
        getInventory
          ? getInventory()
          : Promise.resolve([]),
        getCustomers ? getCustomers() : Promise.resolve([]),
        getPlanUsage(),
      ])

      // ==============================
      // WORKERS
      // ==============================

      setWorkers(
        workersRes?.workers || []
      )

      // ==============================
      // SERVICES
      // ==============================

      setServiceTypes(
        servicesRes?.services || []
      )

      // ==============================
      // INVENTORY
      //
      // Supports:
      //
      // {
      //   success: true,
      //   parts: [...]
      // }
      //
      // Also supports older:
      //
      // {
      //   inventory: [...]
      // }
      //
      // or direct array response.
      // ==============================

      const inventoryParts =
        inventoryRes?.parts ||
        inventoryRes?.inventory ||
        inventoryRes ||
        []

      setInventoryList(
        Array.isArray(inventoryParts)
          ? inventoryParts
          : []
      )

      const fetchedCustomers =
        customersRes?.customers || customersRes?.data || customersRes || []
      setCustomers(Array.isArray(fetchedCustomers) ? fetchedCustomers : [])

      // ==============================
      // PLAN USAGE
      // ==============================

      setPlanUsage(
        planUsageRes || null
      )
    } catch (err: any) {
      console.log(
        "AddJob loadData error:",
        err?.response?.data || err
      )

      setPlanUsageError(true)

      Alert.alert(
        t("jobs.alertErrorTitle"),
        err?.response?.data?.message ||
          t("jobs.unableToLoadData")
      )
    } finally {
      setLoading(false)
      setPlanUsageLoading(false)
    }
  }

  // ==============================
  // PLAN LIMIT
  // ==============================

  const jobsUsed = Number(
    planUsage?.jobsUsed ?? 0
  )

  const jobsLimitRaw =
    planUsage?.jobsLimit

  const isUnlimited =
    Number(jobsLimitRaw) === -1 ||
    String(jobsLimitRaw ?? "")
      .toLowerCase() === "unlimited"

  const jobsLimit = isUnlimited
    ? null
    : Number(jobsLimitRaw ?? 0)

  const hasReachedJobLimit =
    !isUnlimited &&
    jobsLimit !== null &&
    jobsLimit > 0 &&
    jobsUsed >= jobsLimit

  // ==============================
  // SERVICE HANDLERS
  // ==============================

  const removeService = (
    index: number
  ) => {
    setSelectedServices((prev) =>
      prev.filter((_, i) => i !== index)
    )
  }

  const updateServicePrice = (
    index: number,
    value: string
  ) => {
    const numValue =
      Number(value) || 0

    setSelectedServices((prev) => {
      const copy = [...prev]

      copy[index] = {
        ...copy[index],
        estimatedPrice: numValue,
        actualPrice: numValue,
      }

      return copy
    })
  }

  const handleSelectService = (
    service: any
  ) => {
    setServiceName(
      service.name || ""
    )

    setServicePrice(
      String(
        service.defaultPrice ??
          service.price ??
          0
      )
    )

    setShowSuggestions(false)
  }

  const addCurrentService = () => {
    if (!serviceName.trim()) {
      Alert.alert(
        t("jobs.alertValidationTitle"),
        t("jobs.serviceRequired") ||
          "Please enter a service"
      )

      return
    }

    const price =
      Number(servicePrice) || 0

    setSelectedServices((prev) => [
      ...prev,
      {
        serviceId:
          null,

        name:
          serviceName.trim(),

        quantity:
          1,

        estimatedPrice:
          price,

        actualPrice:
          price,
      },
    ])

    setServiceName("")
    setServicePrice("")

    closeDropdowns()
  }

  // ==============================
  // PART HANDLERS
  // ==============================

  const handleSelectInventoryItem = (
    item: any
  ) => {
    setSelectedPartItem(item)

    setPartName(
      item.name || ""
    )

    // Your inventory API uses sellingPrice.
    //
    // Keep fallbacks for compatibility
    // with older inventory objects.

    setPartPrice(
      String(
        item.sellingPrice ??
          item.price ??
          item.unitPrice ??
          0
      )
    )

    setShowPartSuggestions(false)
  }

  const addCurrentPart = () => {
    if (!partName.trim()) {
      Alert.alert(
        t("jobs.alertErrorTitle"),
        t("jobs.valErrPartName") ||
          "Part name is required"
      )

      return
    }

    const requestedQty =
      Math.max(
        1,
        parseInt(partQty, 10) || 1
      )

    const unitPrice =
      Math.max(
        0,
        parseFloat(partPrice) || 0
      )

    // ==============================
    // INVENTORY STOCK VALIDATION
    // ==============================

    if (selectedPartItem) {
      const availableStock =
        Number(
          selectedPartItem.stock ??
            selectedPartItem.currentStock ??
            selectedPartItem.quantity ??
            0
        )

      // IMPORTANT:
      // Your API uses partId.
      //
      // Keep fallbacks for older responses.

      const partId =
        selectedPartItem.partId ||
        selectedPartItem.inventoryId ||
        selectedPartItem.id ||
        selectedPartItem._id

      const alreadyAddedQty =
        selectedParts
          .filter(
            (part) =>
              String(
                part.inventoryId
              ) ===
              String(partId)
          )
          .reduce(
            (sum, part) =>
              sum +
              Number(
                part.quantity || 0
              ),
            0
          )

      if (
        availableStock <= 0 ||
        alreadyAddedQty +
          requestedQty >
          availableStock
      ) {
        Alert.alert(
          t("jobs.outOfStock") ||
            "Out of Stock",
          t("jobs.insufficientStock") ||
            "Requested quantity exceeds available stock"
        )

        return
      }
    }

    // ==============================
    // ADD PART
    // ==============================

    const inventoryId =
      selectedPartItem
        ? selectedPartItem.partId ||
          selectedPartItem.inventoryId ||
          selectedPartItem.id ||
          selectedPartItem._id
        : null

    setSelectedParts((prev) => [
      ...prev,
      {
        inventoryId,

        // Keep partId too because the backend
        // may eventually prefer this naming.
        partId:
          inventoryId,

        name:
          partName.trim(),

        quantity:
          requestedQty,

        unitPrice,

        totalPrice:
          requestedQty *
          unitPrice,
      },
    ])

    setSelectedPartItem(null)
    setPartName("")
    setPartPrice("")
    setPartQty("1")

    closeDropdowns()
  }

  const removePart = (
    index: number
  ) => {
    setSelectedParts((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    )
  }

  // ==============================
  // DISCOUNT TYPE
  // ==============================

  const discountType =
    settings?.invoice
      ?.defaultDiscountType ||
    "percentage"

  // ==============================
  // BILLING CALCULATIONS
  // ==============================

  const servicesSubtotal = useMemo(
    () =>
      selectedServices.reduce(
        (sum, item) =>
          sum +
          Number(
            item.estimatedPrice || 0
          ),
        0
      ),
    [selectedServices]
  )

  const partsSubtotal = useMemo(
    () =>
      selectedParts.reduce(
        (sum, item) =>
          sum +
          Number(
            item.totalPrice || 0
          ),
        0
      ),
    [selectedParts]
  )

  const parsedLabor = useMemo(
    () => {
      const value =
        parseFloat(laborCost)

      return isNaN(value) ||
        value < 0
        ? 0
        : value
    },
    [laborCost]
  )

  const rawSubtotal = useMemo(
    () =>
      servicesSubtotal +
      partsSubtotal +
      parsedLabor,
    [
      servicesSubtotal,
      partsSubtotal,
      parsedLabor,
    ]
  )

  const parsedDiscount = useMemo(
    () => {
      const value =
        parseFloat(discount)

      if (
        isNaN(value) ||
        value < 0
      ) {
        return 0
      }

      return discountType ===
        "percentage"
        ? Math.min(value, 100)
        : value
    },
    [
      discount,
      discountType,
    ]
  )

  const discountAmount = useMemo(
    () => {
      if (
        discountType ===
        "percentage"
      ) {
        return (
          (rawSubtotal *
            parsedDiscount) /
          100
        )
      }

      return Math.min(
        parsedDiscount,
        rawSubtotal
      )
    },
    [
      rawSubtotal,
      parsedDiscount,
      discountType,
    ]
  )

  const grandTotal = useMemo(
    () =>
      Math.max(
        0,
        rawSubtotal -
          discountAmount
      ),
    [
      rawSubtotal,
      discountAmount,
    ]
  )

  // ==============================
  // NEXT STEP
  // ==============================

  const handleNext = () => {
    setSubmitted(true)

    if (currentStep === 1) {
      if (
        !customerName.trim() ||
        phone.trim().length !== 10 ||
        !vehicleNumber.trim() ||
        !vehicleModel.trim()
      ) {
        Alert.alert(
          t("jobs.alertValidationTitle"),
          t("jobs.fillStep1Alert")
        )

        return
      }
    }

    if (currentStep === 2) {
      if (
        selectedServices.length ===
          0 &&
        selectedParts.length ===
          0
      ) {
        Alert.alert(
          t("jobs.alertValidationTitle"),
          t(
            "jobs.atLeastOneServiceField"
          )
        )

        return
      }
    }

    setSubmitted(false)

    setCurrentStep((prev) =>
      Math.min(prev + 1, 3)
    )

    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    })
  }

  // ==============================
  // BACK
  // ==============================

  const handleBack = () => {
    setCurrentStep((prev) =>
      Math.max(prev - 1, 1)
    )

    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    })
  }

  // ==============================
  // SAVE JOB
  // ==============================

  const saveJob = async () => {
    if (hasReachedJobLimit) {
      return
    }

    try {
      setSaving(true)

      await createJob({
        customerId: customerId || null,

        customerName:
          customerName.trim(),

        phone:
          phone.trim(),

        customerAddress:
          customerAddress.trim(),

        vehicleNumber:
          vehicleNumber.trim(),

        vehicleModel:
          vehicleModel.trim(),

        vehicleBrand,

        vehicleType,

        odometer,

        complaint,

        inspectionNotes,

        workerId,

        workerName,

        priority,

        deliveryDate:
          deliveryDate
            ? deliveryDate.toISOString()
            : "",

        laborCost:
          parsedLabor,

        discount:
          parsedDiscount,

        totalAmount:
          grandTotal,

        services:
          selectedServices,

        parts:
          selectedParts,
      })

      Alert.alert(
        t("jobs.alertSuccessTitle"),
        t("jobs.alertSuccessMsg")
      )

      navigation.goBack()
    } catch (err: any) {
      Alert.alert(
        t("jobs.alertErrorTitle"),
        err?.response?.data?.message ||
          t("jobs.unableToCreateJob")
      )
    } finally {
      setSaving(false)
    }
  }

  // ==============================
  // REQUIRED LABEL
  // ==============================

  const RequiredLabel = ({
    text,
  }: {
    text: string
  }) => (
    <Text style={styles.label}>
      {text}
      <Text
        style={{
          color: "#DC2626",
        }}
      >
        {" "}
        *
      </Text>
    </Text>
  )

  // ==============================
  // LOADING
  // ==============================

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

  // ==============================
  // UI
  // ==============================

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F3F4F6",
      }}
    >
      {/* ============================== */}
      {/* STEP INDICATOR */}
      {/* ============================== */}

      <View style={styles.stepContainer}>
        {[
          {
            step: 1,
            label: t("jobs.stepCustomer"),
          },
          {
            step: 2,
            label: t("jobs.stepServices"),
          },
          {
            step: 3,
            label: t("jobs.stepBilling"),
          },
        ].map((item) => (
          <View
            key={item.step}
            style={styles.stepItem}
          >
            <View
              style={[
                styles.stepBadge,

                currentStep ===
                  item.step &&
                  styles.activeBadge,

                currentStep >
                  item.step &&
                  styles.completedBadge,
              ]}
            >
              <Text
                style={[
                  styles.stepBadgeText,

                  currentStep >=
                    item.step &&
                    styles.activeBadgeText,
                ]}
              >
                {currentStep >
                item.step
                  ? "✓"
                  : item.step}
              </Text>
            </View>

            <Text
              style={[
                styles.stepLabel,

                currentStep ===
                  item.step &&
                  styles.activeStepLabel,
              ]}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={
          closeDropdowns
        }
      >
        {/* ============================== */}
        {/* STEP 1 */}
        {/* CUSTOMER & VEHICLE */}
        {/* ============================== */}

        {currentStep === 1 && (
          <>
            {/* CUSTOMER */}
            <View style={[styles.sectionCard, { zIndex: 100 }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={20} color="#2563EB" />
                <Text style={styles.sectionHeading}>{t("jobs.customerDetails")}</Text>
              </View>

              {/* CUSTOMER NAME INPUT & SUGGESTIONS */}
              <RequiredLabel text={t("jobs.customerName")} />
              <View style={[styles.customerInputWrapper, { zIndex: 1000, elevation: 10 }]}>
                <TextInput
                  ref={customerNameRef}
                  style={[
                    styles.input,
                    submitted &&
                      !customerName.trim() &&
                      styles.inputError,
                  ]}
                  value={customerName}
                  onChangeText={handleCustomerNameChange}
                  onFocus={() => {
                    setCustomerSearchField("name")
                    setShowCustomerSuggestions(
                      customerName.trim().length > 0
                    )
                  }}
                  placeholder="Enter customer name"
                  placeholderTextColor="#9CA3AF"
                />

                {showCustomerSuggestions &&
                customerSearchField === "name" &&
                customerName.trim().length > 0 &&
                searchedCustomers.length > 0 && (
                  <View style={styles.customerSuggestionContainer}>
                    {searchedCustomers.map(
                      (customer, index) => (
                        <TouchableOpacity
                          key={
                            getCustomerId(customer) ||
                            `${getCustomerName(customer)}-${getCustomerPhone(customer)}-${index}`
                          }
                          style={styles.customerSuggestion}
                          onPress={() =>
                            populateCustomer(customer)
                          }
                          activeOpacity={0.7}
                        >
                          <View
                            style={
                              styles.customerSuggestionIcon
                            }
                          >
                            <Ionicons
                              name="person"
                              size={18}
                              color="#2563EB"
                            />
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text
                              style={
                                styles.customerSuggestionName
                              }
                            >
                              {getCustomerName(customer)}
                            </Text>

                            <Text
                              style={
                                styles.customerSuggestionPhone
                              }
                            >
                              {getCustomerPhone(customer) || "-"}
                            </Text>

                            {!!getCustomerAddress(customer) && (
                              <Text
                                style={
                                  styles.customerSuggestionAddress
                                }
                                numberOfLines={1}
                              >
                                {getCustomerAddress(customer)}
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                )}
              </View>

              {/* EXISTING CUSTOMER BADGE */}
              {customerId && (
                <View style={styles.customerFoundBadge}>
                  <Ionicons name="checkmark-circle" size={17} color="#059669" />
                  <Text style={styles.customerFoundText}>Existing customer selected</Text>
                </View>
              )}

              {/* PHONE NUMBER INPUT & SUGGESTIONS */}
              <RequiredLabel text={t("jobs.phoneNumber")} />
              <View style={[styles.customerInputWrapper, { zIndex: 100, elevation: 5 }]}>
                <TextInput
                  ref={phoneRef}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={[
                    styles.input,
                    submitted &&
                      phone.trim().length !== 10 &&
                      styles.inputError,
                  ]}
                  value={phone}
                  onChangeText={handleCustomerPhoneChange}
                  onFocus={() => {
                    setCustomerSearchField("phone")
                    setShowCustomerSuggestions(
                      phone.length > 0
                    )
                  }}
                  placeholder="Enter 10 digit phone number"
                  placeholderTextColor="#9CA3AF"
                />

                {showCustomerSuggestions &&
                  customerSearchField === "phone" &&
                  phone.length > 0 &&
                  searchedCustomers.length > 0 && (
                    <View style={styles.customerSuggestionContainer}>
                      {searchedCustomers.map(
                        (customer, index) => (
                          <TouchableOpacity
                            key={
                              getCustomerId(customer) ||
                              `${getCustomerName(customer)}-${getCustomerPhone(customer)}-${index}`
                            }
                            style={styles.customerSuggestion}
                            onPress={() =>
                              populateCustomer(customer)
                            }
                            activeOpacity={0.7}
                          >
                            <View
                              style={
                                styles.customerSuggestionIcon
                              }
                            >
                              <Ionicons
                                name="person"
                                size={18}
                                color="#2563EB"
                              />
                            </View>

                            <View style={{ flex: 1 }}>
                              <Text
                                style={
                                  styles.customerSuggestionName
                                }
                              >
                                {getCustomerName(customer)}
                              </Text>

                              <Text
                                style={
                                  styles.customerSuggestionPhone
                                }
                              >
                                {getCustomerPhone(customer) || "-"}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  )}
              </View>

              {/* CUSTOMER ADDRESS */}
              <Text style={styles.label}>{t("jobs.customerAddress")}</Text>
              <TextInput
                style={styles.input}
                value={customerAddress}
                onFocus={closeDropdowns}
                onChangeText={setCustomerAddress}
                multiline
                placeholder="Customer address"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* VEHICLE */}
            <View
              style={styles.sectionCard}
            >
              <View
                style={styles.sectionHeader}
              >
                <Ionicons
                  name="car-outline"
                  size={20}
                  color="#2563EB"
                />

                <Text
                  style={
                    styles.sectionHeading
                  }
                >
                  {t(
                    "jobs.vehicleDetails"
                  )}
                </Text>
              </View>

              <RequiredLabel
                text={t(
                  "jobs.vehicleNumber"
                )}
              />

              <TextInput
                ref={
                  vehicleNumberRef
                }
                onFocus={
                  closeDropdowns
                }
                style={[
                  styles.input,
                  submitted &&
                    !vehicleNumber.trim() &&
                    styles.inputError,
                ]}
                value={
                  vehicleNumber
                }
                onChangeText={(text) =>
                  setVehicleNumber(
                    text.toUpperCase()
                  )
                }
              />

              <View style={styles.row}>
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={styles.label}
                  >
                    {t(
                      "jobs.vehicleBrand"
                    )}
                  </Text>

                  <TextInput
                    onFocus={
                      closeDropdowns
                    }
                    style={
                      styles.input
                    }
                    value={
                      vehicleBrand
                    }
                    onChangeText={
                      setVehicleBrand
                    }
                  />
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <RequiredLabel
                    text={t(
                      "jobs.vehicleModel"
                    )}
                  />

                  <TextInput
                    ref={
                      vehicleModelRef
                    }
                    onFocus={
                      closeDropdowns
                    }
                    style={[
                      styles.input,
                      submitted &&
                        !vehicleModel.trim() &&
                        styles.inputError,
                    ]}
                    value={
                      vehicleModel
                    }
                    onChangeText={
                      setVehicleModel
                    }
                  />
                </View>
              </View>

              <Text
                style={styles.label}
              >
                {t(
                  "jobs.odometer"
                )}
              </Text>

              <TextInput
                onFocus={
                  closeDropdowns
                }
                keyboardType="numeric"
                maxLength={7}
                style={styles.input}
                value={odometer}
                onChangeText={
                  setOdometer
                }
              />

              <RequiredLabel
                text={t(
                  "jobs.vehicleType"
                )}
              />

              <View
                style={styles.typeRow}
              >
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    vehicleType ===
                      t(
                        "jobs.twoWheeler"
                      ) &&
                      styles.selectedType,
                  ]}
                  onPress={() =>
                    setVehicleType(
                      t(
                        "jobs.twoWheeler"
                      )
                    )
                  }
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      vehicleType ===
                        t(
                          "jobs.twoWheeler"
                        ) &&
                        styles.selectedTypeButtonText,
                    ]}
                  >
                    🏍{" "}
                    {t(
                      "jobs.twoWheeler"
                    )}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    vehicleType ===
                      t(
                        "jobs.fourWheeler"
                      ) &&
                      styles.selectedType,
                  ]}
                  onPress={() =>
                    setVehicleType(
                      t(
                        "jobs.fourWheeler"
                      )
                    )
                  }
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      vehicleType ===
                        t(
                          "jobs.fourWheeler"
                        ) &&
                        styles.selectedTypeButtonText,
                    ]}
                  >
                    🚗{" "}
                    {t(
                      "jobs.fourWheeler"
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* ============================== */}
        {/* STEP 2 */}
        {/* WORKER / SERVICES / PARTS */}
        {/* ============================== */}

        {currentStep === 2 && (
          <>
            {/* WORKER */}
            <View
              style={[
                styles.sectionCard,
                {
                  zIndex: 30,
                },
              ]}
            >
              <View
                style={styles.sectionHeader}
              >
                <Ionicons
                  name="people-outline"
                  size={20}
                  color="#2563EB"
                />

                <Text
                  style={
                    styles.sectionHeading
                  }
                >
                  {t(
                    "jobs.workerAndAssignment"
                  )}
                </Text>
              </View>

              <Text
                style={styles.label}
              >
                {t(
                  "jobs.assignWorker"
                )}
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    zIndex: 30,
                  },
                ]}
              >
                <TextInput
                  style={
                    styles.input
                  }
                  value={
                    workerName
                  }
                  onFocus={() =>
                    setShowWorkerSuggestions(
                      true
                    )
                  }
                  onChangeText={(text) => {
                    setWorkerName(
                      text
                    )
                    setShowWorkerSuggestions(
                      true
                    )
                  }}
                />

                {showWorkerSuggestions &&
                  searchedWorkers.length >
                    0 && (
                    <View
                      style={
                        styles.suggestionContainer
                      }
                    >
                      {searchedWorkers.map(
                        (worker) => (
                          <TouchableOpacity
                            key={
                              worker.workerId ||
                              worker._id ||
                              worker.id
                            }
                            style={
                              styles.workerSuggestion
                            }
                            onPress={() => {
                              setWorkerId(
                                worker.workerId ||
                                  worker._id ||
                                  worker.id
                              )

                              setWorkerName(
                                worker.name ||
                                  ""
                              )

                              setShowWorkerSuggestions(
                                false
                              )
                            }}
                          >
                            <Text
                              style={
                                styles.cardTitle
                              }
                            >
                              {
                                worker.name
                              }
                            </Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  )}
              </View>

              <Text
                style={styles.label}
              >
                {t(
                  "jobs.priority"
                )}
              </Text>

              <View
                style={
                  styles.priorityRow
                }
              >
                {[
                  t(
                    "jobs.priorityLow"
                  ),
                  t(
                    "jobs.priorityNormal"
                  ),
                  t(
                    "jobs.priorityHigh"
                  ),
                ].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.priorityButton,
                      priority ===
                        item &&
                        styles.selectedPriority,
                    ]}
                    onPress={() =>
                      setPriority(
                        item
                      )
                    }
                  >
                    <Text
                      style={{
                        fontWeight:
                          "600",
                        color:
                          priority ===
                          item
                            ? "white"
                            : "#374151",
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ============================== */}
            {/* SERVICES */}
            {/* ============================== */}

            <View
              style={[
                styles.sectionCard,
                {
                  zIndex: 20,
                },
              ]}
            >
              <View
                style={styles.sectionHeader}
              >
                <Ionicons
                  name="construct-outline"
                  size={20}
                  color="#2563EB"
                />

                <Text
                  style={
                    styles.sectionHeading
                  }
                >
                  {t(
                    "jobs.services"
                  )}
                </Text>
              </View>

              <View
                style={[
                  styles.row,
                  {
                    zIndex: 20,
                  },
                ]}
              >
                <View
                  style={{
                    flex: 2,
                    zIndex: 20,
                  }}
                >
                  <Text
                    style={styles.label}
                  >
                    {t(
                      "jobs.service"
                    )}
                  </Text>

                  <View
                    style={
                      styles.inputWrapper
                    }
                  >
                    <TextInput
                      style={
                        styles.input
                      }
                      value={
                        serviceName
                      }
                      onFocus={() =>
                        setShowSuggestions(
                          true
                        )
                      }
                      onChangeText={(text) => {
                        setServiceName(
                          text
                        )
                        setShowSuggestions(
                          true
                        )
                      }}
                    />

                    {showSuggestions &&
                      searchedServices.length >
                        0 && (
                        <View
                          style={
                            styles.suggestionContainer
                          }
                        >
                          {searchedServices.map(
                            (service) => (
                              <TouchableOpacity
                                key={
                                  service.serviceTypeId ||
                                  service.id
                                }
                                style={
                                  styles.suggestionItem
                                }
                                onPress={() =>
                                  handleSelectService(
                                    service
                                  )
                                }
                              >
                                <Text
                                  style={
                                    styles.cardTitle
                                  }
                                >
                                  {
                                    service.name
                                  }
                                </Text>

                                <Text
                                  style={
                                    styles.suggestionPrice
                                  }
                                >
                                  ₹{" "}
                                  {
                                    service.defaultPrice ??
                                    service.price ??
                                    0
                                  }
                                </Text>
                              </TouchableOpacity>
                            )
                          )}
                        </View>
                      )}
                  </View>
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={styles.label}
                  >
                    {t(
                      "jobs.estimatePrice"
                    )}
                  </Text>

                  <TextInput
                    keyboardType="numeric"
                    style={
                      styles.input
                    }
                    value={
                      servicePrice
                    }
                    onChangeText={
                      setServicePrice
                    }
                  />
                </View>
              </View>

              <TouchableOpacity
                style={
                  styles.addServiceBtn
                }
                onPress={
                  addCurrentService
                }
              >
                <Ionicons
                  name="add-circle-outline"
                  size={18}
                  color="#FFF"
                  style={{
                    marginRight: 6,
                  }}
                />

                <Text
                  style={
                    styles.addServiceText
                  }
                >
                  {t(
                    "jobs.addService"
                  )}
                </Text>
              </TouchableOpacity>

              {selectedServices.map(
                (
                  service,
                  index
                ) => (
                  <View
                    key={index}
                    style={
                      styles.selectedServiceCard
                    }
                  >
                    <View
                      style={
                        styles.selectedHeader
                      }
                    >
                      <Text
                        style={
                          styles.cardTitle
                        }
                      >
                        {
                          service.name
                        }
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          removeService(
                            index
                          )
                        }
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#DC2626"
                        />
                      </TouchableOpacity>
                    </View>

                    <View
                      style={
                        styles.rowAlign
                      }
                    >
                      <Text
                        style={
                          styles.smallLabel
                        }
                      >
                        Cost (₹):
                      </Text>

                      <TextInput
                        style={
                          styles.inlinePriceInput
                        }
                        keyboardType="numeric"
                        value={String(
                          service.estimatedPrice
                        )}
                        onChangeText={(
                          text
                        ) =>
                          updateServicePrice(
                            index,
                            text
                          )
                        }
                      />
                    </View>
                  </View>
                )
              )}
            </View>

            {/* ============================== */}
            {/* SPARE PARTS / INVENTORY */}
            {/* ============================== */}

            <View
              style={[
                styles.sectionCard,
                {
                  zIndex: 10,
                },
              ]}
            >
              <View
                style={styles.sectionHeader}
              >
                <Ionicons
                  name="cube-outline"
                  size={20}
                  color="#2563EB"
                />

                <Text
                  style={
                    styles.sectionHeading
                  }
                >
                  {t(
                    "jobs.sparePartsAndInventory"
                  )}
                </Text>
              </View>

              <Text
                style={styles.label}
              >
                {t(
                  "jobs.partName"
                )}
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    zIndex: 10,
                  },
                ]}
              >
                <TextInput
                  style={
                    styles.input
                  }
                  value={
                    partName
                  }
                  onFocus={() =>
                    setShowPartSuggestions(
                      true
                    )
                  }
                  onChangeText={(text) => {
                    setPartName(
                      text
                    )
                    setSelectedPartItem(
                      null
                    )
                    setShowPartSuggestions(
                      true
                    )
                  }}
                />

                {showPartSuggestions &&
                  searchedParts.length >
                    0 && (
                    <View
                      style={
                        styles.suggestionContainer
                      }
                    >
                      {searchedParts.map(
                        (item) => {
                          const price =
                            item.sellingPrice ??
                            item.price ??
                            item.unitPrice ??
                            0

                          const stock =
                            item.stock ??
                            item.currentStock ??
                            item.quantity ??
                            0

                          return (
                            <TouchableOpacity
                              key={
                                item.partId ||
                                item.inventoryId ||
                                item.id ||
                                item._id
                              }
                              style={
                                styles.suggestionItem
                              }
                              onPress={() =>
                                handleSelectInventoryItem(
                                  item
                                )
                              }
                            >
                              <View
                                style={{
                                  flex: 1,
                                }}
                              >
                                <Text
                                  style={
                                    styles.cardTitle
                                  }
                                >
                                  {
                                    item.name
                                  }
                                </Text>

                                {!!item.sku && (
                                  <Text
                                    style={
                                      styles.suggestionSubText
                                    }
                                  >
                                    SKU:{" "}
                                    {
                                      item.sku
                                    }
                                  </Text>
                                )}

                                <Text
                                  style={
                                    styles.stockText
                                  }
                                >
                                  Stock:{" "}
                                  {
                                    stock
                                  }
                                </Text>
                              </View>

                              <Text
                                style={
                                  styles.suggestionPrice
                                }
                              >
                                ₹{" "}
                                {
                                  price
                                }
                              </Text>
                            </TouchableOpacity>
                          )
                        }
                      )}
                    </View>
                  )}
              </View>

              <View
                style={styles.row}
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={styles.label}
                  >
                    {t(
                      "jobs.quantity"
                    )}
                  </Text>

                  <TextInput
                    keyboardType="numeric"
                    style={
                      styles.input
                    }
                    value={
                      partQty
                    }
                    onChangeText={(
                      text
                    ) =>
                      setPartQty(
                        text.replace(
                          /[^0-9]/g,
                          ""
                        )
                      )
                    }
                  />
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={styles.label}
                  >
                    {t(
                      "jobs.unitPrice"
                    )}
                  </Text>

                  <TextInput
                    keyboardType="numeric"
                    style={
                      styles.input
                    }
                    value={
                      partPrice
                    }
                    onChangeText={
                      setPartPrice
                    }
                  />
                </View>
              </View>

              {/* SELECTED PART INFO */}
              {selectedPartItem && (
                <View
                  style={
                    styles.selectedInventoryInfo
                  }
                >
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={
                        styles.selectedInventoryName
                      }
                    >
                      {
                        selectedPartItem.name
                      }
                    </Text>

                    <Text
                      style={
                        styles.selectedInventoryStock
                      }
                    >
                      Available stock:{" "}
                      {Number(
                        selectedPartItem.stock ??
                          selectedPartItem.currentStock ??
                          selectedPartItem.quantity ??
                          0
                      )}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.selectedInventoryPrice
                    }
                  >
                    ₹{" "}
                    {Number(
                      selectedPartItem.sellingPrice ??
                        selectedPartItem.price ??
                        selectedPartItem.unitPrice ??
                        0
                    )}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={
                  styles.addServiceBtn
                }
                onPress={
                  addCurrentPart
                }
              >
                <Ionicons
                  name="add-circle-outline"
                  size={18}
                  color="#FFF"
                  style={{
                    marginRight: 6,
                  }}
                />

                <Text
                  style={
                    styles.addServiceText
                  }
                >
                  {t(
                    "jobs.addPart"
                  )}
                </Text>
              </TouchableOpacity>

              {selectedParts.map(
                (
                  part,
                  index
                ) => (
                  <View
                    key={index}
                    style={
                      styles.selectedServiceCard
                    }
                  >
                    <View
                      style={
                        styles.selectedHeader
                      }
                    >
                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={
                            styles.cardTitle
                          }
                        >
                          {
                            part.name
                          }
                        </Text>

                        <Text
                          style={
                            styles.partIdText
                          }
                        >
                          {part.quantity} x ₹
                          {
                            part.unitPrice
                          }
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          removePart(
                            index
                          )
                        }
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#DC2626"
                        />
                      </TouchableOpacity>
                    </View>

                    <View
                      style={
                        styles.totalRow
                      }
                    >
                      <Text
                        style={
                          styles.totalServiceText
                        }
                      >
                        {part.quantity} x ₹
                        {
                          part.unitPrice
                        }
                      </Text>

                      <Text
                        style={
                          styles.totalServicePrice
                        }
                      >
                        ₹{" "}
                        {
                          part.totalPrice
                        }
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>
          </>
        )}

        {/* ============================== */}
        {/* STEP 3 */}
        {/* BILLING */}
        {/* ============================== */}

        {currentStep === 3 && (
          <>
            <View
              style={styles.sectionCard}
            >
              <View
                style={styles.sectionHeader}
              >
                <Ionicons
                  name="receipt-outline"
                  size={20}
                  color="#2563EB"
                />

                <Text
                  style={
                    styles.sectionHeading
                  }
                >
                  {t(
                    "jobs.laborAndAdditionalCharges"
                  )}
                </Text>
              </View>

              <View
                style={styles.row}
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={styles.label}
                  >
                    {t(
                      "jobs.laborCharge"
                    )}
                  </Text>

                  <TextInput
                    keyboardType="numeric"
                    style={
                      styles.input
                    }
                    value={
                      laborCost
                    }
                    onChangeText={
                      setLaborCost
                    }
                  />
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={styles.label}
                  >
                    {t(
                      "jobs.discountPercent"
                    )}
                  </Text>

                  <TextInput
                    keyboardType="numeric"
                    style={
                      styles.input
                    }
                    value={
                      discount
                    }
                    onChangeText={
                      setDiscount
                    }
                  />
                </View>
              </View>

              <View
                style={
                  styles.totalCard
                }
              >
                <View
                  style={
                    styles.summaryRow
                  }
                >
                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    {t(
                      "jobs.servicesSubtotal"
                    )}
                  </Text>

                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    ₹{" "}
                    {servicesSubtotal.toFixed(
                      2
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryRow
                  }
                >
                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    {t(
                      "jobs.partsSubtotal"
                    )}
                  </Text>

                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    + ₹{" "}
                    {partsSubtotal.toFixed(
                      2
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryRow
                  }
                >
                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    {t(
                      "jobs.laborFee"
                    )}
                  </Text>

                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    + ₹{" "}
                    {parsedLabor.toFixed(
                      2
                    )}
                  </Text>
                </View>

                {parsedDiscount >
                  0 && (
                  <View
                    style={
                      styles.summaryRow
                    }
                  >
                    <Text
                      style={[
                        styles.summaryLabel,
                        {
                          color:
                            "#DC2626",
                        },
                      ]}
                    >
                      Discount{" "}
                      {discountType ===
                      "percentage"
                        ? `(${parsedDiscount}%)`
                        : ""}
                    </Text>

                    <Text
                      style={[
                        styles.summaryValue,
                        {
                          color:
                            "#DC2626",
                        },
                      ]}
                    >
                      - ₹{" "}
                      {discountAmount.toFixed(
                        2
                      )}
                    </Text>
                  </View>
                )}

                <View
                  style={
                    styles.divider
                  }
                />

                <View
                  style={
                    styles.summaryRow
                  }
                >
                  <Text
                    style={
                      styles.totalLabel
                    }
                  >
                    {t(
                      "jobs.estimatedBill"
                    )}
                  </Text>

                  <Text
                    style={
                      styles.totalAmount
                    }
                  >
                    ₹{" "}
                    {grandTotal.toFixed(
                      2
                    )}
                  </Text>
                </View>
              </View>
            </View>

            {/* COMPLAINT / NOTES */}
            <View
              style={styles.sectionCard}
            >
              <View
                style={styles.sectionHeader}
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#2563EB"
                />

                <Text
                  style={
                    styles.sectionHeading
                  }
                >
                  {t(
                    "jobs.customerComplaint"
                  )}
                </Text>
              </View>

              <TextInput
                multiline
                style={styles.notes}
                value={
                  complaint
                }
                onChangeText={
                  setComplaint
                }
              />

              <Text
                style={[
                  styles.sectionHeading,
                  {
                    fontSize: 15,
                    marginTop: 16,
                    marginLeft: 0,
                  },
                ]}
              >
                {t(
                  "jobs.inspectionNotes"
                )}
              </Text>

              <TextInput
                multiline
                style={styles.notes}
                value={
                  inspectionNotes
                }
                onChangeText={
                  setInspectionNotes
                }
              />
            </View>
          </>
        )}

        <View
          style={{
            height: 100,
          }}
        />
      </ScrollView>

      {/* ============================== */}
      {/* FOOTER */}
      {/* ============================== */}

      <View
        style={styles.footerBar}
      >
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={
              handleBack
            }
          >
            <Text
              style={
                styles.backBtnText
              }
            >
              {t(
                "jobs.btnBack"
              )}
            </Text>
          </TouchableOpacity>
        )}

        {currentStep < 3 ? (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={
              handleNext
            }
          >
            <Text
              style={
                styles.nextBtnText
              }
            >
              {t(
                "jobs.btnNext"
              )}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.saveBtn,
              hasReachedJobLimit && {
                backgroundColor:
                  "#9CA3AF",
              },
            ]}
            disabled={
              saving ||
              hasReachedJobLimit
            }
            onPress={
              saveJob
            }
          >
            {saving ? (
              <ActivityIndicator
                color="white"
              />
            ) : (
              <Text
                style={
                  styles.saveText
                }
              >
                {t(
                  "jobs.createJob"
                )}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

// ==============================
// STYLES
// ==============================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  stepContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },

  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  activeBadge: {
    backgroundColor: "#2563EB",
  },

  completedBadge: {
    backgroundColor: "#059669",
  },

  stepBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },

  activeBadgeText: {
    color: "#FFF",
  },

  stepLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },

  activeStepLabel: {
    color: "#111827",
    fontWeight: "700",
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 8,
  },

  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
    color: "#111827",
  },

  inputError: {
    borderColor: "#DC2626",
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },

  typeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#FFF",
  },

  selectedType: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },

  typeButtonText: {
    fontWeight: "500",
    color: "#374151",
  },

  selectedTypeButtonText: {
    color: "#2563EB",
    fontWeight: "700",
  },

  priorityRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  priorityButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    alignItems: "center",
  },

  selectedPriority: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  inputWrapper: {
    position: "relative",
  },

  suggestionContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    zIndex: 1000,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },

  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  workerSuggestion: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  suggestionPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
    marginLeft: 12,
  },

  suggestionSubText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },

  stockText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
    marginTop: 3,
  },

  selectedInventoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  selectedInventoryName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E3A8A",
  },

  selectedInventoryStock: {
    fontSize: 11,
    color: "#2563EB",
    marginTop: 3,
  },

  selectedInventoryPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },

  partIdText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 3,
  },

  addServiceBtn: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },

  addServiceText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },

  selectedServiceCard: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },

  selectedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rowAlign: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },

  smallLabel: {
    fontSize: 13,
    color: "#4B5563",
  },

  inlinePriceInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    minWidth: 80,
    textAlign: "right",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  totalServiceText: {
    fontWeight: "500",
    color: "#4B5563",
    fontSize: 13,
  },

  totalServicePrice: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 13,
  },

  totalCard: {
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 12,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  summaryLabel: {
    color: "#4B5563",
    fontSize: 13,
  },

  summaryValue: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 13,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  totalAmount: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2563EB",
  },

  notes: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 10,
    height: 70,
    textAlignVertical: "top",
    fontSize: 14,
  },

  footerBar: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },

  backBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },

  backBtnText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 15,
  },

  nextBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    alignItems: "center",
  },

  nextBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },

  saveBtn: {
    flex: 2,
    backgroundColor: "#059669",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  saveText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },

  customerInputWrapper: {
    position: "relative",
  },
  customerSuggestionContainer: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 9999,
  },
  customerSuggestion: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  customerSuggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  customerSuggestionName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  customerSuggestionPhone: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  customerSuggestionAddress: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 1,
  },
  customerFoundBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
    marginTop: -4,
  },
  customerFoundText: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "600",
    marginLeft: 6,
  }
})