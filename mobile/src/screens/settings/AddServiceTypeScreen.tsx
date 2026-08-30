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
import { Feather } from "@expo/vector-icons"
import { createServiceType } from "../../services/serviceTypesService"
import { useTranslation } from "../../context/LanguageContext"

interface FormErrors {
  name?: string
  category?: string
  defaultPrice?: string
  estimatedDuration?: string
}

export default function AddServiceTypeScreen({ navigation }: any) {
  const { t } = useTranslation()

  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [defaultPrice, setDefaultPrice] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = t("services.validation.nameReq") || "Service name is required"
    } else if (name.trim().length > 50) {
      newErrors.name = "Service name cannot exceed 50 characters"
    }

    if (!category.trim()) {
      newErrors.category = t("services.validation.categoryReq") || "Category is required"
    } else if (category.trim().length > 30) {
      newErrors.category = "Category cannot exceed 30 characters"
    }

    const numericPrice = Number(defaultPrice)
    if (!defaultPrice.trim()) {
      newErrors.defaultPrice = t("services.validation.priceReq") || "Default price is required"
    } else if (isNaN(numericPrice) || numericPrice < 0) {
      newErrors.defaultPrice = t("services.validation.priceValid") || "Enter a valid positive number"
    }

    if (!estimatedDuration.trim()) {
      newErrors.estimatedDuration = t("services.validation.durationReq") || "Duration is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveService = async () => {
    if (!validate()) return

    try {
      await createServiceType({
        name: name.trim(),
        category: category.trim(),
        defaultPrice: Number(defaultPrice),
        estimatedDuration: estimatedDuration.trim()
      })

      Alert.alert(
        t("common.successTitle") || "Success",
        t("services.addSuccess") || "Service added successfully"
      )
      navigation.goBack()
    } catch (error: any) {
      Alert.alert(
        t("common.errorTitle") || "Error",
        error?.response?.data?.message || t("services.addError") || "Failed to save service"
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
            {t("services.addServiceTitle") || "Add Service"}
          </Text>
          <Text style={styles.subHeading}>
            {t("services.addServiceSubtitle") || "Create a new service offerings"}
          </Text>
        </View>
      </View>

      {/* Name Field */}
      <FieldLabel label={t("services.labels.name") || "Service Name"} required />
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

      {/* Category Field */}
      <FieldLabel label={t("services.labels.category") || "Category"} required />
      <TextInput
        style={[styles.input, errors.category && styles.inputError]}
        value={category}
        maxLength={30}
        onChangeText={(val) => {
          setCategory(val)
          if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }))
        }}
      />
      {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

      {/* Default Price Field */}
      <FieldLabel label={t("services.labels.defaultPrice") || "Default Price (₹)"} required />
      <TextInput
        keyboardType="numeric"
        style={[styles.input, errors.defaultPrice && styles.inputError]}
        value={defaultPrice}
        onChangeText={(val) => {
          const numeric = val.replace(/[^0-9.]/g, "")
          setDefaultPrice(numeric)
          if (errors.defaultPrice) setErrors((prev) => ({ ...prev, defaultPrice: undefined }))
        }}
      />
      {errors.defaultPrice && <Text style={styles.errorText}>{errors.defaultPrice}</Text>}

      {/* Duration Field */}
      <FieldLabel label={t("services.labels.estimatedDuration") || "Duration"} required />
      <TextInput
        style={[styles.input, errors.estimatedDuration && styles.inputError]}
        value={estimatedDuration}
        onChangeText={(val) => {
          setEstimatedDuration(val)
          if (errors.estimatedDuration) setErrors((prev) => ({ ...prev, estimatedDuration: undefined }))
        }}
      />
      {errors.estimatedDuration && <Text style={styles.errorText}>{errors.estimatedDuration}</Text>}

      <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={saveService}>
        <Text style={styles.btnText}>{t("services.saveService") || "Save Service"}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 18
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