// InvoiceSettingsScreen.tsx
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
}

interface FormErrors {
  footerNote?: string
  terms?: string
}

// Sensible constraints for PDF generation layout
const MAX_FOOTER_LENGTH = 250
const MAX_TERMS_LENGTH = 1000

export default function InvoiceSettingsScreen() {
  const { t } = useTranslation()

  // ScrollView Reference & Section Positions
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
    terms: ""
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
        setSettings(data)
      }
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
    const errorKeys: (keyof FormErrors)[] = ["footerNote", "terms"]

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 1. Footer Note Validation
    if (settings.footerNote && settings.footerNote.trim().length > MAX_FOOTER_LENGTH) {
      newErrors.footerNote = t("invoiceSettings.validation.footerNoteTooLong")
    }

    // 2. Terms & Conditions Validation
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

  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const saveSettings = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await updateInvoiceSettings(settings)
      Alert.alert(t("common.successTitle"), t("invoiceSettings.successMsg"))
    } catch {
      Alert.alert(t("common.errorTitle"), t("invoiceSettings.errorMsg"))
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
      {/* PDF Toggle Options */}
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

      {/* Footer Note */}
      <Text style={styles.sectionTitle}>{t("invoiceSettings.footerNote")}</Text>

      <View
        style={styles.card}
        onLayout={(e) => handleLayout("footerNote", e.nativeEvent.layout.y)}
      >
        <TextInput
          multiline
          value={settings.footerNote}
          onChangeText={(text) => {
            setSettings((prev) => ({ ...prev, footerNote: text }))
            clearFieldError("footerNote")
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

      {/* Terms & Conditions */}
      <Text style={styles.sectionTitle}>{t("invoiceSettings.terms")}</Text>

      <View
        style={styles.card}
        onLayout={(e) => handleLayout("terms", e.nativeEvent.layout.y)}
      >
        <TextInput
          multiline
          value={settings.terms}
          onChangeText={(text) => {
            setSettings((prev) => ({ ...prev, terms: text }))
            clearFieldError("terms")
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

      {/* Save Button */}
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
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    color: "#111827"
  },
  inputError: {
    borderColor: "#DC2626"
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12
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