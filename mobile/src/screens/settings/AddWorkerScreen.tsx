import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from "react-native"
import { useState } from "react"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { createWorker } from "../../services/workerService"
import { useTranslation } from "../../context/LanguageContext"

interface FormErrors {
  name?: string
  role?: string
  phone?: string
  pin?: string
  confirmPin?: string
}

const PREDEFINED_ROLES = [
  "Senior Mechanic",
  "Junior Mechanic",
  "Helper",
  "Auto Electrician",
  "AC Specialist",
  "Denter",
  "Painter",
  "Detailer",
  "Washing Staff",
  "Service Advisor",
  "Quality Inspector",
  "Storekeeper",
]

export default function AddWorkerScreen() {
  const navigation: any = useNavigation()
  const { t } = useTranslation()

  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")

  // Inline Combobox Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const [errors, setErrors] = useState<FormErrors>({})

  // Filter preset roles based on user input
  const filteredRoles = PREDEFINED_ROLES.filter((r) =>
    r.toLowerCase().includes(role.toLowerCase())
  )

  const handleSelectRole = (selectedRole: string) => {
    setRole(selectedRole)
    setIsDropdownOpen(false)
    if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = t("workers.validation.nameReq") || "Worker name is required"
    } else if (name.length > 50) {
      newErrors.name = "Name cannot exceed 50 characters"
    }

    if (!role.trim()) {
      newErrors.role = t("workers.validation.roleReq") || "Role is required"
    } else if (role.length > 30) {
      newErrors.role = "Role cannot exceed 30 characters"
    }

    const phoneRegex = /^[6-9]\d{9}$/
    if (!phone.trim()) {
      newErrors.phone = t("workers.validation.phoneReq") || "Phone number is required"
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = t("workers.validation.phoneValid") || "Enter valid 10-digit mobile number"
    }

    if (!pin) {
      newErrors.pin = t("workers.validation.pinReq") || "4-digit PIN is required"
    } else if (pin.length !== 4) {
      newErrors.pin = "PIN must be exactly 4 digits"
    }

    if (!confirmPin) {
      newErrors.confirmPin = "Please confirm the PIN"
    } else if (pin !== confirmPin) {
      newErrors.confirmPin = t("workers.validation.pinMatch") || "PINs do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveWorker = async () => {
    if (!validate()) return

    try {
      await createWorker({ name: name.trim(), role: role.trim(), phone, pin })
      Alert.alert(
        t("common.successTitle") || "Success",
        t("workers.addSuccess") || "Worker Added"
      )
      navigation.goBack()
    } catch (error: any) {
      Alert.alert(
        t("common.errorTitle") || "Error",
        error?.response?.data?.message || t("workers.addError") || "Failed to add worker"
      )
    }
  }

  const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => (
    <View style={styles.labelContainer}>
      <Text style={styles.label}>{label}</Text>
      {required && <Text style={styles.requiredStar}> *</Text>}
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP BAR WITH BACK BUTTON */}
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
              {t("workers.addWorkerTitle") || "Add New Worker"}
            </Text>
            <Text style={styles.subHeading}>
              {t("workers.addWorkerSubtitle") || "Enter staff credentials and details"}
            </Text>
          </View>
        </View>

        {/* WORKER DETAILS CARD */}
        <View style={styles.card}>
          {/* Name Field */}
          <FieldLabel label={t("workers.placeholders.name") || "Worker Name"} required />
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            maxLength={50}
            placeholder="Enter worker's full name"
            placeholderTextColor="#9CA3AF"
            onChangeText={(val) => {
              setName(val)
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
            }}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          {/* Editable Combobox Field (Role/Designation) */}
          <FieldLabel label={t("workers.placeholders.role") || "Designation / Role"} required />
          <View style={{ zIndex: 1000 }}>
            <View style={styles.comboboxInputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  { paddingRight: 40 },
                  errors.role && styles.inputError,
                ]}
                value={role}
                placeholder="Type or select designation..."
                placeholderTextColor="#9CA3AF"
                onFocus={() => setIsDropdownOpen(true)}
                onChangeText={(val) => {
                  setRole(val)
                  setIsDropdownOpen(true)
                  if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }))
                }}
              />
              <TouchableOpacity
                style={styles.chevronButton}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Text style={styles.chevronText}>{isDropdownOpen ? "▲" : "▼"}</Text>
              </TouchableOpacity>
            </View>

            {/* Inline Suggestion List Box */}
            {isDropdownOpen && filteredRoles.length > 0 && (
              <View style={styles.dropdownListContainer}>
                <ScrollView
                  style={{ maxHeight: 180 }}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredRoles.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.dropdownOption}
                      onPress={() => handleSelectRole(item)}
                    >
                      <Text style={styles.dropdownOptionText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}

          {/* Phone Field */}
          <FieldLabel label={t("workers.placeholders.phone") || "Phone Number"} required />
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            value={phone}
            maxLength={10}
            placeholder="10-digit mobile number"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            onChangeText={(val) => {
              const numeric = val.replace(/[^0-9]/g, "")
              setPhone(numeric)
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }))
            }}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          {/* PIN Field */}
          <FieldLabel label={t("workers.placeholders.pin") || "4 Digit PIN"} required />
          <TextInput
            style={[styles.input, errors.pin && styles.inputError]}
            value={pin}
            placeholder="Enter 4 digit PIN"
            placeholderTextColor="#9CA3AF"
            onChangeText={(val) => {
              const numeric = val.replace(/[^0-9]/g, "")
              setPin(numeric)
              if (errors.pin) setErrors((prev) => ({ ...prev, pin: undefined }))
            }}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
          />
          {errors.pin && <Text style={styles.errorText}>{errors.pin}</Text>}

          {/* Confirm PIN Field */}
          <FieldLabel label={t("workers.placeholders.confirmPin") || "Confirm PIN"} required />
          <TextInput
            style={[styles.input, errors.confirmPin && styles.inputError]}
            value={confirmPin}
            placeholder="Re-enter 4 digit PIN"
            placeholderTextColor="#9CA3AF"
            onChangeText={(val) => {
              const numeric = val.replace(/[^0-9]/g, "")
              setConfirmPin(numeric)
              if (errors.confirmPin) setErrors((prev) => ({ ...prev, confirmPin: undefined }))
            }}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
          />
          {errors.confirmPin && <Text style={styles.errorText}>{errors.confirmPin}</Text>}
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={saveWorker}>
          <Text style={styles.saveText}>{t("workers.saveWorker") || "Save Worker"}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
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
    borderColor: "#E5E7EB",
  },
  headerTextContainer: {
    flex: 1,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
  },
  subHeading: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 2,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  requiredStar: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
    fontSize: 15,
    color: "#111827",
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  comboboxInputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  chevronButton: {
    position: "absolute",
    right: 12,
    padding: 6,
  },
  chevronText: {
    fontSize: 12,
    color: "#6B7280",
  },
  dropdownListContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginTop: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownOptionText: {
    fontSize: 14,
    color: "#111827",
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: "500",
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})