import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native"

import { useState, useEffect, useRef } from "react"
import { useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { getInvoiceSettings, updateInvoiceSettings } from "../../services/settingsService"
import { useTranslation } from "../../context/LanguageContext"

interface InvoiceSettings {
  showGarageLogo?: boolean
  showGSTNumber?: boolean
  showGarageAddress?: boolean
  showCustomerAddress?: boolean
  showVehicleDetails?: boolean
  showPaymentDetails?: boolean
  footerNote?: string
  terms?: string
  defaultLaborCost?: string
  defaultDiscount?: string
  defaultDiscountType?: "percentage" | "fixed"
  defaultWarranty?: string
}

interface FormErrors {
  defaultLaborCost?: string
  defaultDiscount?: string
  defaultWarranty?: string
  footerNote?: string
  terms?: string
}

const MAX_FOOTER_LENGTH = 250
const MAX_TERMS_LENGTH = 1000
const MAX_WARRANTY_LENGTH = 300

export default function InvoiceSettingsScreen() {
  const navigation = useNavigation()
  const { t } = useTranslation()

  const scrollViewRef = useRef<ScrollView>(null)
  const sectionPositions = useRef<{ [key in keyof FormErrors]?: number }>({})

  const [settings, setSettings] = useState<InvoiceSettings>({
    showGarageLogo: true,
    showGSTNumber: true,
    showGarageAddress: true,
    showCustomerAddress: true,
    showVehicleDetails: true,
    showPaymentDetails: true,
    footerNote: "",
    terms: "",
    defaultLaborCost: "",
    defaultDiscount: "",
    defaultDiscountType: "percentage",
    defaultWarranty: ""
  })

  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await getInvoiceSettings()
      if (data) {
        setSettings({
          ...data,
          defaultLaborCost: data.defaultLaborCost !== undefined && data.defaultLaborCost !== null ? data.defaultLaborCost.toString() : "",
          defaultDiscount: data.defaultDiscount !== undefined && data.defaultDiscount !== null ? data.defaultDiscount.toString() : "",
          defaultDiscountType: data.defaultDiscountType || "percentage",
          defaultWarranty: data.defaultWarranty ?? ""
        })
      }
    } catch (err: any) {
      console.log("Error loading invoice settings", err)
      const serverMsg =
        err?.response?.data?.message || err?.message || t("invoiceSettings.errorMsg")
      Alert.alert(t("common.errorTitle"), serverMsg)
    } finally {
      setLoading(false)
    }
  }

  const toggle = (key: keyof InvoiceSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleLayout = (field: keyof FormErrors, y: number) => {
    sectionPositions.current[field] = y
  }

  const scrollToFirstError = (newErrors: FormErrors) => {
    const errorKeys: (keyof FormErrors)[] = [
      "defaultLaborCost",
      "defaultDiscount",
      "defaultWarranty",
      "footerNote",
      "terms"
    ]

    for (const key of errorKeys) {
      if (newErrors[key] && sectionPositions.current[key] !== undefined) {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, sectionPositions.current[key]! - 16),
          animated: true
        })
        break
      }
    }
  }

  const sanitizeNumericInput = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, "")
    const parts = cleaned.split(".")
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("")
    }
    return cleaned
  }

  const handleLaborCostChange = (text: string) => {
    const sanitized = sanitizeNumericInput(text)
    setSettings((prev) => ({ ...prev, defaultLaborCost: sanitized }))

    if (sanitized !== text && text !== "") {
      setErrors((prev) => ({
        ...prev,
        defaultLaborCost: t("invoiceSettings.validation.invalidNumber")
      }))
    } else {
      setErrors((prev) => ({ ...prev, defaultLaborCost: undefined }))
    }
  }

  const handleDiscountChange = (text: string, type = settings.defaultDiscountType) => {
    const sanitized = sanitizeNumericInput(text)
    const numVal = Number(sanitized)

    let errorMsg: string | undefined = undefined

    if (sanitized !== text && text !== "") {
      errorMsg = t("invoiceSettings.validation.invalidNumber")
    } else if (type === "percentage" && numVal > 100) {
      errorMsg = t("invoiceSettings.validation.invalidPercentage")
    }

    setSettings((prev) => ({ ...prev, defaultDiscount: sanitized }))
    setErrors((prev) => ({ ...prev, defaultDiscount: errorMsg }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (settings.defaultLaborCost && settings.defaultLaborCost.trim() !== "") {
      const laborVal = Number(settings.defaultLaborCost)
      if (isNaN(laborVal)) {
        newErrors.defaultLaborCost = t("invoiceSettings.validation.invalidNumber")
      } else if (laborVal < 0) {
        newErrors.defaultLaborCost = t("invoiceSettings.validation.negativeNotAllowed")
      }
    }

    if (settings.defaultDiscount && settings.defaultDiscount.trim() !== "") {
      const discountVal = Number(settings.defaultDiscount)
      if (isNaN(discountVal)) {
        newErrors.defaultDiscount = t("invoiceSettings.validation.invalidNumber")
      } else if (discountVal < 0) {
        newErrors.defaultDiscount = t("invoiceSettings.validation.negativeNotAllowed")
      } else if (
        settings.defaultDiscountType === "percentage" &&
        discountVal > 100
      ) {
        newErrors.defaultDiscount = t("invoiceSettings.validation.invalidPercentage")
      }
    }

    if (
      settings.defaultWarranty &&
      settings.defaultWarranty.trim().length > MAX_WARRANTY_LENGTH
    ) {
      newErrors.defaultWarranty = t("invoiceSettings.validation.warrantyTooLong")
    }

    if (
      settings.footerNote &&
      settings.footerNote.trim().length > MAX_FOOTER_LENGTH
    ) {
      newErrors.footerNote = t("invoiceSettings.validation.footerNoteTooLong")
    }

    if (settings.terms && settings.terms.trim().length > MAX_TERMS_LENGTH) {
      newErrors.terms = t("invoiceSettings.validation.termsTooLong")
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors)
      return false
    }

    return true
  }

  const saveSettings = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await updateInvoiceSettings({
        ...settings,
        defaultLaborCost: Number(settings.defaultLaborCost || 0),
        defaultDiscount: Number(settings.defaultDiscount || 0)
      })
      Alert.alert(t("common.successTitle"), t("invoiceSettings.successMsg"))
    } catch (err: any) {
      console.log("Error saving settings", err)
      const serverMsg =
        err?.response?.data?.message || err?.message || t("invoiceSettings.errorMsg")
      Alert.alert(t("common.errorTitle"), serverMsg)
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    )
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Bar with Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.heading}>
            {t("invoiceSettings.title") || "Invoice Settings"}
          </Text>
          <Text style={styles.subHeading}>
            {t("invoiceSettings.subtitle") || "Configure billing defaults and PDF details"}
          </Text>
        </View>
      </View>

      {/* BILLING DEFAULTS */}
      <Text style={styles.sectionTitle}>{t("invoiceSettings.billingDefaults")}</Text>

      <View style={styles.card}>
        {/* Labor Cost */}
        <View onLayout={(e) => handleLayout("defaultLaborCost", e.nativeEvent.layout.y)}>
          <Text style={styles.inputLabel}>{t("invoiceSettings.defaultLaborCost")}</Text>
          <TextInput
            keyboardType="decimal-pad"
            value={settings.defaultLaborCost}
            onChangeText={handleLaborCostChange}
            placeholder="0"
            style={[styles.textInput, errors.defaultLaborCost ? styles.inputError : null]}
          />
          {errors.defaultLaborCost && (
            <Text style={styles.errorText}>{errors.defaultLaborCost}</Text>
          )}
        </View>

        {/* Discount */}
        <View
          style={{ marginTop: 16 }}
          onLayout={(e) => handleLayout("defaultDiscount", e.nativeEvent.layout.y)}
        >
          <Text style={styles.inputLabel}>{t("invoiceSettings.defaultDiscount")}</Text>
          <View style={styles.discountRow}>
            <TextInput
              keyboardType="decimal-pad"
              value={settings.defaultDiscount}
              onChangeText={(text) => handleDiscountChange(text)}
              placeholder="0"
              style={[
                styles.textInput,
                { flex: 1, marginRight: 10 },
                errors.defaultDiscount ? styles.inputError : null
              ]}
            />

            <View style={styles.toggleGroup}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  settings.defaultDiscountType === "percentage" && styles.toggleBtnActive
                ]}
                onPress={() => {
                  setSettings((prev) => ({ ...prev, defaultDiscountType: "percentage" }))
                  handleDiscountChange(settings.defaultDiscount || "", "percentage")
                }}
              >
                <Text
                  style={[
                    styles.toggleText,
                    settings.defaultDiscountType === "percentage" && styles.toggleTextActive
                  ]}
                >
                  %
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  settings.defaultDiscountType === "fixed" && styles.toggleBtnActive
                ]}
                onPress={() => {
                  setSettings((prev) => ({ ...prev, defaultDiscountType: "fixed" }))
                  handleDiscountChange(settings.defaultDiscount || "", "fixed")
                }}
              >
                <Text
                  style={[
                    styles.toggleText,
                    settings.defaultDiscountType === "fixed" && styles.toggleTextActive
                  ]}
                >
                  ₹
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {errors.defaultDiscount && (
            <Text style={styles.errorText}>{errors.defaultDiscount}</Text>
          )}
        </View>
      </View>

      {/* PDF TOGGLES */}
      <Text style={styles.sectionTitle}>{t("invoiceSettings.pdfFields")}</Text>

      <View style={styles.card}>
        <SettingRow
          title={t("invoiceSettings.showGarageLogo")}
          value={!!settings.showGarageLogo}
          onChange={() => toggle("showGarageLogo")}
        />
        <SettingRow
          title={t("invoiceSettings.showGSTNumber")}
          value={!!settings.showGSTNumber}
          onChange={() => toggle("showGSTNumber")}
        />
        <SettingRow
          title={t("invoiceSettings.showGarageAddress")}
          value={!!settings.showGarageAddress}
          onChange={() => toggle("showGarageAddress")}
        />
        <SettingRow
          title={t("invoiceSettings.showCustomerAddress")}
          value={!!settings.showCustomerAddress}
          onChange={() => toggle("showCustomerAddress")}
        />
        <SettingRow
          title={t("invoiceSettings.showVehicleDetails")}
          value={!!settings.showVehicleDetails}
          onChange={() => toggle("showVehicleDetails")}
        />
        <SettingRow
          title={t("invoiceSettings.showPaymentDetails")}
          value={!!settings.showPaymentDetails}
          onChange={() => toggle("showPaymentDetails")}
        />
      </View>

      {/* WARRANTY SETTINGS */}
      <Text style={styles.sectionTitle}>{t("invoiceSettings.warrantyTitle")}</Text>

      <View
        style={styles.card}
        onLayout={(e) => handleLayout("defaultWarranty", e.nativeEvent.layout.y)}
      >
        <TextInput
          multiline
          maxLength={MAX_WARRANTY_LENGTH}
          value={settings.defaultWarranty}
          onChangeText={(text) => {
            setSettings((prev) => ({ ...prev, defaultWarranty: text }))
            if (errors.defaultWarranty) {
              setErrors((prev) => ({ ...prev, defaultWarranty: undefined }))
            }
          }}
          placeholder={t("invoiceSettings.defaultWarrantyPlaceholder")}
          style={[styles.textArea, errors.defaultWarranty ? styles.inputError : null]}
        />
        <View style={styles.metaRow}>
          {errors.defaultWarranty ? (
            <Text style={styles.errorText}>{errors.defaultWarranty}</Text>
          ) : (
            <View />
          )}
          <Text style={styles.charCounter}>
            {(settings.defaultWarranty || "").length}/{MAX_WARRANTY_LENGTH}
          </Text>
        </View>
      </View>

      {/* FOOTER NOTE */}
      <Text style={styles.sectionTitle}>{t("invoiceSettings.footerNote")}</Text>

      <View
        style={styles.card}
        onLayout={(e) => handleLayout("footerNote", e.nativeEvent.layout.y)}
      >
        <TextInput
          multiline
          maxLength={MAX_FOOTER_LENGTH}
          value={settings.footerNote}
          onChangeText={(text) => {
            setSettings((prev) => ({ ...prev, footerNote: text }))
            if (errors.footerNote) {
              setErrors((prev) => ({ ...prev, footerNote: undefined }))
            }
          }}
          placeholder={t("invoiceSettings.footerNotePlaceholder")}
          style={[styles.textArea, errors.footerNote ? styles.inputError : null]}
        />
        <View style={styles.metaRow}>
          {errors.footerNote ? (
            <Text style={styles.errorText}>{errors.footerNote}</Text>
          ) : (
            <View />
          )}
          <Text style={styles.charCounter}>
            {(settings.footerNote || "").length}/{MAX_FOOTER_LENGTH}
          </Text>
        </View>
      </View>

      {/* TERMS & CONDITIONS */}
      <Text style={styles.sectionTitle}>{t("invoiceSettings.terms")}</Text>

      <View
        style={styles.card}
        onLayout={(e) => handleLayout("terms", e.nativeEvent.layout.y)}
      >
        <TextInput
          multiline
          maxLength={MAX_TERMS_LENGTH}
          value={settings.terms}
          onChangeText={(text) => {
            setSettings((prev) => ({ ...prev, terms: text }))
            if (errors.terms) {
              setErrors((prev) => ({ ...prev, terms: undefined }))
            }
          }}
          placeholder={t("invoiceSettings.termsPlaceholder")}
          style={[styles.textArea, errors.terms ? styles.inputError : null]}
        />
        <View style={styles.metaRow}>
          {errors.terms ? (
            <Text style={styles.errorText}>{errors.terms}</Text>
          ) : (
            <View />
          )}
          <Text style={styles.charCounter}>
            {(settings.terms || "").length}/{MAX_TERMS_LENGTH}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
        <Text style={styles.saveText}>{t("invoiceSettings.saveBtn")}</Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  )
}

function SettingRow({
  title,
  value,
  onChange
}: {
  title: string
  value: boolean
  onChange: () => void
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  headerTextContainer: {
    flex: 1
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827"
  },
  subHeading: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 2
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6"
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontWeight: "600"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    marginTop: 10
  },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10
  },
  rowTitle: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600"
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FAFAFA"
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  toggleGroup: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 3,
    height: 48,
    alignItems: "center"
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10
  },
  toggleBtnActive: {
    backgroundColor: "#2563EB"
  },
  toggleText: {
    fontWeight: "700",
    color: "#4B5563"
  },
  toggleTextActive: {
    color: "white"
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    color: "#111827",
    backgroundColor: "#FAFAFA"
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2"
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500"
  },
  charCounter: {
    fontSize: 12,
    color: "#9CA3AF"
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center"
  },
  saveText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16
  }
})