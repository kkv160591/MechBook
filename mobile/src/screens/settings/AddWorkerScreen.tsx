import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from "react-native"
import { useState } from "react"
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

export default function AddWorkerScreen() {
  const navigation: any = useNavigation()
  const { t } = useTranslation()

  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    // Name Validation
    if (!name.trim()) {
      newErrors.name = t("workers.validation.nameReq") || "Worker name is required"
    } else if (name.length > 50) {
      newErrors.name = "Name cannot exceed 50 characters"
    }

    // Role Validation
    if (!role.trim()) {
      newErrors.role = t("workers.validation.roleReq") || "Role is required"
    } else if (role.length > 30) {
      newErrors.role = "Role cannot exceed 30 characters"
    }

    // Phone Validation (10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phone.trim()) {
      newErrors.phone = t("workers.validation.phoneReq") || "Phone number is required"
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = t("workers.validation.phoneValid") || "Enter valid 10-digit mobile number"
    }

    // PIN Validation (4 digits)
    if (!pin) {
      newErrors.pin = t("workers.validation.pinReq") || "4-digit PIN is required"
    } else if (pin.length !== 4) {
      newErrors.pin = "PIN must be exactly 4 digits"
    }

    // Confirm PIN Validation
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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Name Field */}
      <FieldLabel label={t("workers.placeholders.name") || "Worker Name"} required />
      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        value={name}
        maxLength={50}
        onChangeText={(val) => {
          setName(val)
          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
        }}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      {/* Role Field */}
      <FieldLabel label={t("workers.placeholders.role") || "Role"} required />
      <TextInput
        style={[styles.input, errors.role && styles.inputError]}
        value={role}
        maxLength={30}
        onChangeText={(val) => {
          setRole(val)
          if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }))
        }}
      />
      {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}

      {/* Phone Field */}
      <FieldLabel label={t("workers.placeholders.phone") || "Phone Number"} required />
      <TextInput
        style={[styles.input, errors.phone && styles.inputError]}
        value={phone}
        maxLength={10}
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

      <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={saveWorker}>
        <Text style={styles.btnText}>
          {t("workers.saveWorker") || "Save Worker"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#F3F4F6"
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    marginTop: 8
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151"
  },
  requiredStar: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "bold"
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#111827",
    marginBottom: 4
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2"
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
    fontWeight: "500"
  },
  btn: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  }
})