import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from "react-native"
import { useEffect, useState } from "react"
import { Feather } from "@expo/vector-icons"
import {
  getServiceTypeById,
  updateServiceType,
  deleteServiceType
} from "../../services/serviceTypesService"
import { useTranslation } from "../../context/LanguageContext"

interface FormErrors {
  name?: string
  category?: string
  defaultPrice?: string
  estimatedDuration?: string
}

export default function EditServiceTypeScreen({ route, navigation }: any) {
  const { t } = useTranslation()

  const [loading, setLoading] = useState(true)
  const [service, setService] = useState<any>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  const loadService = async () => {
    try {
      setLoading(true)
      const response = await getServiceTypeById(route.params.serviceId)
      setService(response?.service || response)
    } catch (error) {
      console.error(error)
      Alert.alert(
        t("common.errorTitle") || "Error",
        t("common.somethingWentWrong") || "Something went wrong"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadService()
  }, [])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!service.name?.trim()) {
      newErrors.name = t("services.validation.nameReq") || "Service name is required"
    } else if (service.name.trim().length > 50) {
      newErrors.name = "Service name cannot exceed 50 characters"
    }

    if (!service.category?.trim()) {
      newErrors.category = t("services.validation.categoryReq") || "Category is required"
    } else if (service.category.trim().length > 30) {
      newErrors.category = "Category cannot exceed 30 characters"
    }

    const priceVal = String(service.defaultPrice ?? "")
    const numericPrice = Number(priceVal)
    if (!priceVal.trim()) {
      newErrors.defaultPrice = t("services.validation.priceReq") || "Default price is required"
    } else if (isNaN(numericPrice) || numericPrice < 0) {
      newErrors.defaultPrice = t("services.validation.priceValid") || "Enter a valid positive number"
    }

    if (!service.estimatedDuration?.trim()) {
      newErrors.estimatedDuration = t("services.validation.durationReq") || "Duration is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveChanges = async () => {
    if (!validate()) return

    try {
      await updateServiceType(service.serviceTypeId, {
        ...service,
        name: service.name.trim(),
        category: service.category.trim(),
        defaultPrice: Number(service.defaultPrice),
        estimatedDuration: service.estimatedDuration.trim()
      })

      Alert.alert(
        t("common.successTitle") || "Success",
        t("services.updateSuccess") || "Service Updated"
      )
      navigation.goBack()
    } catch (error: any) {
      Alert.alert(
        t("common.errorTitle") || "Error",
        error?.response?.data?.message || t("services.updateError") || "Update Failed"
      )
    }
  }

  const removeService = async () => {
    Alert.alert(
      t("services.deleteConfirmTitle") || "Delete Service",
      t("services.deleteConfirmMessage") || "Are you sure?",
      [
        { text: t("common.cancel") || "Cancel", style: "cancel" },
        {
          text: t("services.deleteService") || "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteServiceType(service.serviceTypeId)
              navigation.goBack()
            } catch (error: any) {
              Alert.alert(
                t("common.errorTitle") || "Error",
                error?.response?.data?.message || t("services.deleteError") || "Failed to delete service"
              )
            }
          }
        }
      ]
    )
  }

  const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => (
    <View style={styles.labelContainer}>
      <Text style={styles.label}>{label}</Text>
      {required && <Text style={styles.requiredStar}> *</Text>}
    </View>
  )

  if (loading || !service) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>{t("common.loading") || "Loading..."}</Text>
      </View>
    )
  }

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
            {t("services.editServiceTitle") || "Edit Service"}
          </Text>
          <Text style={styles.subHeading}>
            {t("services.editServiceSubtitle") || "Modify service details and pricing"}
          </Text>
        </View>
      </View>

      {/* Name Field */}
      <FieldLabel label={t("services.labels.name") || "Service Name"} required />
      <TextInput
        value={service.name}
        style={[styles.input, errors.name && styles.inputError]}
        maxLength={50}
        onChangeText={(value) => {
          setService({ ...service, name: value })
          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
        }}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      {/* Category Field */}
      <FieldLabel label={t("services.labels.category") || "Category"} required />
      <TextInput
        value={service.category}
        style={[styles.input, errors.category && styles.inputError]}
        maxLength={30}
        onChangeText={(value) => {
          setService({ ...service, category: value })
          if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }))
        }}
      />
      {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

      {/* Default Price Field */}
      <FieldLabel label={t("services.labels.defaultPrice") || "Default Price (₹)"} required />
      <TextInput
        value={String(service.defaultPrice ?? "")}
        style={[styles.input, errors.defaultPrice && styles.inputError]}
        keyboardType="numeric"
        onChangeText={(value) => {
          const numeric = value.replace(/[^0-9.]/g, "")
          setService({ ...service, defaultPrice: numeric })
          if (errors.defaultPrice) setErrors((prev) => ({ ...prev, defaultPrice: undefined }))
        }}
      />
      {errors.defaultPrice && <Text style={styles.errorText}>{errors.defaultPrice}</Text>}

      {/* Duration Field */}
      <FieldLabel label={t("services.labels.estimatedDuration") || "Duration"} required />
      <TextInput
        value={service.estimatedDuration}
        style={[styles.input, errors.estimatedDuration && styles.inputError]}
        onChangeText={(value) => {
          setService({ ...service, estimatedDuration: value })
          if (errors.estimatedDuration) setErrors((prev) => ({ ...prev, estimatedDuration: undefined }))
        }}
      />
      {errors.estimatedDuration && <Text style={styles.errorText}>{errors.estimatedDuration}</Text>}

      <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={saveChanges}>
        <Text style={styles.btnText}>{t("services.updateService") || "Update Service"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.8} onPress={removeService}>
        <Text style={styles.btnText}>{t("services.deleteService") || "Delete Service"}</Text>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 14
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
  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20
  },
  deleteBtn: {
    backgroundColor: "#DC2626",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 30
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  }
})