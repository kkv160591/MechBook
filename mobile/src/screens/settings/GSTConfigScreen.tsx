// GSTConfigScreen.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator
} from "react-native"

import { useState, useEffect, useRef } from "react"
import { getGSTSettings, updateGSTSettings } from "../../services/settingsService"
import { useTranslation } from "../../context/LanguageContext"

// Valid 15-digit Indian GSTIN Regex
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
const VALID_RATES = [5, 12, 18, 28]

interface FormErrors {
  gstNumber?: string
  defaultRate?: string
  applyMode?: string
}

export default function GSTConfigScreen() {
  const { t } = useTranslation()

  // ScrollView Reference & Section Y-Offsets
  const scrollViewRef = useRef<ScrollView>(null)
  const sectionPositions = useRef<{ [key in keyof FormErrors]?: number }>({})

  const [enabled, setEnabled] = useState(false)
  const [gstNumber, setGstNumber] = useState("")
  const [defaultRate, setDefaultRate] = useState<number>(18)
  const [applyMode, setApplyMode] = useState<string>("invoice")
  const [loading, setLoading] = useState(true)

  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await getGSTSettings()
      if (data) {
        setEnabled(data.enabled ?? false)
        setGstNumber(data.gstNumber ?? "")
        setDefaultRate(data.defaultRate ?? 18)
        setApplyMode(data.applyMode ?? "invoice")
      }
    } finally {
      setLoading(false)
    }
  }

  // Store layout Y-position for each field section
  const handleLayout = (field: keyof FormErrors, y: number) => {
    sectionPositions.current[field] = y
  }

  // Scroll to the first field containing an error
  const scrollToFirstError = (newErrors: FormErrors) => {
    const errorKeys: (keyof FormErrors)[] = ["gstNumber", "defaultRate", "applyMode"]
    
    for (const key of errorKeys) {
      if (newErrors[key] && sectionPositions.current[key] !== undefined) {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, sectionPositions.current[key]! - 16), // Padding offset
          animated: true
        })
        break
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 1. Validate GSTIN
    if (enabled) {
      const trimmedGst = gstNumber.trim().toUpperCase()

      if (!trimmedGst) {
        newErrors.gstNumber = t('gstConfig.validation.gstNumberReq')
      } else if (!GSTIN_REGEX.test(trimmedGst)) {
        newErrors.gstNumber = t('gstConfig.validation.gstNumberInvalid')
      }
    }

    // 2. Validate Default GST Rate
    if (typeof defaultRate !== "number" || isNaN(defaultRate) || defaultRate < 0 || defaultRate > 50) {
      newErrors.defaultRate = t('gstConfig.validation.invalidRate')
    }

    // 3. Validate Apply Mode Selection
    if (!["invoice", "line-item"].includes(applyMode)) {
      newErrors.applyMode = t('gstConfig.validation.invalidMode')
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
      await updateGSTSettings({
        enabled,
        gstNumber: enabled ? gstNumber.trim().toUpperCase() : "",
        defaultRate,
        applyMode
      })

      Alert.alert(
        t('common.successTitle'),
        t('gstConfig.successMsg')
      )
    } catch {
      Alert.alert(
        t('common.errorTitle'),
        t('gstConfig.errorMsg')
      )
    }
  }

  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    )
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Enable GST Section */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.flexShrink}>
            <Text style={styles.label}>
              {t('gstConfig.enableGst')}
            </Text>
            <Text style={styles.subLabel}>
              {t('gstConfig.enableGstSub')}
            </Text>
          </View>

          <Switch
            value={enabled}
            onValueChange={(val) => {
              setEnabled(val)
              setErrors({})
            }}
          />
        </View>
      </View>

      {/* GST Number Field */}
      <View
        style={[styles.card, !enabled && styles.disabledCard]}
        onLayout={(e) => handleLayout("gstNumber", e.nativeEvent.layout.y)}
      >
        <Text style={styles.label}>
          {t('gstConfig.gstNumber')} {enabled && <Text style={styles.requiredStar}>*</Text>}
        </Text>

        <TextInput
          value={gstNumber}
          onChangeText={(text) => {
            setGstNumber(text.toUpperCase())
            clearFieldError("gstNumber")
          }}
          placeholder={t('gstConfig.gstNumberPlaceholder')}
          style={[styles.input, errors.gstNumber ? styles.inputError : null]}
          editable={enabled}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={15}
        />

        {errors.gstNumber ? (
          <Text style={styles.errorText}>{errors.gstNumber}</Text>
        ) : null}
      </View>

      {/* Default GST Rate Selection */}
      <View
        style={styles.card}
        onLayout={(e) => handleLayout("defaultRate", e.nativeEvent.layout.y)}
      >
        <Text style={styles.label}>
          {t('gstConfig.defaultRate')} <Text style={styles.requiredStar}>*</Text>
        </Text>

        <View style={styles.rateContainer}>
          {VALID_RATES.map(rate => (
            <TouchableOpacity
              key={rate}
              style={[
                styles.rateBtn,
                defaultRate === rate && styles.selectedRate
              ]}
              onPress={() => {
                setDefaultRate(rate)
                clearFieldError("defaultRate")
              }}
            >
              <Text
                style={[
                  styles.rateText,
                  defaultRate === rate && styles.selectedRateText
                ]}
              >
                {rate}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {errors.defaultRate ? (
          <Text style={styles.errorText}>{errors.defaultRate}</Text>
        ) : null}
      </View>

      {/* GST Apply Mode */}
      <View
        style={styles.card}
        onLayout={(e) => handleLayout("applyMode", e.nativeEvent.layout.y)}
      >
        <Text style={styles.label}>
          {t('gstConfig.applyMode')} <Text style={styles.requiredStar}>*</Text>
        </Text>

        <TouchableOpacity
          style={[
            styles.modeBtn,
            applyMode === "invoice" && styles.selectedMode
          ]}
          onPress={() => {
            setApplyMode("invoice")
            clearFieldError("applyMode")
          }}
        >
          <Text style={styles.modeTitle}>
            {t('gstConfig.invoiceLevel')}
          </Text>
          <Text style={styles.modeDesc}>
            {t('gstConfig.invoiceLevelDesc')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeBtn,
            applyMode === "line-item" && styles.selectedMode
          ]}
          onPress={() => {
            setApplyMode("line-item")
            clearFieldError("applyMode")
          }}
        >
          <Text style={styles.modeTitle}>
            {t('gstConfig.lineItemLevel')}
          </Text>
          <Text style={styles.modeDesc}>
            {t('gstConfig.lineItemDesc')}
          </Text>
        </TouchableOpacity>

        {errors.applyMode ? (
          <Text style={styles.errorText}>{errors.applyMode}</Text>
        ) : null}
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={saveSettings}
      >
        <Text style={styles.saveText}>
          {t('gstConfig.saveBtn')}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
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

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16
  },

  disabledCard: {
    opacity: 0.6
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  flexShrink: {
    flexShrink: 1,
    marginRight: 10
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },

  subLabel: {
    color: "#6B7280",
    marginTop: 4
  },

  requiredStar: {
    color: "#DC2626"
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    color: "#111827",
    fontSize: 15
  },

  inputError: {
    borderColor: "#DC2626"
  },

  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 6
  },

  rateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14
  },

  rateBtn: {
    width: "22%",
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center"
  },

  selectedRate: {
    backgroundColor: "#2563EB"
  },

  rateText: {
    fontWeight: "700",
    color: "#374151"
  },

  selectedRateText: {
    color: "white"
  },

  modeBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginTop: 12
  },

  selectedMode: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF"
  },

  modeTitle: {
    fontWeight: "700",
    color: "#111827"
  },

  modeDesc: {
    color: "#6B7280",
    marginTop: 4
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