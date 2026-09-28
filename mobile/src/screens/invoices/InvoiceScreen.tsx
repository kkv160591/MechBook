// InvoiceScreen.tsx

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native"

import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons"

import { useEffect, useMemo, useState } from "react"
import { useRoute } from "@react-navigation/native"

import * as Print from "expo-print"
import * as Sharing from "expo-sharing"

import { getJobById } from "../../services/jobService"
import { getGarageProfile } from "../../services/garageService"
import { getWorkers } from "../../services/workerService"
import {
  getGSTSettings,
  getInvoiceSettings,
} from "../../services/settingsService"

import { useTranslation } from "../../context/LanguageContext"

// -----------------------------------------------------------------------------
// DEFAULT SETTINGS
// -----------------------------------------------------------------------------
// Invoice settings are OPTIONAL.
// A user should be able to generate/view an invoice even if they never saved
// invoice settings.
//
// We use these defaults when the settings endpoint returns null, undefined,
// empty data, or a 404.
// -----------------------------------------------------------------------------

const DEFAULT_INVOICE_SETTINGS = {
  showGarageLogo: true,
  showGarageAddress: true,
  showGSTNumber: true,
  showCustomerAddress: true,
  showVehicleDetails: true,

  defaultWarranty:
    "• Genuine spare warranty depends on manufacturer terms.",

  terms:
    "• Please inspect your vehicle before taking delivery.",

  footerNote: "",

  defaultLaborCost: 0,
  defaultDiscount: 0,
  defaultDiscountType: "percentage",
}

const DEFAULT_GST_SETTINGS = {
  enabled: false,
  defaultRate: 0,
  gstNumber: "",
}

export default function InvoiceScreen({ navigation }: any) {
  const { t } = useTranslation()
  const route = useRoute<any>()

  const { jobId } = route.params || {}

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  const [loading, setLoading] = useState(true)

  const [job, setJob] = useState<any>(null)
  const [garage, setGarage] = useState<any>(null)

  // IMPORTANT:
  // Settings always start with safe defaults.
  const [gstSettings, setGSTSettings] = useState<any>(
    DEFAULT_GST_SETTINGS
  )

  const [invoiceSettings, setInvoiceSettings] = useState<any>(
    DEFAULT_INVOICE_SETTINGS
  )

  const [workers, setWorkers] = useState<any[]>([])

  // ---------------------------------------------------------------------------
  // LOAD DATA
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!jobId) {
      Alert.alert(
        "Error",
        "Job ID is missing."
      )

      setLoading(false)
      return
    }

    loadAll()
  }, [jobId])

  const loadAll = async () => {
    try {
      setLoading(true)

      // -----------------------------------------------------------------------
      // REQUIRED DATA
      // -----------------------------------------------------------------------
      // These are required for displaying the invoice.
      //
      // If one of these fails, the invoice cannot properly be displayed.
      // -----------------------------------------------------------------------

      const [jobResult, garageResult, workersResult] =
        await Promise.all([
          getJobById(jobId),
          getGarageProfile(),
          getWorkers(),
        ])

      // -----------------------------------------------------------------------
      // JOB
      // -----------------------------------------------------------------------

      const loadedJob =
        jobResult?.job ||
        jobResult?.data?.job ||
        jobResult?.data ||
        null

      // -----------------------------------------------------------------------
      // GARAGE
      // -----------------------------------------------------------------------

      const loadedGarage =
        garageResult?.garage ||
        garageResult?.data?.garage ||
        garageResult?.data ||
        null

      // -----------------------------------------------------------------------
      // WORKERS
      // -----------------------------------------------------------------------

      setWorkers(
        workersResult?.workers ||
          workersResult?.data?.workers ||
          []
      )

      setJob(loadedJob)
      setGarage(loadedGarage)

      // -----------------------------------------------------------------------
      // OPTIONAL GST SETTINGS
      // -----------------------------------------------------------------------
      // Missing GST settings MUST NOT stop the invoice from loading.
      // -----------------------------------------------------------------------

      try {
        const gstResponse = await getGSTSettings()

        const loadedGST =
          gstResponse?.settings ||
          gstResponse?.gstSettings ||
          gstResponse?.data?.settings ||
          gstResponse?.data ||
          gstResponse

        setGSTSettings({
          ...DEFAULT_GST_SETTINGS,
          ...(loadedGST || {}),
        })
      } catch (error: any) {
        console.log(
          "GST settings not found. Using defaults.",
          error?.response?.status ||
            error?.message
        )

        setGSTSettings(DEFAULT_GST_SETTINGS)
      }

      // -----------------------------------------------------------------------
      // OPTIONAL INVOICE SETTINGS
      // -----------------------------------------------------------------------
      // Missing invoice settings MUST NOT stop the invoice from loading.
      // -----------------------------------------------------------------------

      try {
        const invoiceResponse =
          await getInvoiceSettings()

        const loadedInvoice =
          invoiceResponse?.settings ||
          invoiceResponse?.invoiceSettings ||
          invoiceResponse?.data?.settings ||
          invoiceResponse?.data ||
          invoiceResponse

        setInvoiceSettings({
          ...DEFAULT_INVOICE_SETTINGS,
          ...(loadedInvoice || {}),
        })
      } catch (error: any) {
        console.log(
          "Invoice settings not found. Using defaults.",
          error?.response?.status ||
            error?.message
        )

        setInvoiceSettings(
          DEFAULT_INVOICE_SETTINGS
        )
      }
    } catch (error: any) {
      console.error(
        "Failed to load invoice:",
        error
      )

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load invoice."
      )
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------------------------
  // ASSIGNED WORKER
  // ---------------------------------------------------------------------------

  const assignedWorker = useMemo(() => {
    if (!job?.workerId || !workers.length) {
      return null
    }

    return workers.find(
      (worker: any) =>
        String(worker.workerId) ===
        String(job.workerId)
    )
  }, [job, workers])

  // ---------------------------------------------------------------------------
  // SERVICES TOTAL
  // ---------------------------------------------------------------------------

  const servicesTotal = useMemo(() => {
    if (!Array.isArray(job?.services)) {
      return 0
    }

    return job.services.reduce(
      (sum: number, item: any) => {
        const quantity = Number(
          item.quantity ?? 1
        )

        const estimatedPrice = Number(
          item.estimatedPrice ?? 0
        )

        const actualPrice =
          item.actualPrice !== undefined &&
          item.actualPrice !== null &&
          item.actualPrice !== ""
            ? Number(item.actualPrice)
            : estimatedPrice

        return (
          sum +
          quantity *
            (Number.isFinite(actualPrice)
              ? actualPrice
              : 0)
        )
      },
      0
    )
  }, [job])

  // ---------------------------------------------------------------------------
  // PARTS TOTAL
  // ---------------------------------------------------------------------------
  //
  // Supports:
  //
  // actualUnitPrice
  // estimatedUnitPrice
  // unitPrice
  // sellingPrice
  // price
  //
  // This is important because your inventory response is now:
  //
  // {
  //   sellingPrice: 500,
  //   buyingPrice: 300,
  //   name: "Wiper",
  //   stock: 100
  // }
  //
  // The invoice should use SELLING PRICE, not BUYING PRICE.
  // ---------------------------------------------------------------------------

  const partsTotal = useMemo(() => {
    if (!Array.isArray(job?.parts)) {
      return 0
    }

    return job.parts.reduce(
      (sum: number, item: any) => {
        const quantity = Number(
          item.quantity ?? 1
        )

        // If the job already saved a total price,
        // use that exact saved value.
        if (
          item.totalPrice !== undefined &&
          item.totalPrice !== null &&
          item.totalPrice !== ""
        ) {
          const savedTotal = Number(
            item.totalPrice
          )

          return (
            sum +
            (Number.isFinite(savedTotal)
              ? savedTotal
              : 0)
          )
        }

        // Otherwise determine the unit price.
        const unitPrice = Number(
          item.actualUnitPrice ??
            item.estimatedUnitPrice ??
            item.unitPrice ??
            item.sellingPrice ??
            item.price ??
            0
        )

        const safeUnitPrice =
          Number.isFinite(unitPrice)
            ? unitPrice
            : 0

        return (
          sum +
          quantity *
            safeUnitPrice
        )
      },
      0
    )
  }, [job])

  // ---------------------------------------------------------------------------
  // LABOR FEE
  // ---------------------------------------------------------------------------
  //
  // Current job value has priority.
  // Invoice setting is only a fallback.
  // ---------------------------------------------------------------------------

  const laborFee = useMemo(() => {
    if (
      job?.laborCost !== undefined &&
      job?.laborCost !== null &&
      job?.laborCost !== ""
    ) {
      const value = Number(
        job.laborCost
      )

      return Number.isFinite(value)
        ? value
        : 0
    }

    return Number(
      invoiceSettings?.defaultLaborCost || 0
    )
  }, [
    job?.laborCost,
    invoiceSettings?.defaultLaborCost,
  ])

  // ---------------------------------------------------------------------------
  // SUBTOTAL
  // ---------------------------------------------------------------------------

  const subTotal = useMemo(() => {
    return (
      servicesTotal +
      partsTotal +
      laborFee
    )
  }, [
    servicesTotal,
    partsTotal,
    laborFee,
  ])

  // ---------------------------------------------------------------------------
  // DISCOUNT TYPE
  // ---------------------------------------------------------------------------

  const discountType =
    job?.discountType ||
    invoiceSettings?.defaultDiscountType ||
    "percentage"

  // ---------------------------------------------------------------------------
  // DISCOUNT VALUE
  // ---------------------------------------------------------------------------

  const rawDiscountValue = useMemo(() => {
    if (
      job?.discount !== undefined &&
      job?.discount !== null &&
      job?.discount !== ""
    ) {
      const value = Number(
        job.discount
      )

      return Number.isFinite(value)
        ? value
        : 0
    }

    return Number(
      invoiceSettings?.defaultDiscount || 0
    )
  }, [
    job?.discount,
    invoiceSettings?.defaultDiscount,
  ])

  // ---------------------------------------------------------------------------
  // DISCOUNT AMOUNT
  // ---------------------------------------------------------------------------

  const discountAmount = useMemo(() => {
    if (discountType === "percentage") {
      const percentage = Math.min(
        Math.max(rawDiscountValue, 0),
        100
      )

      return (
        (subTotal * percentage) /
        100
      )
    }

    return Math.min(
      Math.max(rawDiscountValue, 0),
      subTotal
    )
  }, [
    subTotal,
    discountType,
    rawDiscountValue,
  ])

  // ---------------------------------------------------------------------------
  // TAXABLE AMOUNT
  // ---------------------------------------------------------------------------

  const taxableAmount = useMemo(() => {
    return Math.max(
      0,
      subTotal - discountAmount
    )
  }, [
    subTotal,
    discountAmount,
  ])

  // ---------------------------------------------------------------------------
  // GST
  // ---------------------------------------------------------------------------

  const gstEnabled = Boolean(
    gstSettings?.enabled
  )

  const gstPercent = gstEnabled
    ? Number(
        gstSettings?.defaultRate || 0
      )
    : 0

  const gstAmount = useMemo(() => {
    return (
      (taxableAmount *
        gstPercent) /
      100
    )
  }, [
    taxableAmount,
    gstPercent,
  ])

  // ---------------------------------------------------------------------------
  // GRAND TOTAL
  // ---------------------------------------------------------------------------

  const rawGrandTotal = useMemo(() => {
    return (
      taxableAmount +
      gstAmount
    )
  }, [
    taxableAmount,
    gstAmount,
  ])

  const grandTotal = useMemo(() => {
    return Math.round(
      rawGrandTotal
    )
  }, [rawGrandTotal])

  const roundOff =
    grandTotal -
    rawGrandTotal

  // ---------------------------------------------------------------------------
  // FORMAT MONEY
  // ---------------------------------------------------------------------------

  const formatMoney = (
    value: number
  ) => {
    const safeValue =
      Number.isFinite(value)
        ? value
        : 0

    return `₹${safeValue.toFixed(2)}`
  }

  // ---------------------------------------------------------------------------
  // ESCAPE HTML
  // ---------------------------------------------------------------------------
  //
  // Prevent customer/service/part names from breaking generated HTML.
  // ---------------------------------------------------------------------------

  const escapeHTML = (
    value: any
  ) => {
    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      )
  }

  // ---------------------------------------------------------------------------
  // GET PART UNIT PRICE
  // ---------------------------------------------------------------------------

  const getPartUnitPrice = (
    part: any
  ) => {
    return Number(
      part.actualUnitPrice ??
        part.estimatedUnitPrice ??
        part.unitPrice ??
        part.sellingPrice ??
        part.price ??
        0
    ) || 0
  }

  // ---------------------------------------------------------------------------
  // GET PART TOTAL
  // ---------------------------------------------------------------------------

  const getPartTotal = (
    part: any
  ) => {
    if (
      part.totalPrice !== undefined &&
      part.totalPrice !== null &&
      part.totalPrice !== ""
    ) {
      return (
        Number(part.totalPrice) ||
        0
      )
    }

    const quantity = Number(
      part.quantity ?? 1
    )

    return (
      quantity *
      getPartUnitPrice(part)
    )
  }

  // ---------------------------------------------------------------------------
  // HTML GENERATOR
  // ---------------------------------------------------------------------------

  const generateHTML = () => {
    const servicesRows = (
      job?.services || []
    )
      .map((service: any) => {
        const qty = Number(
          service.quantity ?? 1
        )

        const estimatedPrice =
          Number(
            service.estimatedPrice ??
              0
          )

        const rate =
          service.actualPrice !==
            undefined &&
          service.actualPrice !==
            null &&
          service.actualPrice !== ""
            ? Number(
                service.actualPrice
              )
            : estimatedPrice

        const safeQty =
          Number.isFinite(qty)
            ? qty
            : 1

        const safeRate =
          Number.isFinite(rate)
            ? rate
            : 0

        const total =
          safeQty *
          safeRate

        return `
          <tr>
            <td>${escapeHTML(
              service.name
            )}</td>

            <td style="text-align:center;">
              ${safeQty}
            </td>

            <td style="text-align:right;">
              ₹${safeRate.toFixed(2)}
            </td>

            <td style="text-align:right;">
              ₹${total.toFixed(2)}
            </td>
          </tr>
        `
      })
      .join("")

    const partsRows = (
      job?.parts || []
    )
      .map((part: any) => {
        const qty = Number(
          part.quantity ?? 1
        )

        const safeQty =
          Number.isFinite(qty)
            ? qty
            : 1

        const rate =
          getPartUnitPrice(part)

        const total =
          getPartTotal(part)

        return `
          <tr>
            <td>${escapeHTML(
              part.name
            )}</td>

            <td style="text-align:center;">
              ${safeQty}
            </td>

            <td style="text-align:right;">
              ₹${rate.toFixed(2)}
            </td>

            <td style="text-align:right;">
              ₹${total.toFixed(2)}
            </td>
          </tr>
        `
      })
      .join("")

    const invoiceId =
      job?._id ||
      job?.jobId ||
      ""

    const invoiceNumber =
      `INV-${String(
        invoiceId
      )
        .slice(0, 8)
        .toUpperCase()}`

    return `
      <html>
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }

            h1 {
              color: #2563EB;
              margin-bottom: 5px;
            }

            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #2563EB;
              padding-bottom: 10px;
            }

            .section {
              margin-top: 20px;
            }

            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }

            .table th,
            .table td {
              border: 1px solid #ddd;
              padding: 8px;
              font-size: 12px;
            }

            .table th {
              background-color: #f2f2f2;
              text-align: left;
            }

            .summary {
              margin-top: 20px;
              width: 50%;
              float: right;
            }

            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
            }

            .grand-total {
              font-weight: bold;
              font-size: 16px;
              border-top: 2px solid #333;
              padding-top: 8px;
            }
          </style>
        </head>

        <body>

          <div class="header">

            <div>
              <h1>
                ${escapeHTML(
                  garage?.garageName ||
                    "Garage Invoice"
                )}
              </h1>

              <p>
                Owner:
                ${escapeHTML(
                  garage?.ownerName ||
                    "-"
                )}
                <br/>

                ${escapeHTML(
                  garage?.address ||
                    ""
                )},
                ${escapeHTML(
                  garage?.city ||
                    ""
                )}
              </p>

              <p>
                Phone:
                ${escapeHTML(
                  garage?.phone ||
                    "-"
                )}
              </p>
            </div>

            <div style="text-align:right;">

              <h2>INVOICE</h2>

              <p>
                <b>Invoice No:</b>
                ${invoiceNumber}
              </p>

              <p>
                <b>Date:</b>
                ${new Date(
                  job?.createdAt ||
                    Date.now()
                ).toLocaleDateString()}
              </p>

            </div>

          </div>

          <div class="section">

            <h3>
              Customer & Vehicle Details
            </h3>

            <p>
              <b>Customer:</b>
              ${escapeHTML(
                job?.customerName
              )}
              (${escapeHTML(
                job?.phone
              )})
            </p>

            <p>
              <b>Vehicle:</b>
              ${escapeHTML(
                job?.vehicleNumber
              )}
              -
              ${escapeHTML(
                job?.vehicleBrand
              )}
              ${escapeHTML(
                job?.vehicleModel
              )}
            </p>

          </div>

          <div class="section">

            <h3>
              Services Performed
            </h3>

            <table class="table">

              <thead>
                <tr>
                  <th>Service</th>
                  <th style="text-align:center;">
                    Qty
                  </th>
                  <th style="text-align:right;">
                    Rate
                  </th>
                  <th style="text-align:right;">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                ${
                  servicesRows ||
                  `
                  <tr>
                    <td colspan="4">
                      No services added
                    </td>
                  </tr>
                  `
                }
              </tbody>

            </table>

          </div>

          <div class="section">

            <h3>
              Parts Supplied
            </h3>

            <table class="table">

              <thead>
                <tr>
                  <th>Part</th>
                  <th style="text-align:center;">
                    Qty
                  </th>
                  <th style="text-align:right;">
                    Rate
                  </th>
                  <th style="text-align:right;">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                ${
                  partsRows ||
                  `
                  <tr>
                    <td colspan="4">
                      No parts added
                    </td>
                  </tr>
                  `
                }
              </tbody>

            </table>

          </div>

          <div class="summary">

            <div class="summary-row">
              <span>
                Services Subtotal:
              </span>

              <span>
                ₹${servicesTotal.toFixed(
                  2
                )}
              </span>
            </div>

            <div class="summary-row">
              <span>
                Parts Subtotal:
              </span>

              <span>
                ₹${partsTotal.toFixed(
                  2
                )}
              </span>
            </div>

            <div class="summary-row">
              <span>
                Labor Fee:
              </span>

              <span>
                ₹${laborFee.toFixed(
                  2
                )}
              </span>
            </div>

            ${
              discountAmount > 0
                ? `
                <div class="summary-row">
                  <span>
                    Discount:
                  </span>

                  <span>
                    -₹${discountAmount.toFixed(
                      2
                    )}
                  </span>
                </div>
                `
                : ""
            }

            ${
              gstEnabled
                ? `
                <div class="summary-row">
                  <span>
                    GST (${gstPercent}%):
                  </span>

                  <span>
                    +₹${gstAmount.toFixed(
                      2
                    )}
                  </span>
                </div>
                `
                : ""
            }

            <div class="summary-row grand-total">

              <span>
                Grand Total:
              </span>

              <span>
                ₹${grandTotal}
              </span>

            </div>

          </div>

        </body>
      </html>
    `
  }

  // ---------------------------------------------------------------------------
  // GENERATE PDF
  // ---------------------------------------------------------------------------

  const handleGeneratePDF =
    async () => {
      try {
        if (!job) {
          Alert.alert(
            "Error",
            "Job data is not available."
          )
          return
        }

        const html =
          generateHTML()

        if (
          Platform.OS === "web"
        ) {
          const printWindow =
            window.open(
              "",
              "_blank"
            )

          if (printWindow) {
            printWindow.document.write(
              html
            )

            printWindow.document.close()

            printWindow.print()
          }
        } else {
          const { uri } =
            await Print.printToFileAsync(
              {
                html,
              }
            )

          if (
            await Sharing.isAvailableAsync()
          ) {
            await Sharing.shareAsync(
              uri,
              {
                UTI: ".pdf",
                mimeType:
                  "application/pdf",
                dialogTitle:
                  "Save or View PDF Invoice",
              }
            )
          } else {
            Alert.alert(
              "Success",
              `Invoice saved to: ${uri}`
            )
          }
        }
      } catch (error) {
        console.error(
          "PDF Generation Error:",
          error
        )

        Alert.alert(
          "Error",
          "Failed to generate PDF invoice."
        )
      }
    }

  // ---------------------------------------------------------------------------
  // SHARE INVOICE
  // ---------------------------------------------------------------------------

  const handleShareInvoice =
    async () => {
      try {
        if (!job) {
          Alert.alert(
            "Error",
            "Job data is not available."
          )
          return
        }

        const html =
          generateHTML()

        if (
          Platform.OS === "web"
        ) {
          if (
            typeof navigator !==
              "undefined" &&
            navigator.share
          ) {
            const invoiceId =
              job?._id ||
              job?.jobId ||
              ""

            await navigator.share({
              title:
                `Invoice INV-${String(
                  invoiceId
                )
                  .slice(0, 8)
                  .toUpperCase()}`,

              text:
                `Invoice for ${job?.customerName || "customer"}`,

              url:
                typeof window !==
                "undefined"
                  ? window.location.href
                  : "",
            })
          } else {
            Alert.alert(
              "Notice",
              "Sharing is not supported on this browser. Please use Print or PDF generation."
            )
          }
        } else {
          const { uri } =
            await Print.printToFileAsync(
              {
                html,
              }
            )

          const canShare =
            await Sharing.isAvailableAsync()

          if (canShare) {
            await Sharing.shareAsync(
              uri,
              {
                UTI: ".pdf",
                mimeType:
                  "application/pdf",
                dialogTitle:
                  `Share Invoice for ${
                    job?.customerName ||
                    "Customer"
                  }`,
              }
            )
          } else {
            Alert.alert(
              "Error",
              "Sharing is not available on this device."
            )
          }
        }
      } catch (error) {
        console.error(
          "Share Invoice Error:",
          error
        )

        Alert.alert(
          "Error",
          "Failed to share invoice."
        )
      }
    }

  // ---------------------------------------------------------------------------
  // PRINT INVOICE
  // ---------------------------------------------------------------------------

  const handlePrintInvoice =
    async () => {
      try {
        if (!job) {
          Alert.alert(
            "Error",
            "Job data is not available."
          )
          return
        }

        const html =
          generateHTML()

        if (
          Platform.OS === "web"
        ) {
          const printWindow =
            window.open(
              "",
              "_blank"
            )

          if (printWindow) {
            printWindow.document.write(
              html
            )

            printWindow.document.close()

            printWindow.focus()

            printWindow.print()
          }
        } else {
          await Print.printAsync({
            html,
          })
        }
      } catch (error) {
        console.error(
          "Print Invoice Error:",
          error
        )

        Alert.alert(
          "Error",
          "Failed to print invoice."
        )
      }
    }

  // ---------------------------------------------------------------------------
  // LOADING SCREEN
  // ---------------------------------------------------------------------------
  //
  // IMPORTANT:
  // Invoice settings and GST settings are NOT checked here.
  // They are optional.
  // ---------------------------------------------------------------------------

  if (
    loading ||
    !garage ||
    !job
  ) {
    return (
      <View
        style={styles.container}
      >
        <SafeAreaView />

        <View
          style={
            styles.headerBar
          }
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              navigation.goBack()
            }
            activeOpacity={0.7}
          >
            <Feather
              name="arrow-left"
              size={24}
              color="#111827"
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text
              style={
                styles.heading
              }
            >
              {t(
                "invoice.title"
              ) ||
                "Invoice Details"}
            </Text>

            <Text
              style={
                styles.subHeading
              }
            >
              {t(
                "invoice.loadingSubtitle"
              ) ||
                "Loading invoice breakdown..."}
            </Text>
          </View>
        </View>

        <View
          style={styles.loader}
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />
        </View>
      </View>
    )
  }

  // ---------------------------------------------------------------------------
  // MAIN UI
  // ---------------------------------------------------------------------------

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
    >
      <SafeAreaView />

      {/* HEADER BAR */}

      <View
        style={styles.headerBar}
      >
        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={0.7}
        >
          <Feather
            name="arrow-left"
            size={24}
            color="#111827"
          />
        </TouchableOpacity>

        <View
          style={
            styles.headerTextContainer
          }
        >
          <Text
            style={
              styles.heading
            }
          >
            {t(
              "invoice.title"
            ) ||
              "Invoice Details"}
          </Text>

          <Text
            style={
              styles.subHeading
            }
          >
            {t(
              "invoice.subtitle"
            ) ||
              "View complete job sheet & billing summary"}
          </Text>
        </View>
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* GARAGE HEADER */}
      {/* ------------------------------------------------------------------ */}

      <View
        style={styles.header}
      >
        {invoiceSettings?.showGarageLogo !==
          false && (
          <View
            style={
              styles.logoContainer
            }
          >
            {garage.logo ? (
              <Image
                source={{
                  uri: garage.logo,
                }}
                style={
                  styles.logo
                }
              />
            ) : (
              <MaterialCommunityIcons
                name="garage"
                size={50}
                color="#2563EB"
              />
            )}
          </View>
        )}

        <Text
          style={
            styles.garageName
          }
        >
          {garage.garageName ||
            "Garage"}
        </Text>

        <Text
          style={
            styles.garageSubtitle
          }
        >
          {t(
            "invoice.owner"
          ) || "Owner"}{" "}
          :{" "}
          {garage.ownerName ||
            "-"}
        </Text>

        {invoiceSettings?.showGarageAddress !==
          false && (
          <>
            <Text
              style={
                styles.garageAddress
              }
            >
              {garage.address ||
                ""}
              {garage.city
                ? ` ${garage.city}`
                : ""}
              {garage.state
                ? `, ${garage.state}`
                : ""}
              {garage.pincode
                ? ` ${garage.pincode}`
                : ""}
            </Text>

            <Text
              style={
                styles.garagePhone
              }
            >
              {garage.phone ||
                "-"}
            </Text>
          </>
        )}

        {invoiceSettings?.showGSTNumber !==
          false &&
          gstEnabled &&
          gstSettings?.gstNumber && (
            <Text
              style={
                styles.gst
              }
            >
              GSTIN :{" "}
              {
                gstSettings.gstNumber
              }
            </Text>
          )}

        <View
          style={
            styles.invoiceStrip
          }
        >
          <View>
            <Text
              style={
                styles.invoiceLabel
              }
            >
              {t(
                "invoice.number"
              ) ||
                "Invoice No"}
            </Text>

            <Text
              style={
                styles.invoiceValue
              }
            >
              INV-
              {String(
                job._id ||
                  job.jobId ||
                  ""
              )
                .slice(0, 8)
                .toUpperCase()}
            </Text>
          </View>

          <View>
            <Text
              style={
                styles.invoiceLabel
              }
            >
              {t(
                "invoice.date"
              ) ||
                "Invoice Date"}
            </Text>

            <Text
              style={
                styles.invoiceValue
              }
            >
              {new Date(
                job.createdAt ||
                  Date.now()
              ).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* CUSTOMER */}
      {/* ------------------------------------------------------------------ */}

      <View
        style={styles.card}
      >
        <Text
          style={
            styles.cardTitle
          }
        >
          {t(
            "invoice.customerDetails"
          ) ||
            "Customer Details"}
        </Text>

        <View
          style={styles.infoRow}
        >
          <Ionicons
            name="person-outline"
            size={18}
            color="#2563EB"
          />

          <Text
            style={
              styles.infoText
            }
          >
            {job.customerName ||
              "-"}
          </Text>
        </View>

        <View
          style={styles.infoRow}
        >
          <Ionicons
            name="call-outline"
            size={18}
            color="#2563EB"
          />

          <Text
            style={
              styles.infoText
            }
          >
            {job.phone ||
              "-"}
          </Text>
        </View>

        {invoiceSettings?.showCustomerAddress !==
          false && (
          <View
            style={
              styles.infoRow
            }
          >
            <Ionicons
              name="location-outline"
              size={18}
              color="#2563EB"
            />

            <Text
              style={
                styles.infoText
              }
            >
              {job.customerAddress ||
                "-"}
            </Text>
          </View>
        )}
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* VEHICLE DETAILS */}
      {/* ------------------------------------------------------------------ */}

      {invoiceSettings?.showVehicleDetails !==
        false && (
        <View
          style={styles.card}
        >
          <Text
            style={
              styles.cardTitle
            }
          >
            {t(
              "invoice.vehicleDetails"
            ) ||
              "Vehicle Details"}
          </Text>

          <View
            style={
              styles.vehicleHeader
            }
          >
            <MaterialCommunityIcons
              name={
                job.vehicleType ===
                "2 Wheeler"
                  ? "motorbike"
                  : "car"
              }
              size={42}
              color="#2563EB"
            />

            <View
              style={{
                marginLeft: 15,
              }}
            >
              <Text
                style={
                  styles.vehicleNumber
                }
              >
                {job.vehicleNumber ||
                  "-"}
              </Text>

              <Text
                style={
                  styles.vehicleModel
                }
              >
                {job.vehicleBrand ||
                  ""}{" "}
                {job.vehicleModel ||
                  ""}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={styles.grid}
          >
            <View
              style={
                styles.gridItem
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                {t(
                  "invoice.vehicleType"
                ) ||
                  "Vehicle Type"}
              </Text>

              <Text
                style={
                  styles.value
                }
              >
                {job.vehicleType ||
                  "-"}
              </Text>
            </View>

            <View
              style={
                styles.gridItem
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                {t(
                  "invoice.odometer"
                ) ||
                  "Odometer"}
              </Text>

              <Text
                style={
                  styles.value
                }
              >
                {job.odometer
                  ? `${job.odometer} KM`
                  : "-"}
              </Text>
            </View>

            <View
              style={
                styles.gridItem
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                {t(
                  "invoice.assignedWorker"
                ) ||
                  "Assigned Worker"}
              </Text>

              <Text
                style={
                  styles.value
                }
              >
                {job.workerName ||
                  assignedWorker?.name ||
                  "-"}
              </Text>
            </View>

            <View
              style={
                styles.gridItem
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                {t(
                  "invoice.priority"
                ) ||
                  "Priority"}
              </Text>

              <Text
                style={
                  styles.value
                }
              >
                {job.priority ||
                  "Normal"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* JOB INFORMATION */}
      {/* ------------------------------------------------------------------ */}

      <View
        style={styles.card}
      >
        <Text
          style={
            styles.cardTitle
          }
        >
          {t(
            "invoice.jobInfo"
          ) ||
            "Job Information"}
        </Text>

        <Text
          style={
            styles.sectionLabel
          }
        >
          {t(
            "invoice.complaint"
          ) ||
            "Complaint"}
        </Text>

        <Text
          style={
            styles.description
          }
        >
          {job.complaint ||
            "-"}
        </Text>

        <View
          style={{
            height: 12,
          }}
        />

        <Text
          style={
            styles.sectionLabel
          }
        >
          {t(
            "invoice.inspectionNotes"
          ) ||
            "Inspection Notes"}
        </Text>

        <Text
          style={
            styles.description
          }
        >
          {job.inspectionNotes ||
            "-"}
        </Text>

        {job.deliveryDate && (
          <>
            <View
              style={{
                height: 12,
              }}
            />

            <Text
              style={
                styles.sectionLabel
              }
            >
              {t(
                "invoice.estDelivery"
              ) ||
                "Estimated Delivery"}
            </Text>

            <Text
              style={
                styles.description
              }
            >
              {new Date(
                job.deliveryDate
              ).toLocaleString()}
            </Text>
          </>
        )}
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* SERVICES */}
      {/* ------------------------------------------------------------------ */}

      <View
        style={styles.card}
      >
        <Text
          style={
            styles.cardTitle
          }
        >
          {t(
            "invoice.servicesPerformed"
          ) ||
            "Services Performed"}
        </Text>

        <View
          style={
            styles.tableHeader
          }
        >
          <Text
            style={[
              styles.tableCell,
              {
                flex: 3,
                fontWeight:
                  "700",
                textAlign:
                  "left",
              },
            ]}
          >
            {t(
              "invoice.service"
            ) ||
              "Service"}
          </Text>

          <Text
            style={
              styles.tableCell
            }
          >
            {t(
              "invoice.qty"
            ) || "Qty"}
          </Text>

          <Text
            style={
              styles.tableCell
            }
          >
            {t(
              "invoice.rate"
            ) || "Rate"}
          </Text>

          <Text
            style={[
              styles.tableCell,
              {
                textAlign:
                  "right",
              },
            ]}
          >
            {t(
              "invoice.amount"
            ) ||
              "Amount"}
          </Text>
        </View>

        {(
          job.services || []
        ).length === 0 ? (
          <Text
            style={{
              color:
                "#9CA3AF",
              marginVertical: 8,
            }}
          >
            No services added
          </Text>
        ) : (
          (
            job.services || []
          ).map(
            (
              service: any,
              index: number
            ) => {
              const quantity =
                Number(
                  service.quantity ??
                    1
                )

              const estimatedPrice =
                Number(
                  service.estimatedPrice ??
                    0
                )

              const actualPrice =
                service.actualPrice !==
                  undefined &&
                service.actualPrice !==
                  null &&
                service.actualPrice !==
                  ""
                  ? Number(
                      service.actualPrice
                    )
                  : estimatedPrice

              const safeQuantity =
                Number.isFinite(
                  quantity
                )
                  ? quantity
                  : 1

              const safePrice =
                Number.isFinite(
                  actualPrice
                )
                  ? actualPrice
                  : 0

              const itemTotal =
                safeQuantity *
                safePrice

              return (
                <View
                  key={index}
                  style={
                    styles.tableRow
                  }
                >
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        flex: 3,
                        textAlign:
                          "left",
                      },
                    ]}
                  >
                    {
                      service.name
                    }
                  </Text>

                  <Text
                    style={
                      styles.tableCell
                    }
                  >
                    {
                      safeQuantity
                    }
                  </Text>

                  <Text
                    style={
                      styles.tableCell
                    }
                  >
                    ₹
                    {safePrice.toFixed(
                      2
                    )}
                  </Text>

                  <Text
                    style={[
                      styles.tableCell,
                      {
                        textAlign:
                          "right",
                      },
                    ]}
                  >
                    ₹
                    {itemTotal.toFixed(
                      2
                    )}
                  </Text>
                </View>
              )
            }
          )
        )}
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* PARTS */}
      {/* ------------------------------------------------------------------ */}

      <View
        style={styles.card}
      >
        <Text
          style={
            styles.cardTitle
          }
        >
          {t(
            "invoice.partsSupplied"
          ) ||
            "Parts Supplied"}
        </Text>

        <View
          style={
            styles.tableHeader
          }
        >
          <Text
            style={[
              styles.tableCell,
              {
                flex: 3,
                fontWeight:
                  "700",
                textAlign:
                  "left",
              },
            ]}
          >
            {t(
              "invoice.part"
            ) ||
              "Part Name"}
          </Text>

          <Text
            style={
              styles.tableCell
            }
          >
            {t(
              "invoice.qty"
            ) || "Qty"}
          </Text>

          <Text
            style={
              styles.tableCell
            }
          >
            {t(
              "invoice.rate"
            ) || "Rate"}
          </Text>

          <Text
            style={[
              styles.tableCell,
              {
                textAlign:
                  "right",
              },
            ]}
          >
            {t(
              "invoice.amount"
            ) ||
              "Amount"}
          </Text>
        </View>

        {(
          job.parts || []
        ).length === 0 ? (
          <Text
            style={{
              color:
                "#9CA3AF",
              marginVertical: 8,
            }}
          >
            No parts added
          </Text>
        ) : (
          (
            job.parts || []
          ).map(
            (
              part: any,
              index: number
            ) => {
              const quantity =
                Number(
                  part.quantity ??
                    1
                )

              const safeQuantity =
                Number.isFinite(
                  quantity
                )
                  ? quantity
                  : 1

              const actualUnitPrice =
                getPartUnitPrice(
                  part
                )

              const itemTotal =
                getPartTotal(
                  part
                )

              return (
                <View
                  key={index}
                  style={
                    styles.tableRow
                  }
                >
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        flex: 3,
                        textAlign:
                          "left",
                      },
                    ]}
                  >
                    {
                      part.name
                    }
                  </Text>

                  <Text
                    style={
                      styles.tableCell
                    }
                  >
                    {
                      safeQuantity
                    }
                  </Text>

                  <Text
                    style={
                      styles.tableCell
                    }
                  >
                    ₹
                    {actualUnitPrice.toFixed(
                      2
                    )}
                  </Text>

                  <Text
                    style={[
                      styles.tableCell,
                      {
                        textAlign:
                          "right",
                      },
                    ]}
                  >
                    ₹
                    {itemTotal.toFixed(
                      2
                    )}
                  </Text>
                </View>
              )
            }
          )
        )}
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* BILL SUMMARY */}
      {/* ------------------------------------------------------------------ */}

      <View
        style={styles.card}
      >
        <Text
          style={
            styles.cardTitle
          }
        >
          {t(
            "invoice.billSummary"
          ) ||
            "Bill Summary"}
        </Text>

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
              "invoice.servicesSubtotal"
            ) ||
              "Services Subtotal"}
          </Text>

          <Text
            style={
              styles.summaryValue
            }
          >
            {formatMoney(
              servicesTotal
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
              "invoice.partsSubtotal"
            ) ||
              "Parts Subtotal"}
          </Text>

          <Text
            style={
              styles.summaryValue
            }
          >
            +{" "}
            {formatMoney(
              partsTotal
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
              "invoice.laborFee"
            ) ||
              "Labor Fee"}
          </Text>

          <Text
            style={
              styles.summaryValue
            }
          >
            +{" "}
            {formatMoney(
              laborFee
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
              "invoice.subtotal"
            ) ||
              "Subtotal"}
          </Text>

          <Text
            style={
              styles.summaryValue
            }
          >
            {formatMoney(
              subTotal
            )}
          </Text>
        </View>

        {discountAmount >
          0 && (
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
                "invoice.discount"
              ) ||
                "Discount"}{" "}
              {discountType ===
              "percentage"
                ? `(${rawDiscountValue}%)`
                : "(Fixed)"}
            </Text>

            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    "#059669",
                },
              ]}
            >
              -{" "}
              {formatMoney(
                discountAmount
              )}
            </Text>
          </View>
        )}

        {gstEnabled && (
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
              GST (
              {gstPercent}%)
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              +{" "}
              {formatMoney(
                gstAmount
              )}
            </Text>
          </View>
        )}

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
              "invoice.roundOff"
            ) ||
              "Round Off"}
          </Text>

          <Text
            style={
              styles.summaryValue
            }
          >
            {roundOff >= 0
              ? "+"
              : ""}
            {formatMoney(
              roundOff
            )}
          </Text>
        </View>

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
              styles.grandLabel
            }
          >
            {t(
              "invoice.grandTotal"
            ) ||
              "Grand Total"}
          </Text>

          <Text
            style={
              styles.grandValue
            }
          >
            ₹
            {grandTotal.toFixed(
              2
            )}
          </Text>
        </View>
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* WARRANTY */}
      {/* ------------------------------------------------------------------ */}

      <View
        style={styles.card}
      >
        <Text
          style={
            styles.cardTitle
          }
        >
          {t(
            "invoice.warrantyTerms"
          ) ||
            "Warranty Terms"}
        </Text>

        <Text
          style={
            styles.description
          }
        >
          {invoiceSettings?.defaultWarranty ||
            DEFAULT_INVOICE_SETTINGS.defaultWarranty}
        </Text>
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* TERMS */}
      {/* ------------------------------------------------------------------ */}

      <View
        style={styles.card}
      >
        <Text
          style={
            styles.cardTitle
          }
        >
          {t(
            "invoice.terms"
          ) ||
            "Terms & Conditions"}
        </Text>

        <Text
          style={
            styles.description
          }
        >
          {invoiceSettings?.terms ||
            DEFAULT_INVOICE_SETTINGS.terms}
        </Text>
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER NOTE */}
      {/* ------------------------------------------------------------------ */}

      {invoiceSettings?.footerNote ? (
        <View
          style={styles.card}
        >
          <Text
            style={{
              textAlign:
                "center",
              color:
                "#6B7280",
            }}
          >
            {
              invoiceSettings.footerNote
            }
          </Text>
        </View>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/* SIGNATURES */}
      {/* ------------------------------------------------------------------ */}

      <View
        style={styles.card}
      >
        <View
          style={{
            flexDirection:
              "row",
            justifyContent:
              "space-between",
          }}
        >
          <View
            style={{
              alignItems:
                "center",
            }}
          >
            <View
              style={
                styles.signatureLine
              }
            />

            <Text
              style={
                styles.signatureText
              }
            >
              {t(
                "invoice.customerSig"
              ) ||
                "Customer Signature"}
            </Text>
          </View>

          <View
            style={{
              alignItems:
                "center",
            }}
          >
            <View
              style={
                styles.signatureLine
              }
            />

            <Text
              style={
                styles.signatureText
              }
            >
              {t(
                "invoice.authSig"
              ) ||
                "Authorized Signatory"}
            </Text>
          </View>
        </View>
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* ACTIONS */}
      {/* ------------------------------------------------------------------ */}

      <TouchableOpacity
        disabled={
          job.status !==
          "completed"
        }
        onPress={
          handleGeneratePDF
        }
        style={[
          styles.primaryButton,
          job.status !==
            "completed" &&
            styles.disabledButton,
        ]}
      >
        <Ionicons
          name="document-text-outline"
          size={22}
          color="white"
        />

        <Text
          style={
            styles.primaryButtonText
          }
        >
          {t(
            "invoice.generatePDF"
          ) ||
            "Generate PDF Invoice"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={
          styles.secondaryButton
        }
        onPress={
          handleShareInvoice
        }
      >
        <Ionicons
          name="share-social-outline"
          size={22}
          color="#2563EB"
        />

        <Text
          style={
            styles.secondaryButtonText
          }
        >
          {t(
            "invoice.share"
          ) ||
            "Share Invoice"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={
          styles.secondaryButton
        }
        onPress={
          handlePrintInvoice
        }
      >
        <Ionicons
          name="print-outline"
          size={22}
          color="#2563EB"
        />

        <Text
          style={
            styles.secondaryButtonText
          }
        >
          {t(
            "invoice.print"
          ) ||
            "Print Invoice"}
        </Text>
      </TouchableOpacity>

      <View
        style={{
          height: 40,
        }}
      />
    </ScrollView>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#F3F4F6",
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  loader: {
    flex: 1,
    justifyContent:
      "center",
    alignItems:
      "center",
    marginTop: 100,
  },

  // ---------------------------------------------------------------------------
  // HEADER BAR
  // ---------------------------------------------------------------------------

  headerBar: {
    flexDirection:
      "row",
    alignItems:
      "center",
    marginBottom: 20,
    marginTop: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor:
      "#FFFFFF",
    justifyContent:
      "center",
    alignItems:
      "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor:
      "#E5E7EB",
  },

  headerTextContainer: {
    flex: 1,
  },

  heading: {
    fontSize: 24,
    fontWeight:
      "bold",
    color:
      "#111827",
  },

  subHeading: {
    color:
      "#6B7280",
    fontSize: 13,
    marginTop: 2,
  },

  // ---------------------------------------------------------------------------
  // GARAGE HEADER
  // ---------------------------------------------------------------------------

  header: {
    backgroundColor:
      "white",
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems:
      "center",
    marginBottom: 16,
    borderRadius: 20,
    elevation: 2,
  },

  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor:
      "#EFF6FF",
    justifyContent:
      "center",
    alignItems:
      "center",
    marginBottom: 15,
  },

  logo: {
    width: 65,
    height: 65,
    resizeMode:
      "contain",
  },

  garageName: {
    fontSize: 24,
    fontWeight:
      "700",
    color:
      "#111827",
  },

  garageSubtitle: {
    marginTop: 4,
    fontSize: 15,
    color:
      "#374151",
  },

  garageAddress: {
    marginTop: 10,
    color:
      "#6B7280",
    textAlign:
      "center",
  },

  garagePhone: {
    marginTop: 4,
    color:
      "#6B7280",
  },

  gst: {
    marginTop: 6,
    fontWeight:
      "600",
    color:
      "#111827",
  },

  invoiceStrip: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderColor:
      "#E5E7EB",
    width: "100%",
    flexDirection:
      "row",
    justifyContent:
      "space-between",
  },

  invoiceLabel: {
    fontSize: 12,
    color:
      "#6B7280",
  },

  invoiceValue: {
    marginTop: 4,
    fontWeight:
      "700",
    fontSize: 15,
    color:
      "#111827",
  },

  // ---------------------------------------------------------------------------
  // CARD
  // ---------------------------------------------------------------------------

  card: {
    backgroundColor:
      "white",
    marginBottom: 16,
    borderRadius: 20,
    padding: 18,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight:
      "700",
    marginBottom: 16,
    color:
      "#111827",
  },

  // ---------------------------------------------------------------------------
  // COMMON
  // ---------------------------------------------------------------------------

  infoRow: {
    flexDirection:
      "row",
    alignItems:
      "center",
    marginBottom: 12,
  },

  infoText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
    color:
      "#374151",
  },

  divider: {
    height: 1,
    backgroundColor:
      "#E5E7EB",
    marginVertical: 18,
  },

  // ---------------------------------------------------------------------------
  // VEHICLE
  // ---------------------------------------------------------------------------

  vehicleHeader: {
    flexDirection:
      "row",
    alignItems:
      "center",
  },

  vehicleNumber: {
    fontSize: 20,
    fontWeight:
      "700",
    color:
      "#111827",
  },

  vehicleModel: {
    marginTop: 4,
    color:
      "#6B7280",
  },

  grid: {
    flexDirection:
      "row",
    flexWrap:
      "wrap",
    justifyContent:
      "space-between",
  },

  gridItem: {
    width: "48%",
    marginBottom: 16,
  },

  label: {
    fontSize: 12,
    color:
      "#6B7280",
    marginBottom: 6,
  },

  value: {
    fontWeight:
      "600",
    fontSize: 15,
    color:
      "#111827",
  },

  sectionLabel: {
    fontWeight:
      "700",
    fontSize: 15,
    marginBottom: 8,
    color:
      "#111827",
  },

  description: {
    fontSize: 14,
    lineHeight: 24,
    color:
      "#4B5563",
  },

  // ---------------------------------------------------------------------------
  // TABLE
  // ---------------------------------------------------------------------------

  tableHeader: {
    flexDirection:
      "row",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor:
      "#E5E7EB",
  },

  tableRow: {
    flexDirection:
      "row",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor:
      "#F3F4F6",
  },

  tableCell: {
    flex: 1,
    fontSize: 13,
    color:
      "#374151",
    textAlign:
      "center",
  },

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------

  summaryRow: {
    flexDirection:
      "row",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    marginBottom: 14,
  },

  summaryLabel: {
    fontSize: 15,
    color:
      "#374151",
    flex: 1,
  },

  summaryValue: {
    fontSize: 15,
    fontWeight:
      "600",
    color:
      "#111827",
  },

  grandLabel: {
    fontSize: 21,
    fontWeight:
      "700",
    color:
      "#111827",
  },

  grandValue: {
    fontSize: 28,
    fontWeight:
      "700",
    color:
      "#16A34A",
  },

  // ---------------------------------------------------------------------------
  // SIGNATURE
  // ---------------------------------------------------------------------------

  signatureLine: {
    width: 120,
    borderBottomWidth:
      1.5,
    borderBottomColor:
      "#9CA3AF",
    marginBottom: 8,
    marginTop: 40,
  },

  signatureText: {
    fontSize: 13,
    color:
      "#6B7280",
  },

  // ---------------------------------------------------------------------------
  // BUTTONS
  // ---------------------------------------------------------------------------

  primaryButton: {
    backgroundColor:
      "#2563EB",
    marginBottom: 12,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems:
      "center",
    justifyContent:
      "center",
    flexDirection:
      "row",
    elevation: 2,
  },

  primaryButtonText: {
    marginLeft: 10,
    color:
      "white",
    fontWeight:
      "700",
    fontSize: 16,
  },

  secondaryButton: {
    backgroundColor:
      "white",
    marginBottom: 12,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems:
      "center",
    justifyContent:
      "center",
    flexDirection:
      "row",
    borderWidth: 1,
    borderColor:
      "#E5E7EB",
  },

  secondaryButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight:
      "700",
    color:
      "#2563EB",
  },

  disabledButton: {
    backgroundColor:
      "#9CA3AF",
  },
})