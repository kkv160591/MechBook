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

import { updateJob, getJobById } from "../../services/jobService"

import { getWorkers } from "../../services/workerService"

import { getServiceTypes } from "../../services/serviceTypesService"

import { getInventory } from "../../services/inventoryService"

import { getCustomers } from "../../services/customerService"

import { useSettings } from "../../context/SettingsContext"
import { useTranslation } from "../../context/LanguageContext"

import DateTimePicker from "@react-native-community/datetimepicker"

export default function EditJobScreen({ route, navigation }: any) {
  const { job } = route.params

  const [currentStep, setCurrentStep] = useState<number>(1)

  const [submitted, setSubmitted] = useState(false)

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

  // ==============================
  // DATA LISTS
  // ==============================

  const [workers, setWorkers] = useState<any[]>([])
  const [serviceTypes, setServiceTypes] = useState<any[]>([])
  const [inventoryList, setInventoryList] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])

  // ==============================
  // CUSTOMER
  // ==============================

  const [customerId, setCustomerId] = useState<string | null>(null)

  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")

  const [showCustomerSuggestions, setShowCustomerSuggestions] =
    useState(false)

  // ==============================
  // VEHICLE
  // ==============================

  const [vehicleNumber, setVehicleNumber] = useState("")
  const [vehicleBrand, setVehicleBrand] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")

  const [vehicleType, setVehicleType] = useState(t("jobs.twoWheeler"))

  const [complaint, setComplaint] = useState("")
  const [odometer, setOdometer] = useState("")

  // ==============================
  // WORKER
  // ==============================

  const [workerId, setWorkerId] = useState("")
  const [workerName, setWorkerName] = useState("")

  const [showWorkerSuggestions, setShowWorkerSuggestions] = useState(false)

  // ==============================
  // LABOR & DISCOUNT
  // ==============================

  const [laborCost, setLaborCost] = useState<string>("")

  const [discount, setDiscount] = useState<string>("")

  // ==============================
  // JOB METADATA
  // ==============================

  const [priority, setPriority] = useState(t("jobs.priorityNormal"))

  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)

  const [showDatePicker, setShowDatePicker] = useState(false)

  const [showTimePicker, setShowTimePicker] = useState(false)

  const [inspectionNotes, setInspectionNotes] = useState("")

  // ==============================
  // SERVICES
  // ==============================

  const [selectedServices, setSelectedServices] = useState<any[]>([])

  const [serviceName, setServiceName] = useState("")

  const [servicePrice, setServicePrice] = useState("")

  const [showSuggestions, setShowSuggestions] = useState(false)

  // ==============================
  // PARTS
  // ==============================

  const [selectedParts, setSelectedParts] = useState<any[]>([])

  const [selectedPartItem, setSelectedPartItem] = useState<any | null>(null)

  const [partName, setPartName] = useState("")

  const [partPrice, setPartPrice] = useState("")

  const [partQty, setPartQty] = useState("1")

  const [showPartSuggestions, setShowPartSuggestions] = useState(false)

  // Keep a snapshot of the parts that existed when the job was loaded.
  // This is needed because editing a job is different from creating a job.
  const originalPartsRef = useRef<any[]>([])

  // ==============================
  // LOAD DATA
  // ==============================

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const [
        workersRes,
        servicesRes,
        inventoryRes,
        customersRes,
        jobRes,
      ] = await Promise.all([
        getWorkers(),
        getServiceTypes(),
        getInventory(),
        getCustomers(),
        getJobById(job.jobId),
      ])

      const latestJob = jobRes?.job || jobRes

      const workersData =
        workersRes?.workers ||
        workersRes ||
        []

      const servicesData =
        servicesRes?.services ||
        servicesRes ||
        []

      const rawInventory =
        inventoryRes?.parts ||
        inventoryRes?.inventory ||
        inventoryRes?.items ||
        inventoryRes?.data ||
        []

      const customersData =
        customersRes?.customers ||
        customersRes?.customersList ||
        customersRes?.data ||
        customersRes ||
        []

      setWorkers(
        Array.isArray(workersData)
          ? workersData
          : [],
      )

      setServiceTypes(
        Array.isArray(servicesData)
          ? servicesData
          : [],
      )

      setInventoryList(
        Array.isArray(rawInventory)
          ? rawInventory
          : [],
      )

      setCustomers(
        Array.isArray(customersData)
          ? customersData
          : [],
      )

      // ==============================
      // POPULATE CUSTOMER
      // ==============================

      setCustomerId(
        latestJob?.customerId ||
        latestJob?.customer?.customerId ||
        latestJob?.customer?._id ||
        latestJob?.customer?.id ||
        null,
      )

      setCustomerName(
        latestJob?.customerName ||
        latestJob?.customer?.name ||
        "",
      )

      setPhone(
        latestJob?.phone ||
        latestJob?.customer?.phone ||
        latestJob?.customer?.phoneNumber ||
        "",
      )

      setCustomerAddress(
        latestJob?.customerAddress ||
        latestJob?.customer?.address ||
        "",
      )

      // ==============================
      // POPULATE VEHICLE
      // ==============================

      setVehicleNumber(
        latestJob?.vehicleNumber || "",
      )

      setVehicleBrand(
        latestJob?.vehicleBrand || "",
      )

      setVehicleModel(
        latestJob?.vehicleModel || "",
      )

      setVehicleType(
        latestJob?.vehicleType ||
        t("jobs.twoWheeler"),
      )

      setOdometer(
        latestJob?.odometer !== undefined
          ? String(latestJob.odometer)
          : "",
      )

      setComplaint(
        latestJob?.complaint || "",
      )

      // ==============================
      // POPULATE WORKER
      // ==============================

      setWorkerId(
        latestJob?.workerId || "",
      )

      const assignedWorker = workersData.find(
        (worker: any) =>
          String(
            worker.workerId ||
            worker.id ||
            worker._id,
          ) ===
          String(latestJob?.workerId),
      )

      setWorkerName(
        latestJob?.workerName ||
        assignedWorker?.name ||
        "",
      )

      // ==============================
      // JOB DETAILS
      // ==============================

      setPriority(
        latestJob?.priority ||
        t("jobs.priorityNormal"),
      )

      if (
        latestJob?.deliveryDate &&
        latestJob.deliveryDate !== ""
      ) {
        const parsedDate = new Date(
          latestJob.deliveryDate,
        )

        if (!isNaN(parsedDate.getTime())) {
          setDeliveryDate(parsedDate)
        } else {
          setDeliveryDate(null)
        }
      } else {
        setDeliveryDate(null)
      }

      setInspectionNotes(
        latestJob?.inspectionNotes || "",
      )

      // ==============================
      // SERVICES
      // ==============================

      const loadedServices =
        Array.isArray(latestJob?.services)
          ? latestJob.services.map(
              (service: any) => {
                const estimatedPrice = Number(
                  service.estimatedPrice ??
                    service.defaultPrice ??
                    service.actualPrice ??
                    0,
                )

                const actualPrice = Number(
                  service.actualPrice ??
                    service.estimatedPrice ??
                    service.defaultPrice ??
                    0,
                )

                return {
                  serviceId:
                    service.serviceTypeId ||
                    service.serviceId ||
                    service.id ||
                    service._id ||
                    null,

                  name:
                    service.name || "",

                  quantity:
                    Number(service.quantity) || 1,

                  estimatedPrice,

                  actualPrice,
                }
              },
            )
          : []

      setSelectedServices(
        loadedServices,
      )

      // ==============================
      // PARTS
      // ==============================

      const loadedParts =
        Array.isArray(latestJob?.parts)
          ? latestJob.parts.map(
              (part: any) => {
                const quantity =
                  Number(part.quantity) || 1

                const inventoryId =
                  part.partId ||
                  part.inventoryId ||
                  part.id ||
                  part._id ||
                  null

                const estimatedUnitPrice =
                  Number(
                    part.estimatedUnitPrice ??
                      part.unitPrice ??
                      part.sellingPrice ??
                      part.price ??
                      0,
                  )

                const actualUnitPrice =
                  Number(
                    part.actualUnitPrice ??
                      part.unitPrice ??
                      part.sellingPrice ??
                      part.price ??
                      0,
                  )

                return {
                  inventoryId,

                  partId: inventoryId,

                  name:
                    part.name || "",

                  quantity,

                  estimatedUnitPrice,

                  actualUnitPrice,

                  totalPrice: Number(
                    part.totalPrice ??
                      quantity *
                        actualUnitPrice,
                  ),
                }
              },
            )
          : []

      setSelectedParts(
        loadedParts,
      )

      // Preserve the original state of the job's parts.
      originalPartsRef.current =
        loadedParts.map(
          (part: any) => ({
            ...part,
          }),
        )

      // ==============================
      // BILLING
      // ==============================

      setLaborCost(
        latestJob?.laborCost !==
          undefined &&
          latestJob?.laborCost !== null
          ? String(
              latestJob.laborCost,
            )
          : "",
      )

      setDiscount(
        latestJob?.discount !==
          undefined &&
          latestJob?.discount !== null
          ? String(
              latestJob.discount,
            )
          : "",
      )
    } catch (err: any) {
      Alert.alert(
        t("jobs.alertErrorTitle"),

        err?.response?.data?.message ||
          t(
            "jobs.unableToLoadJobDetails",
          ) ||
          "Unable to load job details",
      )
    } finally {
      setLoading(false)
    }
  }

  // ==============================
  // CLOSE DROPDOWNS
  // ==============================

  const closeDropdowns = () => {
    Keyboard.dismiss()

    setShowCustomerSuggestions(false)

    setShowSuggestions(false)

    setShowWorkerSuggestions(false)

    setShowPartSuggestions(false)
  }

  // ==============================
  // CUSTOMER HELPERS
  // ==============================

  const getCustomerId = (customer: any) => {
    return (
      customer?.customerId ||
      customer?.id ||
      customer?._id ||
      null
    )
  }

  const searchedCustomers = useMemo(() => {
    const nameQuery =
      customerName.trim().toLowerCase()

    const phoneQuery =
      phone.trim()

    if (
      !nameQuery &&
      !phoneQuery
    ) {
      return []
    }

    if (!Array.isArray(customers)) {
      return []
    }

    return customers
      .filter((customer: any) => {
        const customerCustomerName =
          String(
            customer?.name ||
              customer?.customerName ||
              "",
          ).toLowerCase()

        const customerPhone =
          String(
            customer?.phone ||
              customer?.phoneNumber ||
              "",
          )

        const nameMatch =
          !!nameQuery &&
          customerCustomerName.includes(
            nameQuery,
          )

        const phoneMatch =
          !!phoneQuery &&
          customerPhone.includes(
            phoneQuery,
          )

        return (
          nameMatch ||
          phoneMatch
        )
      })
      .slice(0, 10)
  }, [
    customerName,
    phone,
    customers,
  ])

  const populateCustomer = (
    customer: any,
  ) => {
    const selectedId =
      getCustomerId(customer)

    setCustomerId(
      selectedId,
    )

    setCustomerName(
      customer?.name ||
        customer?.customerName ||
        "",
    )

    setPhone(
      customer?.phone ||
        customer?.phoneNumber ||
        "",
    )

    setCustomerAddress(
      customer?.address ||
        customer?.customerAddress ||
        "",
    )

    setShowCustomerSuggestions(
      false,
    )
  }

  const handleCustomerNameChange = (
    text: string,
  ) => {
    setCustomerName(text)

    // Manual modification means the old
    // customer selection may no longer match.
    setCustomerId(null)

    setShowCustomerSuggestions(
      text.trim().length > 0,
    )
  }

  const handleCustomerPhoneChange = (
    text: string,
  ) => {
    const cleaned = text.replace(
      /[^0-9]/g,
      "",
    )

    setPhone(cleaned)

    setCustomerId(null)

    setShowCustomerSuggestions(
      cleaned.length > 0,
    )
  }

  // ==============================
  // SEARCH WORKERS
  // ==============================

  const searchedWorkers = useMemo(() => {
    if (
      !workerName.trim() ||
      !Array.isArray(workers)
    ) {
      return workers || []
    }

    return workers.filter(
      (worker) =>
        (
          worker?.name || ""
        )
          .toLowerCase()
          .includes(
            workerName.toLowerCase(),
          ),
    )
  }, [
    workerName,
    workers,
  ])

  // ==============================
  // SEARCH SERVICES
  // ==============================

  const searchedServices = useMemo(() => {
    const query =
      serviceName.trim().toLowerCase()

    if (!query) {
      return []
    }

    if (!Array.isArray(serviceTypes)) {
      return []
    }

    return serviceTypes
      .filter((service: any) => {
        const name =
          String(
            service?.name || "",
          ).toLowerCase()

        const category =
          String(
            service?.category || "",
          ).toLowerCase()

        return (
          name.includes(query) ||
          category.includes(query)
        )
      })
      .slice(0, 10)
  }, [
    serviceName,
    serviceTypes,
  ])

  // ==============================
  // SEARCH PARTS
  // ==============================

  const searchedParts = useMemo(() => {
    const query =
      partName.trim().toLowerCase()

    if (
      !query ||
      !Array.isArray(inventoryList)
    ) {
      return []
    }

    return inventoryList
      .filter((item: any) =>
        String(
          item?.name || "",
        )
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 10)
  }, [
    partName,
    inventoryList,
  ])

  // ==============================
  // INVENTORY HELPERS
  // ==============================

  const getInventoryId = (
    item: any,
  ) => {
    return (
      item?.partId ||
      item?.inventoryId ||
      item?.id ||
      item?._id ||
      null
    )
  }

  const getInventoryStock = (
    item: any,
  ) => {
    return Number(
      item?.stock ??
        item?.currentStock ??
        item?.quantity ??
        0,
    )
  }

  const getInventoryPrice = (
    item: any,
  ) => {
    return Number(
      item?.sellingPrice ??
        item?.price ??
        item?.unitPrice ??
        0,
    )
  }

  // ==============================
  // SERVICE HANDLERS
  // ==============================

  const removeService = (
    index: number,
  ) => {
    setSelectedServices(
      (prev) =>
        prev.filter(
          (_, i) =>
            i !== index,
        ),
    )
  }

  const updateActualServicePrice = (
    index: number,
    value: string,
  ) => {
    const numValue =
      Number(value) || 0

    setSelectedServices(
      (prev) => {
        const copy = [
          ...prev,
        ]

        copy[index] = {
          ...copy[index],
          actualPrice:
            numValue,
        }

        return copy
      },
    )
  }

  const handleSelectService = (
    service: any,
  ) => {
    const serviceId =
      service?.serviceTypeId ||
      service?.serviceId ||
      service?.id ||
      service?._id ||
      null

    const price = Number(
      service?.defaultPrice ??
        service?.price ??
        service?.estimatedPrice ??
        0,
    )

    setServiceName(
      String(
        service?.name || "",
      ),
    )

    setServicePrice(
      String(price),
    )

    setShowSuggestions(false)

    setShowWorkerSuggestions(
      false,
    )

    setShowPartSuggestions(
      false,
    )

    setShowCustomerSuggestions(
      false,
    )
  }

  const addCurrentService = () => {
    if (!serviceName.trim()) {
      Alert.alert(
        t("jobs.alertValidationTitle"),

        t("jobs.serviceRequired") ||
          "Please enter a service",
      )

      return
    }

    const price =
      Number(servicePrice) || 0

    const matchedService =
      serviceTypes.find(
        (service: any) =>
          String(
            service?.name || "",
          )
            .trim()
            .toLowerCase() ===
          serviceName
            .trim()
            .toLowerCase(),
      )

    const serviceId =
      matchedService?.serviceTypeId ||
      matchedService?.serviceId ||
      matchedService?.id ||
      matchedService?._id ||
      null

    setSelectedServices(
      (prev) => [
        ...prev,
        {
          serviceId,

          name:
            serviceName.trim(),

          quantity: 1,

          estimatedPrice:
            price,

          actualPrice:
            price,
        },
      ],
    )

    setServiceName("")

    setServicePrice("")

    closeDropdowns()
  }

  // ==============================
  // PART HANDLERS
  // ==============================

  const handleSelectInventoryItem = (
    item: any,
  ) => {
    setSelectedPartItem(item)

    setPartName(
      item?.name || "",
    )

    setPartPrice(
      String(
        getInventoryPrice(item),
      ),
    )

    setShowPartSuggestions(
      false,
    )

    setShowSuggestions(
      false,
    )

    setShowWorkerSuggestions(
      false,
    )

    setShowCustomerSuggestions(
      false,
    )
  }

  const addCurrentPart = () => {
    if (!partName.trim()) {
      Alert.alert(
        t("jobs.alertErrorTitle"),

        t("jobs.valErrPartName") ||
          "Part name is required",
      )

      return
    }

    const requestedQty =
      parseInt(partQty) || 1

    if (requestedQty <= 0) {
      Alert.alert(
        t("jobs.alertErrorTitle"),
        "Quantity must be greater than 0",
      )

      return
    }

    const price =
      parseFloat(partPrice) || 0

    // ==========================================
    // STOCK CHECK FOR EDIT MODE
    // ==========================================
    //
    // Existing job parts may already have been
    // deducted from inventory.
    //
    // Therefore we only check the quantity that
    // is ADDITIONAL to the original job quantity.
    //

    if (selectedPartItem) {
      const partId =
        getInventoryId(
          selectedPartItem,
        )

      const availableStock =
        getInventoryStock(
          selectedPartItem,
        )

      const originalQtyForPart =
        originalPartsRef.current
          .filter(
            (part: any) =>
              String(
                part?.inventoryId,
              ) ===
              String(partId),
          )
          .reduce(
            (
              sum: number,
              part: any,
            ) =>
              sum +
              Number(
                part?.quantity || 0,
              ),
            0,
          )

      const currentQtyForPart =
        selectedParts
          .filter(
            (part: any) =>
              String(
                part?.inventoryId,
              ) ===
              String(partId),
          )
          .reduce(
            (
              sum: number,
              part: any,
            ) =>
              sum +
              Number(
                part?.quantity || 0,
              ),
            0,
          )

      const additionalQty =
        Math.max(
          0,
          currentQtyForPart +
            requestedQty -
            originalQtyForPart,
        )

      if (
        additionalQty > 0 &&
        availableStock <
          additionalQty
      ) {
        Alert.alert(
          t("jobs.outOfStock") ||
            "Insufficient Stock",

          t(
            "jobs.insufficientStock",
          ) ||
            `Only ${availableStock} additional units are available`,
        )

        return
      }
    }

    const inventoryId =
      selectedPartItem
        ? getInventoryId(
            selectedPartItem,
          )
        : null

    setSelectedParts(
      (prev) => [
        ...prev,
        {
          inventoryId,

          partId:
            inventoryId,

          name:
            partName.trim(),

          quantity:
            requestedQty,

          estimatedUnitPrice:
            price,

          actualUnitPrice:
            price,

          totalPrice:
            requestedQty *
            price,
        },
      ],
    )

    setSelectedPartItem(
      null,
    )

    setPartName("")

    setPartPrice("")

    setPartQty("1")

    closeDropdowns()
  }

  const removePart = (
    index: number,
  ) => {
    setSelectedParts(
      (prev) =>
        prev.filter(
          (_, i) =>
            i !== index,
        ),
    )
  }

  const updatePartQuantity = (
    index: number,
    qtyString: string,
  ) => {
    const qty =
      parseInt(qtyString) || 0

    setSelectedParts(
      (prev) => {
        const copy = [
          ...prev,
        ]

        const actualPrice =
          Number(
            copy[index]
              ?.actualUnitPrice ||
              0,
          )

        copy[index] = {
          ...copy[index],

          quantity: qty,

          totalPrice:
            qty *
            actualPrice,
        }

        return copy
      },
    )
  }

  const updateActualPartPrice = (
    index: number,
    value: string,
  ) => {
    const actualPrice =
      Number(value) || 0

    setSelectedParts(
      (prev) => {
        const copy = [
          ...prev,
        ]

        const qty =
          Number(
            copy[index]
              ?.quantity || 0,
          )

        copy[index] = {
          ...copy[index],

          actualUnitPrice:
            actualPrice,

          totalPrice:
            qty *
            actualPrice,
        }

        return copy
      },
    )
  }

  // ==============================
  // BILLING
  // ==============================

  const discountType =
    settings?.invoice
      ?.defaultDiscountType ||
    "percentage"

  const servicesSubtotal =
    useMemo(() => {
      return selectedServices.reduce(
        (
          sum,
          item,
        ) =>
          sum +
          Number(
            item.actualPrice ??
              item.estimatedPrice ??
              0,
          ),
        0,
      )
    }, [
      selectedServices,
    ])

  const partsSubtotal =
    useMemo(() => {
      return selectedParts.reduce(
        (
          sum,
          item,
        ) =>
          sum +
          Number(
            item.totalPrice ||
              0,
          ),
        0,
      )
    }, [
      selectedParts,
    ])

  const parsedLabor =
    useMemo(() => {
      const value =
        parseFloat(
          laborCost,
        )

      return isNaN(value) ||
        value < 0
        ? 0
        : value
    }, [
      laborCost,
    ])

  const rawSubtotal =
    useMemo(() => {
      return (
        servicesSubtotal +
        partsSubtotal +
        parsedLabor
      )
    }, [
      servicesSubtotal,
      partsSubtotal,
      parsedLabor,
    ])

  const parsedDiscount =
    useMemo(() => {
      const value =
        parseFloat(
          discount,
        )

      if (
        isNaN(value) ||
        value < 0
      ) {
        return 0
      }

      return discountType ===
        "percentage"
        ? Math.min(
            value,
            100,
          )
        : value
    }, [
      discount,
      discountType,
    ])

  const discountAmount =
    useMemo(() => {
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
        rawSubtotal,
      )
    }, [
      rawSubtotal,
      parsedDiscount,
      discountType,
    ])

  const grandTotal =
    useMemo(() => {
      return Math.max(
        0,
        rawSubtotal -
          discountAmount,
      )
    }, [
      rawSubtotal,
      discountAmount,
    ])

  // ==============================
  // STEP VALIDATION
  // ==============================

  const handleNext = () => {
    setSubmitted(true)

    if (
      currentStep === 1
    ) {
      if (
        !customerName.trim() ||
        phone.trim()
          .length !== 10 ||
        !vehicleNumber.trim() ||
        !vehicleModel.trim()
      ) {
        Alert.alert(
          t(
            "jobs.alertValidationTitle",
          ),

          t(
            "jobs.fillStep1Alert",
          ) ||
            "Please fill all required fields",
        )

        return
      }
    }

    if (
      currentStep === 2
    ) {
      if (
        selectedServices.length ===
          0 &&
        selectedParts.length ===
          0
      ) {
        Alert.alert(
          t(
            "jobs.alertValidationTitle",
          ),

          t(
            "jobs.atLeastOneServiceField",
          ) ||
            "Please add at least one service or part",
        )

        return
      }
    }

    setSubmitted(false)

    setCurrentStep(
      (prev) =>
        Math.min(
          prev + 1,
          3,
        ),
    )

    scrollRef.current?.scrollTo(
      {
        y: 0,
        animated: true,
      },
    )
  }

  const handleBack = () => {
    setCurrentStep(
      (prev) =>
        Math.max(
          prev - 1,
          1,
        ),
    )

    scrollRef.current?.scrollTo(
      {
        y: 0,
        animated: true,
      },
    )
  }

  // ==============================
  // UPDATE JOB
  // ==============================

  const updateCurrentJob =
    async () => {
      try {
        setSaving(true)

        await updateJob(
          job.jobId,

          {
            customerId:
              customerId || null,

            customerName:
              customerName.trim(),

            phone:
              phone.trim(),

            customerAddress,

            vehicleNumber:
              vehicleNumber
                .trim()
                .toUpperCase(),

            vehicleModel:
              vehicleModel.trim(),

            vehicleBrand,

            vehicleType,

            odometer,

            complaint,

            inspectionNotes,

            workerId:
              workerId || null,

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

            discountType,

            totalAmount:
              grandTotal,

            services:
              selectedServices,

            parts:
              selectedParts,
          },
        )

        Alert.alert(
          t(
            "jobs.alertSuccessTitle",
          ),

          t(
            "jobs.jobUpdatedSuccess",
          ) ||
            "Job updated successfully",
        )

        navigation.goBack()
      } catch (err: any) {
        Alert.alert(
          t(
            "jobs.alertErrorTitle",
          ),

          err?.response
            ?.data?.message ||
            t(
              "jobs.unableToUpdateJob",
            ) ||
            "Unable to update job",
        )
      } finally {
        setSaving(false)
      }
    }

  // ==============================
  // DATE PICKER
  // ==============================

  const onDateChange = (
    event: any,
    selectedDate?: Date,
  ) => {
    setShowDatePicker(false)

    if (!selectedDate) {
      return
    }

    const current =
      deliveryDate
        ? new Date(
            deliveryDate,
          )
        : new Date()

    current.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    )

    setDeliveryDate(
      new Date(current),
    )

    setShowTimePicker(true)
  }

  const onTimeChange = (
    event: any,
    selectedTime?: Date,
  ) => {
    setShowTimePicker(false)

    if (!selectedTime) {
      return
    }

    const current =
      deliveryDate
        ? new Date(
            deliveryDate,
          )
        : new Date()

    current.setHours(
      selectedTime.getHours(),
      selectedTime.getMinutes(),
    )

    setDeliveryDate(
      new Date(current),
    )
  }

  const formatDate = (
    date: Date,
  ) => {
    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    )
  }

  const RequiredLabel = ({
    text,
  }: {
    text: string
  }) => (
    <Text
      style={
        styles.label
      }
    >
      {text}

      <Text
        style={{
          color: "#DC2626",
        }}
      >
        {" *"}
      </Text>
    </Text>
  )

  if (loading) {
    return (
      <View
        style={
          styles.loader
        }
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />
      </View>
    )
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          "#F3F4F6",
      }}
    >
      {/* ============================== */}
      {/* STEP INDICATOR */}
      {/* ============================== */}

      <View
        style={
          styles.stepContainer
        }
      >
        {[
          {
            step: 1,
            label: t(
              "jobs.stepCustomer",
            ),
          },
          {
            step: 2,
            label: t(
              "jobs.stepServices",
            ),
          },
          {
            step: 3,
            label: t(
              "jobs.stepBilling",
            ),
          },
        ].map(
          (item) => (
            <View
              key={
                item.step
              }
              style={
                styles.stepItem
              }
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
          ),
        )}
      </View>

      <ScrollView
        ref={
          scrollRef
        }
        style={
          styles.container
        }
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={
          closeDropdowns
        }
      >
        {/* ============================== */}
        {/* STEP 1 */}
        {/* CUSTOMER & VEHICLE */}
        {/* ============================== */}

        {currentStep ===
          1 && (
          <>
            {/* CUSTOMER */}

            <View
              style={
                styles.sectionCard
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#2563EB"
                />

                <Text
                  style={
                    styles.sectionHeading
                  }
                >
                  {t(
                    "jobs.customerDetails",
                  )}
                </Text>
              </View>

              <RequiredLabel
                text={t(
                  "jobs.customerName",
                )}
              />

              <View
                style={[
                  styles.inputWrapper,
                  {
                    zIndex: 50,
                    elevation: 20,
                  },
                ]}
              >
                <TextInput
                  ref={
                    customerNameRef
                  }
                  onFocus={() => {
                    setShowCustomerSuggestions(
                      true,
                    )

                    setShowSuggestions(
                      false,
                    )

                    setShowWorkerSuggestions(
                      false,
                    )

                    setShowPartSuggestions(
                      false,
                    )
                  }}
                  style={[
                    styles.input,

                    submitted &&
                      !customerName.trim() &&
                      styles.inputError,
                  ]}
                  value={
                    customerName
                  }
                  onChangeText={
                    handleCustomerNameChange
                  }
                  placeholder={t(
                    "jobs.customerName",
                  )}
                />

                {showCustomerSuggestions &&
                  searchedCustomers.length >
                    0 && (
                    <View
                      style={
                        styles.suggestionContainer
                      }
                    >
                      {searchedCustomers.map(
                        (
                          customer,
                        ) => (
                          <TouchableOpacity
                            key={
                              getCustomerId(
                                customer,
                              ) ||
                              customer?.phone ||
                              customer?.phoneNumber ||
                              customer?.name
                            }
                            style={
                              styles.workerSuggestion
                            }
                            onPress={() =>
                              populateCustomer(
                                customer,
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
                                {customer?.name ||
                                  customer?.customerName ||
                                  ""}
                              </Text>

                              <Text
                                style={
                                  styles.cardSubtitle
                                }
                              >
                                {customer?.phone ||
                                  customer?.phoneNumber ||
                                  ""}
                              </Text>

                              {(
                                customer?.address ||
                                customer?.customerAddress
                              ) ? (
                                <Text
                                  style={
                                    styles.cardSubtitle
                                  }
                                >
                                  {customer?.address ||
                                    customer?.customerAddress}
                                </Text>
                              ) : null}
                            </View>

                            <Ionicons
                              name="person-circle"
                              size={26}
                              color="#2563EB"
                            />
                          </TouchableOpacity>
                        ),
                      )}
                    </View>
                  )}
              </View>

              <RequiredLabel
                text={t(
                  "jobs.phoneNumber",
                )}
              />

              <View
                style={[
                  styles.inputWrapper,
                  {
                    zIndex: 40,
                    elevation: 15,
                  },
                ]}
              >
                <TextInput
                  ref={
                    phoneRef
                  }
                  onFocus={() => {
                    setShowCustomerSuggestions(
                      true,
                    )

                    setShowSuggestions(
                      false,
                    )

                    setShowWorkerSuggestions(
                      false,
                    )

                    setShowPartSuggestions(
                      false,
                    )
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={[
                    styles.input,

                    submitted &&
                      phone.trim()
                        .length !==
                        10 &&
                      styles.inputError,
                  ]}
                  value={
                    phone
                  }
                  onChangeText={
                    handleCustomerPhoneChange
                  }
                  placeholder={t(
                    "jobs.phoneNumber",
                  )}
                />
              </View>

              <Text
                style={
                  styles.label
                }
              >
                {t(
                  "jobs.customerAddress",
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
                  customerAddress
                }
                onChangeText={
                  setCustomerAddress
                }
              />
            </View>

            {/* VEHICLE */}

            <View
              style={
                styles.sectionCard
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
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
                    "jobs.vehicleDetails",
                  )}
                </Text>
              </View>

              <RequiredLabel
                text={t(
                  "jobs.vehicleNumber",
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
                onChangeText={(
                  text,
                ) =>
                  setVehicleNumber(
                    text.toUpperCase(),
                  )
                }
              />

              <View
                style={
                  styles.row
                }
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    {t(
                      "jobs.vehicleBrand",
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
                      "jobs.vehicleModel",
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
                style={
                  styles.label
                }
              >
                {t(
                  "jobs.odometer",
                )}
              </Text>

              <TextInput
                onFocus={
                  closeDropdowns
                }
                keyboardType="numeric"
                maxLength={7}
                style={
                  styles.input
                }
                value={
                  odometer
                }
                onChangeText={
                  setOdometer
                }
              />

              <RequiredLabel
                text={t(
                  "jobs.vehicleType",
                )}
              />

              <View
                style={
                  styles.typeRow
                }
              >
                <TouchableOpacity
                  style={[
                    styles.typeButton,

                    vehicleType ===
                      t(
                        "jobs.twoWheeler",
                      ) &&
                      styles.selectedType,
                  ]}
                  onPress={() =>
                    setVehicleType(
                      t(
                        "jobs.twoWheeler",
                      ),
                    )
                  }
                >
                  <Text
                    style={[
                      styles.typeButtonText,

                      vehicleType ===
                        t(
                          "jobs.twoWheeler",
                        ) &&
                        styles.selectedTypeButtonText,
                    ]}
                  >
                    🏍{" "}
                    {t(
                      "jobs.twoWheeler",
                    )}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,

                    vehicleType ===
                      t(
                        "jobs.fourWheeler",
                      ) &&
                      styles.selectedType,
                  ]}
                  onPress={() =>
                    setVehicleType(
                      t(
                        "jobs.fourWheeler",
                      ),
                    )
                  }
                >
                  <Text
                    style={[
                      styles.typeButtonText,

                      vehicleType ===
                        t(
                          "jobs.fourWheeler",
                        ) &&
                        styles.selectedTypeButtonText,
                    ]}
                  >
                    🚗{" "}
                    {t(
                      "jobs.fourWheeler",
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* ============================== */}
        {/* STEP 2 */}
        {/* WORKER + SERVICES + PARTS */}
        {/* ============================== */}

        {currentStep ===
          2 && (
          <>
            {/* WORKER */}

            <View
              style={
                styles.sectionCard
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
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
                    "jobs.workerAndAssignment",
                  )}
                </Text>
              </View>

              <Text
                style={
                  styles.label
                }
              >
                {t(
                  "jobs.assignWorker",
                )}
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    zIndex: 30,
                    elevation: 10,
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
                  onFocus={() => {
                    setShowWorkerSuggestions(
                      true,
                    )

                    setShowSuggestions(
                      false,
                    )

                    setShowPartSuggestions(
                      false,
                    )

                    setShowCustomerSuggestions(
                      false,
                    )
                  }}
                  onChangeText={(
                    text,
                  ) => {
                    setWorkerName(
                      text,
                    )

                    setWorkerId(
                      "",
                    )

                    setShowWorkerSuggestions(
                      true,
                    )
                  }}
                />

                {showWorkerSuggestions && (
                  <View
                    style={
                      styles.suggestionContainer
                    }
                  >
                    {searchedWorkers.map(
                      (
                        worker,
                      ) => (
                        <TouchableOpacity
                          key={
                            worker.workerId ||
                            worker.id ||
                            worker._id
                          }
                          style={
                            styles.workerSuggestion
                          }
                          onPress={() => {
                            setWorkerId(
                              worker.workerId ||
                                worker.id ||
                                worker._id,
                            )

                            setWorkerName(
                              worker.name,
                            )

                            setShowWorkerSuggestions(
                              false,
                            )
                          }}
                        >
                          <View>
                            <Text
                              style={
                                styles.cardTitle
                              }
                            >
                              {
                                worker.name
                              }
                            </Text>

                            <Text
                              style={
                                styles.cardSubtitle
                              }
                            >
                              {
                                worker.role
                              }
                            </Text>
                          </View>

                          <Ionicons
                            name="person-circle"
                            size={26}
                            color="#2563EB"
                          />
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                )}
              </View>

              <Text
                style={
                  styles.label
                }
              >
                {t(
                  "jobs.priority",
                )}
              </Text>

              <View
                style={
                  styles.priorityRow
                }
              >
                {[
                  t(
                    "jobs.priorityLow",
                  ),
                  t(
                    "jobs.priorityNormal",
                  ),
                  t(
                    "jobs.priorityHigh",
                  ),
                ].map(
                  (item) => (
                    <TouchableOpacity
                      key={
                        item
                      }
                      style={[
                        styles.priorityButton,

                        priority ===
                          item &&
                          styles.selectedPriority,
                      ]}
                      onPress={() =>
                        setPriority(
                          item,
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
                        {
                          item
                        }
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

              <Text
                style={
                  styles.label
                }
              >
                {t(
                  "jobs.deliveryDate",
                ) ||
                  "Delivery Date & Time"}
              </Text>

              <TouchableOpacity
                style={
                  styles.input
                }
                onPress={() => {
                  closeDropdowns()

                  setShowDatePicker(
                    true,
                  )
                }}
              >
                <Text
                  style={{
                    color:
                      deliveryDate
                        ? "#111827"
                        : "#9CA3AF",
                  }}
                >
                  {deliveryDate
                    ? formatDate(
                        deliveryDate,
                      )
                    : "Select Delivery Date & Time"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* SERVICES */}

            <View
              style={
                styles.sectionCard
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
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
                    "jobs.services",
                  )}
                </Text>
              </View>

              <Text
                style={
                  styles.label
                }
              >
                {t(
                  "jobs.service",
                )}
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    zIndex: 30,
                    elevation: 10,
                  },
                ]}
              >
                <TextInput
                  style={
                    styles.input
                  }
                  value={
                    serviceName
                  }
                  placeholder={t(
                    "jobs.service",
                  )}
                  onFocus={() => {
                    setShowSuggestions(
                      true,
                    )

                    setShowWorkerSuggestions(
                      false,
                    )

                    setShowPartSuggestions(
                      false,
                    )

                    setShowCustomerSuggestions(
                      false,
                    )
                  }}
                  onChangeText={(
                    text,
                  ) => {
                    setServiceName(
                      text,
                    )

                    setShowSuggestions(
                      true,
                    )
                  }}
                />

                {showSuggestions &&
                  serviceName.trim()
                    .length >
                    0 &&
                  searchedServices.length >
                    0 && (
                    <View
                      style={
                        styles.suggestionContainer
                      }
                    >
                      {searchedServices.map(
                        (
                          service: any,
                        ) => {
                          const serviceId =
                            service?.serviceTypeId ||
                            service?.serviceId ||
                            service?.id ||
                            service?._id

                          const price =
                            Number(
                              service?.defaultPrice ??
                                service?.price ??
                                service?.estimatedPrice ??
                                0,
                            )

                          return (
                            <TouchableOpacity
                              key={
                                serviceId ||
                                service?.name
                              }
                              style={
                                styles.workerSuggestion
                              }
                              onPress={() =>
                                handleSelectService(
                                  service,
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
                                    service?.name
                                  }
                                </Text>

                                {service?.category ? (
                                  <Text
                                    style={
                                      styles.cardSubtitle
                                    }
                                  >
                                    {
                                      service.category
                                    }
                                  </Text>
                                ) : null}
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
                        },
                      )}
                    </View>
                  )}
              </View>

              <Text
                style={
                  styles.label
                }
              >
                {t(
                  "jobs.estimatePrice",
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
                    "jobs.addService",
                  )}
                </Text>
              </TouchableOpacity>

              {selectedServices.map(
                (
                  service,
                  index,
                ) => (
                  <View
                    key={
                      index
                    }
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
                            index,
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
                      <View
                        style={
                          styles.priceColumn
                        }
                      >
                        <Text
                          style={
                            styles.smallLabel
                          }
                        >
                          {t(
                            "jobs.estimatePrice",
                          )}
                          :
                        </Text>

                        <View
                          style={
                            styles.readOnlyBox
                          }
                        >
                          <Text
                            style={
                              styles.readOnlyText
                            }
                          >
                            ₹
                            {service.estimatedPrice ||
                              0}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.priceColumn
                        }
                      >
                        <Text
                          style={
                            styles.smallLabel
                          }
                        >
                          {t(
                            "jobs.actualPrice",
                          )}
                          :
                        </Text>

                        <TextInput
                          style={
                            styles.inlinePriceInput
                          }
                          keyboardType="numeric"
                          value={String(
                            service.actualPrice ??
                              "",
                          )}
                          onChangeText={(
                            text,
                          ) =>
                            updateActualServicePrice(
                              index,
                              text,
                            )
                          }
                        />
                      </View>
                    </View>
                  </View>
                ),
              )}
            </View>

            {/* PARTS */}

            <View
              style={
                styles.sectionCard
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
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
                    "jobs.sparePartsAndInventory",
                  )}
                </Text>
              </View>

              <Text
                style={
                  styles.label
                }
              >
                {t(
                  "jobs.partName",
                )}
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    zIndex: 30,
                    elevation: 10,
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
                  placeholder={t(
                    "jobs.partName",
                  )}
                  onFocus={() => {
                    setShowPartSuggestions(
                      true,
                    )

                    setShowWorkerSuggestions(
                      false,
                    )

                    setShowSuggestions(
                      false,
                    )

                    setShowCustomerSuggestions(
                      false,
                    )
                  }}
                  onChangeText={(
                    text,
                  ) => {
                    setPartName(
                      text,
                    )

                    // Once the user starts typing
                    // again, the previously selected
                    // inventory item is no longer
                    // guaranteed to be selected.
                    setSelectedPartItem(
                      null,
                    )

                    setShowPartSuggestions(
                      true,
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
                        (
                          item,
                        ) => {
                          const stock =
                            getInventoryStock(
                              item,
                            )

                          const price =
                            getInventoryPrice(
                              item,
                            )

                          return (
                            <TouchableOpacity
                              key={
                                getInventoryId(
                                  item,
                                ) ||
                                item?.name
                              }
                              style={
                                styles.workerSuggestion
                              }
                              onPress={() =>
                                handleSelectInventoryItem(
                                  item,
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
                                    item?.name
                                  }
                                </Text>

                                <Text
                                  style={
                                    styles.cardSubtitle
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
                        },
                      )}
                    </View>
                  )}
              </View>

              <View
                style={
                  styles.row
                }
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    {t(
                      "jobs.quantity",
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
                    onChangeText={
                      setPartQty
                    }
                  />
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    {t(
                      "jobs.unitPrice",
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
                    "jobs.addPart",
                  )}
                </Text>
              </TouchableOpacity>

              {selectedParts.map(
                (
                  part,
                  index,
                ) => (
                  <View
                    key={
                      index
                    }
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
                          part.name
                        }
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          removePart(
                            index,
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
                        styles.partEditRow
                      }
                    >
                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={
                            styles.smallLabel
                          }
                        >
                          {t(
                            "jobs.qty",
                          )}
                          :
                        </Text>

                        <TextInput
                          style={
                            styles.inlinePriceInput
                          }
                          keyboardType="numeric"
                          value={String(
                            part.quantity ??
                              1,
                          )}
                          onChangeText={(
                            text,
                          ) =>
                            updatePartQuantity(
                              index,
                              text,
                            )
                          }
                        />
                      </View>

                      <View
                        style={{
                          flex: 1.2,
                        }}
                      >
                        <Text
                          style={
                            styles.smallLabel
                          }
                        >
                          {t(
                            "jobs.estimatedPrice",
                          )}
                          :
                        </Text>

                        <View
                          style={
                            styles.readOnlyBox
                          }
                        >
                          <Text
                            style={
                              styles.readOnlyText
                            }
                          >
                            ₹
                            {part.estimatedUnitPrice ??
                              part.unitPrice ??
                              0}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{
                          flex: 1.2,
                        }}
                      >
                        <Text
                          style={
                            styles.smallLabel
                          }
                        >
                          {t(
                            "jobs.actualPrice",
                          )}
                          :
                        </Text>

                        <TextInput
                          style={
                            styles.inlinePriceInput
                          }
                          keyboardType="numeric"
                          value={String(
                            part.actualUnitPrice ??
                              "",
                          )}
                          onChangeText={(
                            text,
                          ) =>
                            updateActualPartPrice(
                              index,
                              text,
                            )
                          }
                        />
                      </View>
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
                        Total Subtotal:
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
                ),
              )}
            </View>
          </>
        )}

        {/* ============================== */}
        {/* STEP 3 */}
        {/* BILLING & NOTES */}
        {/* ============================== */}

        {currentStep ===
          3 && (
          <>
            <View
              style={
                styles.sectionCard
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
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
                    "jobs.laborAndAdditionalCharges",
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.row
                }
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    {t(
                      "jobs.laborCharge",
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
                    style={
                      styles.label
                    }
                  >
                    {discountType ===
                    "percentage"
                      ? t(
                          "jobs.discountPercent",
                        )
                      : t(
                          "jobs.discountLabel",
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

              {/* BILL SUMMARY */}

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
                      "jobs.servicesSubtotal",
                    )}
                  </Text>

                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    ₹{" "}
                    {servicesSubtotal.toFixed(
                      2,
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
                      "jobs.partsSubtotal",
                    )}
                  </Text>

                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    + ₹{" "}
                    {partsSubtotal.toFixed(
                      2,
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
                      "jobs.laborFee",
                    )}
                  </Text>

                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    + ₹{" "}
                    {parsedLabor.toFixed(
                      2,
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
                      Discount
                      {discountType ===
                      "percentage"
                        ? ` (${parsedDiscount}%)`
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
                        2,
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
                      "jobs.estimatedBill",
                    )}
                  </Text>

                  <Text
                    style={
                      styles.totalAmount
                    }
                  >
                    ₹{" "}
                    {grandTotal.toFixed(
                      2,
                    )}
                  </Text>
                </View>
              </View>
            </View>

            {/* NOTES */}

            <View
              style={
                styles.sectionCard
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
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
                    "jobs.customerComplaint",
                  )}
                </Text>
              </View>

              <TextInput
                multiline
                style={
                  styles.notes
                }
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
                  },
                ]}
              >
                {t(
                  "jobs.inspectionNotes",
                )}
              </Text>

              <TextInput
                multiline
                style={
                  styles.notes
                }
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

        {/* DATE PICKERS */}

        {showDatePicker && (
          <DateTimePicker
            value={
              deliveryDate ||
              new Date()
            }
            mode="date"
            display="default"
            onChange={
              onDateChange
            }
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={
              deliveryDate ||
              new Date()
            }
            mode="time"
            display="default"
            onChange={
              onTimeChange
            }
          />
        )}

        <View
          style={{
            height: 100,
          }}
        />
      </ScrollView>

      {/* ============================== */}
      {/* FOOTER BUTTONS */}
      {/* ============================== */}

      <View
        style={
          styles.footerBar
        }
      >
        {currentStep >
          1 && (
          <TouchableOpacity
            style={
              styles.backBtn
            }
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
                "jobs.btnBack",
              )}
            </Text>
          </TouchableOpacity>
        )}

        {currentStep <
        3 ? (
          <TouchableOpacity
            style={
              styles.nextBtn
            }
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
                "jobs.btnNext",
              )}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={
              styles.saveBtn
            }
            disabled={
              saving
            }
            onPress={
              updateCurrentJob
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
                  "jobs.updateJob",
                ) ||
                  "Update Job"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

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
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    zIndex: 100,
    elevation: 10,
    overflow: "hidden",
  },

  workerSuggestion: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },

  suggestionPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
    marginLeft: 10,
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
    marginTop: 8,
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
    gap: 12,
    marginTop: 8,
  },

  priceColumn: {
    flex: 1,
  },

  partEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },

  smallLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },

  readOnlyBox: {
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "center",
  },

  readOnlyText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },

  inlinePriceInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: "#111827",
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
    color: "#111827",
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
})