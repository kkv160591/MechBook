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
import {
  getNotificationSettings,
  updateNotificationSettings
} from "../../services/settingsService"
import { useTranslation } from "../../context/LanguageContext"

interface NotificationRule {
  vehicleType: string
  serviceIntervalMonths: number
  serviceIntervalKm: number
}

interface NotificationSettings {
  enabled: boolean
  customer: {
    enabled: boolean
    daysBeforeDue: string
    kmBeforeDue: string
  }
  garageOwner: {
    enabled: boolean
    daysBeforeDue: string
    kmBeforeDue: string
  }
  vehicleRules: NotificationRule[]
}

interface FormErrors {
  customerDays?: string
  customerKm?: string
  ownerDays?: string
  ownerKm?: string
  vehicleRules?: {
    [key: string]: {
      months?: string
      km?: string
    }
  }
}

const DEFAULT_VEHICLE_RULES: NotificationRule[] = [
  {
    vehicleType: "CAR",
    serviceIntervalMonths: 12,
    serviceIntervalKm: 10000
  },
  {
    vehicleType: "BIKE",
    serviceIntervalMonths: 6,
    serviceIntervalKm: 5000
  },
  {
    vehicleType: "SUV",
    serviceIntervalMonths: 12,
    serviceIntervalKm: 10000
  },
  {
    vehicleType: "COMMERCIAL",
    serviceIntervalMonths: 6,
    serviceIntervalKm: 5000
  }
]

const VEHICLE_LABEL_KEYS: Record<string, string> = {
  CAR: "car",
  BIKE: "bike",
  SUV: "suv",
  COMMERCIAL: "commercial"
}

export default function NotificationSettingsScreen() {
  const navigation = useNavigation()
  const { t } = useTranslation()

  const scrollViewRef = useRef<ScrollView>(null)

  const [settings, setSettings] =
    useState<NotificationSettings>({
      enabled: true,

      customer: {
        enabled: true,
        daysBeforeDue: "30",
        kmBeforeDue: "500"
      },

      garageOwner: {
        enabled: true,
        daysBeforeDue: "30",
        kmBeforeDue: "500"
      },

      vehicleRules: DEFAULT_VEHICLE_RULES
    })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await getNotificationSettings()

      const data = response?.setting || response

      if (data) {
        setSettings({
          enabled:
            data.enabled !== undefined
              ? data.enabled
              : true,

          customer: {
            enabled:
              data.customer?.enabled !== undefined
                ? data.customer.enabled
                : true,

            daysBeforeDue:
              data.customer?.daysBeforeDue !== undefined
                ? String(data.customer.daysBeforeDue)
                : "30",

            kmBeforeDue:
              data.customer?.kmBeforeDue !== undefined
                ? String(data.customer.kmBeforeDue)
                : "500"
          },

          garageOwner: {
            enabled:
              data.garageOwner?.enabled !== undefined
                ? data.garageOwner.enabled
                : true,

            daysBeforeDue:
              data.garageOwner?.daysBeforeDue !== undefined
                ? String(data.garageOwner.daysBeforeDue)
                : "30",

            kmBeforeDue:
              data.garageOwner?.kmBeforeDue !== undefined
                ? String(data.garageOwner.kmBeforeDue)
                : "500"
          },

          vehicleRules:
            Array.isArray(data.vehicleRules) &&
            data.vehicleRules.length > 0
              ? data.vehicleRules.map((rule: any) => ({
                  vehicleType: rule.vehicleType,
                  serviceIntervalMonths:
                    Number(rule.serviceIntervalMonths) || 0,
                  serviceIntervalKm:
                    Number(rule.serviceIntervalKm) || 0
                }))
              : DEFAULT_VEHICLE_RULES
        })
      }
    } catch (err: any) {
      console.log(
        "Error loading notification settings",
        err
      )

      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        t("notifications.errorMsg")

      Alert.alert(
        t("common.errorTitle"),
        serverMsg
      )
    } finally {
      setLoading(false)
    }
  }

  const sanitizeIntegerInput = (text: string) => {
    return text.replace(/[^0-9]/g, "")
  }

  const updateCustomer = (
    field: "enabled" | "daysBeforeDue" | "kmBeforeDue",
    value: boolean | string
  ) => {
    setSettings(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }))
  }

  const updateGarageOwner = (
    field: "enabled" | "daysBeforeDue" | "kmBeforeDue",
    value: boolean | string
  ) => {
    setSettings(prev => ({
      ...prev,
      garageOwner: {
        ...prev.garageOwner,
        [field]: value
      }
    }))
  }

  const updateVehicleRule = (
    index: number,
    field:
      | "serviceIntervalMonths"
      | "serviceIntervalKm",
    value: string
  ) => {
    const sanitized = sanitizeIntegerInput(value)

    setSettings(prev => ({
      ...prev,
      vehicleRules: prev.vehicleRules.map(
        (rule, ruleIndex) =>
          ruleIndex === index
            ? {
                ...rule,
                [field]:
                  sanitized === ""
                    ? 0
                    : Number(sanitized)
              }
            : rule
      )
    }))

    const vehicleType =
      settings.vehicleRules[index]?.vehicleType

    if (!vehicleType) {
      return
    }

    setErrors(prev => {
      if (!prev.vehicleRules) {
        return prev
      }

      const {
        [vehicleType]: _removed,
        ...remainingVehicleRules
      } = prev.vehicleRules

      return {
        ...prev,
        vehicleRules: remainingVehicleRules
      }
    })
  }

  const validateForm = () => {
    const newErrors: FormErrors = {
      vehicleRules: {}
    }

    const customerDays =
      Number(settings.customer.daysBeforeDue)

    const customerKm =
      Number(settings.customer.kmBeforeDue)

    const ownerDays =
      Number(settings.garageOwner.daysBeforeDue)

    const ownerKm =
      Number(settings.garageOwner.kmBeforeDue)

    if (
      settings.customer.daysBeforeDue.trim() === "" ||
      isNaN(customerDays) ||
      customerDays < 0
    ) {
      newErrors.customerDays =
        t("notifications.validation.nonNegative")
    }

    if (
      settings.customer.kmBeforeDue.trim() === "" ||
      isNaN(customerKm) ||
      customerKm < 0
    ) {
      newErrors.customerKm =
        t("notifications.validation.nonNegative")
    }

    if (
      settings.garageOwner.daysBeforeDue.trim() === "" ||
      isNaN(ownerDays) ||
      ownerDays < 0
    ) {
      newErrors.ownerDays =
        t("notifications.validation.nonNegative")
    }

    if (
      settings.garageOwner.kmBeforeDue.trim() === "" ||
      isNaN(ownerKm) ||
      ownerKm < 0
    ) {
      newErrors.ownerKm =
        t("notifications.validation.nonNegative")
    }

    settings.vehicleRules.forEach(rule => {
      if (
        rule.serviceIntervalMonths <= 0 ||
        isNaN(rule.serviceIntervalMonths)
      ) {
        newErrors.vehicleRules![rule.vehicleType] = {
          ...(newErrors.vehicleRules![rule.vehicleType] || {}),
          months:
            t("notifications.validation.positiveNumber")
        }
      }

      if (
        rule.serviceIntervalKm <= 0 ||
        isNaN(rule.serviceIntervalKm)
      ) {
        newErrors.vehicleRules![rule.vehicleType] = {
          ...(newErrors.vehicleRules![rule.vehicleType] || {}),
          km:
            t("notifications.validation.positiveNumber")
        }
      }
    })

    if (
      Object.keys(newErrors).some(key => {
        if (key !== "vehicleRules") {
          return !!(newErrors as any)[key]
        }

        return Object.keys(newErrors.vehicleRules || {}).length > 0
      })
    ) {
      setErrors(newErrors)
      return false
    }

    setErrors({})
    return true
  }

  const saveSettings = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)

      await updateNotificationSettings({
        enabled: settings.enabled,

        customer: {
          enabled: settings.customer.enabled,
          daysBeforeDue:
            Number(settings.customer.daysBeforeDue),
          kmBeforeDue:
            Number(settings.customer.kmBeforeDue)
        },

        garageOwner: {
          enabled: settings.garageOwner.enabled,
          daysBeforeDue:
            Number(settings.garageOwner.daysBeforeDue),
          kmBeforeDue:
            Number(settings.garageOwner.kmBeforeDue)
        },

        vehicleRules: settings.vehicleRules.map(
          rule => ({
            vehicleType: rule.vehicleType,
            serviceIntervalMonths:
              Number(rule.serviceIntervalMonths),
            serviceIntervalKm:
              Number(rule.serviceIntervalKm)
          })
        )
      })

      Alert.alert(
        t("common.successTitle"),
        t("notifications.successMsg")
      )
    } catch (err: any) {
      console.log(
        "Error saving notification settings",
        err
      )

      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        t("notifications.errorMsg")

      Alert.alert(
        t("common.errorTitle"),
        serverMsg
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          {t("common.loading")}
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* HEADER */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather
            name="arrow-left"
            size={24}
            color="#111827"
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.heading}>
            {t("notifications.title")}
          </Text>

          <Text style={styles.subHeading}>
            {t("notifications.subtitle")}
          </Text>
        </View>
      </View>

      {/* MASTER SWITCH */}
      <Text style={styles.sectionTitle}>
        {t("notifications.generalTitle")}
      </Text>

      <View style={styles.card}>
        <SettingRow
          title={t("notifications.enableNotifications")}
          subtitle={t(
            "notifications.enableNotificationsSub"
          )}
          value={settings.enabled}
          onChange={() =>
            setSettings(prev => ({
              ...prev,
              enabled: !prev.enabled
            }))
          }
        />
      </View>

      {/* CUSTOMER REMINDERS */}
      <Text style={styles.sectionTitle}>
        {t("notifications.customerTitle")}
      </Text>

      <View style={styles.card}>
        <SettingRow
          title={t("notifications.customerEnabled")}
          subtitle={t(
            "notifications.customerEnabledSub"
          )}
          value={settings.customer.enabled}
          onChange={() =>
            updateCustomer(
              "enabled",
              !settings.customer.enabled
            )
          }
        />

        <View style={styles.divider} />

        <NumberField
          label={t("notifications.daysBeforeDue")}
          value={settings.customer.daysBeforeDue}
          onChangeText={text =>
            updateCustomer(
              "daysBeforeDue",
              sanitizeIntegerInput(text)
            )
          }
          suffix={t("notifications.days")}
          error={errors.customerDays}
          editable={
            settings.enabled &&
            settings.customer.enabled
          }
        />

        <NumberField
          label={t("notifications.kmBeforeDue")}
          value={settings.customer.kmBeforeDue}
          onChangeText={text =>
            updateCustomer(
              "kmBeforeDue",
              sanitizeIntegerInput(text)
            )
          }
          suffix="km"
          error={errors.customerKm}
          editable={
            settings.enabled &&
            settings.customer.enabled
          }
        />
      </View>

      {/* GARAGE OWNER */}
      <Text style={styles.sectionTitle}>
        {t("notifications.ownerTitle")}
      </Text>

      <View style={styles.card}>
        <SettingRow
          title={t("notifications.ownerEnabled")}
          subtitle={t(
            "notifications.ownerEnabledSub"
          )}
          value={settings.garageOwner.enabled}
          onChange={() =>
            updateGarageOwner(
              "enabled",
              !settings.garageOwner.enabled
            )
          }
        />

        <View style={styles.divider} />

        <NumberField
          label={t("notifications.daysBeforeDue")}
          value={settings.garageOwner.daysBeforeDue}
          onChangeText={text =>
            updateGarageOwner(
              "daysBeforeDue",
              sanitizeIntegerInput(text)
            )
          }
          suffix={t("notifications.days")}
          error={errors.ownerDays}
          editable={
            settings.enabled &&
            settings.garageOwner.enabled
          }
        />

        <NumberField
          label={t("notifications.kmBeforeDue")}
          value={settings.garageOwner.kmBeforeDue}
          onChangeText={text =>
            updateGarageOwner(
              "kmBeforeDue",
              sanitizeIntegerInput(text)
            )
          }
          suffix="km"
          error={errors.ownerKm}
          editable={
            settings.enabled &&
            settings.garageOwner.enabled
          }
        />
      </View>

      {/* VEHICLE SERVICE RULES */}
      <Text style={styles.sectionTitle}>
        {t("notifications.vehicleRulesTitle")}
      </Text>

      <Text style={styles.sectionDescription}>
        {t("notifications.vehicleRulesSubtitle")}
      </Text>

      {settings.vehicleRules.map(
        (rule, index) => {
          const ruleErrors =
            errors.vehicleRules?.[
              rule.vehicleType
            ]

          const vehicleLabel = t(
            `notifications.vehicleTypes.${
              VEHICLE_LABEL_KEYS[
                rule.vehicleType
              ] || "car"
            }`
          )

          return (
            <View
              key={rule.vehicleType}
              style={styles.card}
            >
              <View style={styles.vehicleHeader}>
                <View style={styles.vehicleIcon}>
                  <Feather
                    name="truck"
                    size={20}
                    color="#2563EB"
                  />
                </View>

                <Text style={styles.vehicleTitle}>
                  {vehicleLabel}
                </Text>
              </View>

              <NumberField
                label={t(
                  "notifications.serviceIntervalMonths"
                )}
                value={String(
                  rule.serviceIntervalMonths
                )}
                onChangeText={text =>
                  updateVehicleRule(
                    index,
                    "serviceIntervalMonths",
                    text
                  )
                }
                suffix={t("notifications.months")}
                error={ruleErrors?.months}
                editable={settings.enabled}
              />

              <NumberField
                label={t(
                  "notifications.serviceIntervalKm"
                )}
                value={String(
                  rule.serviceIntervalKm
                )}
                onChangeText={text =>
                  updateVehicleRule(
                    index,
                    "serviceIntervalKm",
                    text
                  )
                }
                suffix="km"
                error={ruleErrors?.km}
                editable={settings.enabled}
              />
            </View>
          )
        }
      )}

      {/* SAVE */}
      <TouchableOpacity
        style={[
          styles.saveBtn,
          saving && styles.saveBtnDisabled
        ]}
        onPress={saveSettings}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator
            color="#FFFFFF"
          />
        ) : (
          <Text style={styles.saveText}>
            {t("notifications.saveBtn")}
          </Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  )
}

function SettingRow({
  title,
  subtitle,
  value,
  onChange
}: {
  title: string
  subtitle?: string
  value: boolean
  onChange: () => void
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowTextContainer}>
        <Text style={styles.rowTitle}>
          {title}
        </Text>

        {subtitle && (
          <Text style={styles.rowSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
      />
    </View>
  )
}

function NumberField({
  label,
  value,
  onChangeText,
  suffix,
  error,
  editable = true
}: {
  label: string
  value: string
  onChangeText: (text: string) => void
  suffix: string
  error?: string
  editable?: boolean
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.inputLabel}>
        {label}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          !editable && styles.inputDisabled,
          error && styles.inputError
        ]}
      >
        <TextInput
          keyboardType="number-pad"
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          style={styles.numberInput}
          placeholder="0"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.suffix}>
          {suffix}
        </Text>
      </View>

      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
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

  sectionDescription: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: -4,
    marginBottom: 12
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4
  },

  rowTextContainer: {
    flex: 1,
    paddingRight: 16
  },

  rowTitle: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600"
  },

  rowSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 17
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16
  },

  field: {
    marginBottom: 16
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6
  },

  inputWrapper: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FAFAFA"
  },

  inputDisabled: {
    opacity: 0.55
  },

  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2"
  },

  numberInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#111827"
  },

  suffix: {
    paddingRight: 14,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280"
  },

  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500"
  },

  vehicleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18
  },

  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },

  vehicleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },

  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56
  },

  saveBtnDisabled: {
    opacity: 0.7
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16
  }
})