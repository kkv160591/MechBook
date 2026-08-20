import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal
} from "react-native"
import { useEffect, useState, useRef } from "react"
import { MaterialIcons, Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { getGarageProfile, updateGarageProfile } from "../../services/garageService"
import { useTranslation } from "../../context/LanguageContext"

interface ValidationErrors {
  garageName?: string
  ownerName?: string
  phone?: string
  email?: string
  gstNumber?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  vehicleTypes?: string
}

export default function GarageProfileScreen() {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const scrollViewRef = useRef<ScrollView>(null)

  const [garage, setGarage] = useState<any>(null)
  const [errors, setErrors] = useState<ValidationErrors>({})
  
  // Backend Error Modal State
  const [backendErrorModal, setBackendErrorModal] = useState<string | null>(null)

  // Layout positions for scroll-to-error
  const fieldYPositions = useRef<{ [key: string]: number }>({})

  const loadProfile = async () => {
    try {
      const response = await getGarageProfile()
      const vehicleTypes = Array.isArray(response.garage?.vehicleTypes)
        ? response.garage.vehicleTypes
        : response.garage?.vehicleTypes
        ? String(response.garage.vehicleTypes)
            .split(",")
            .map((v: string) => v.trim())
        : []

      setGarage({
        ...response.garage,
        vehicleTypes
      })
    } catch (error: any) {
      setBackendErrorModal(
        error?.response?.data?.message ||
          t("common.somethingWentWrong") ||
          "Failed to load garage profile."
      )
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  if (!garage) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t("common.loading") || "Loading..."}</Text>
      </View>
    )
  }

  const vehicleOptions = [
    { key: "2 Wheeler", label: t("garageProfile.vehicles.twoWheeler") || "2 Wheeler" },
    { key: "4 Wheeler", label: t("garageProfile.vehicles.fourWheeler") || "4 Wheeler" },
    { key: "Commercial", label: t("garageProfile.vehicles.commercial") || "Commercial" },
    { key: "Truck", label: t("garageProfile.vehicles.truck") || "Truck" },
    { key: "Bus", label: t("garageProfile.vehicles.bus") || "Bus" }
  ]

  const storeFieldPosition = (fieldName: string, y: number) => {
    fieldYPositions.current[fieldName] = y
  }

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {}

    // Garage Name Validation
    if (!garage.garageName?.trim()) {
      newErrors.garageName = t("register.validation.garageNameReq") || "Garage name is required"
    } else if (garage.garageName.length > 50) {
      newErrors.garageName = "Garage name cannot exceed 50 characters"
    }

    // Owner Name Validation
    if (!garage.ownerName?.trim()) {
      newErrors.ownerName = t("register.validation.ownerNameReq") || "Owner name is required"
    } else if (garage.ownerName.length > 50) {
      newErrors.ownerName = "Owner name cannot exceed 50 characters"
    }

    // Phone Validation (Must start with 6-9 and be 10 digits)
    const phoneRegex = /^[6-9]\d{9}$/
    if (!garage.phone?.trim()) {
      newErrors.phone = t("register.validation.phoneReq") || "Phone number is required"
    } else if (!phoneRegex.test(garage.phone)) {
      newErrors.phone = t("register.validation.phoneValid") || "Enter valid 10 digit phone number"
    }

    // Email Validation (Optional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (garage.email?.trim() && !emailRegex.test(garage.email.trim())) {
      newErrors.email = "Enter a valid email address"
    }

    // GST Validation (Optional - 15 Alphanumeric)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    if (garage.gstNumber?.trim() && !gstRegex.test(garage.gstNumber.toUpperCase())) {
      newErrors.gstNumber = "Enter a valid 15-character GSTIN"
    }

    // Address Validation
    if (!garage.address?.trim()) {
      newErrors.address = t("register.validation.addressReq") || "Address is required"
    } else if (garage.address.length > 120) {
      newErrors.address = "Address cannot exceed 120 characters"
    }

    // City & State Validation
    if (!garage.city?.trim()) {
      newErrors.city = "City is required"
    }
    if (!garage.state?.trim()) {
      newErrors.state = "State is required"
    }

    // Pincode Validation
    const pinRegex = /^\d{6}$/
    if (!garage.pincode?.trim()) {
      newErrors.pincode = "Pincode is required"
    } else if (!pinRegex.test(garage.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit pincode"
    }

    // Vehicle Types Validation
    if (!garage.vehicleTypes || garage.vehicleTypes.length === 0) {
      newErrors.vehicleTypes = "Select at least one vehicle type"
    }

    setErrors(newErrors)

    // Scroll to the first error field
    const errorKeys = Object.keys(newErrors)
    if (errorKeys.length > 0) {
      const firstErrorField = errorKeys[0]
      const yPos = fieldYPositions.current[firstErrorField]
      if (yPos !== undefined && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: Math.max(0, yPos - 20), animated: true })
      }
      return false
    }

    return true
  }

  const toggleVehicle = (typeKey: string) => {
    const currentVehicles = Array.isArray(garage.vehicleTypes) ? garage.vehicleTypes : []
    const updated = currentVehicles.includes(typeKey)
      ? currentVehicles.filter((v: string) => v !== typeKey)
      : [...currentVehicles, typeKey]

    setGarage((prev: any) => ({ ...prev, vehicleTypes: updated }))
    if (errors.vehicleTypes && updated.length > 0) {
      setErrors((prev) => ({ ...prev, vehicleTypes: undefined }))
    }
  }

  const saveProfile = async () => {
    if (!validate()) return

    try {
      await updateGarageProfile(garage)
      Alert.alert(
        t("common.successTitle") || "Success",
        t("garageProfile.successMsg") || "Garage Profile Updated"
      )
    } catch (error: any) {
      const backendMsg =
        error?.response?.data?.message ||
        t("garageProfile.errorMsg") ||
        "Failed to update profile"
      setBackendErrorModal(backendMsg)
    }
  }

  // Label component with optional mandatory star
  const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => (
    <View style={styles.labelContainer}>
      <Text style={styles.label}>{label}</Text>
      {required && <Text style={styles.requiredStar}> *</Text>}
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
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
              {t("garageProfile.title") || "Garage Profile"}
            </Text>
            <Text style={styles.subHeading}>
              {t("garageProfile.subtitle") || "Manage garage information"}
            </Text>
          </View>
        </View>

        {/* LOGO CARD */}
        <View style={styles.logoCard}>
          <View style={styles.logoBox}>
            <MaterialIcons name="garage" size={40} color="#2563EB" />
          </View>
          <TouchableOpacity style={styles.logoBtn} activeOpacity={0.7}>
            <Text style={styles.logoText}>
              {t("garageProfile.uploadLogo") || "Upload Logo"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* GARAGE INFO CARD */}
        <View style={styles.card}>
          <Text style={styles.section}>
            {t("garageProfile.sections.info") || "Garage Information"}
          </Text>

          {/* Garage Name */}
          <View onLayout={(e) => storeFieldPosition("garageName", e.nativeEvent.layout.y)}>
            <FieldLabel label={t("garageProfile.placeholders.garageName") || "Garage Name"} required />
            <TextInput
              style={[styles.input, errors.garageName && styles.inputError]}
              value={garage.garageName}
              maxLength={50}
              placeholder={t("garageProfile.placeholders.garageName") || "Garage Name"}
              onChangeText={(value) => {
                setGarage((prev: any) => ({ ...prev, garageName: value }))
                if (errors.garageName) setErrors((prev) => ({ ...prev, garageName: undefined }))
              }}
            />
            {errors.garageName && <Text style={styles.errorText}>{errors.garageName}</Text>}
          </View>

          {/* Owner Name */}
          <View onLayout={(e) => storeFieldPosition("ownerName", e.nativeEvent.layout.y)}>
            <FieldLabel label={t("garageProfile.placeholders.ownerName") || "Owner Name"} required />
            <TextInput
              style={[styles.input, errors.ownerName && styles.inputError]}
              value={garage.ownerName}
              maxLength={50}
              placeholder={t("garageProfile.placeholders.ownerName") || "Owner Name"}
              onChangeText={(value) => {
                setGarage((prev: any) => ({ ...prev, ownerName: value }))
                if (errors.ownerName) setErrors((prev) => ({ ...prev, ownerName: undefined }))
              }}
            />
            {errors.ownerName && <Text style={styles.errorText}>{errors.ownerName}</Text>}
          </View>

          {/* Phone */}
          <View onLayout={(e) => storeFieldPosition("phone", e.nativeEvent.layout.y)}>
            <FieldLabel label={t("garageProfile.placeholders.phone") || "Phone"} required />
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={garage.phone}
              maxLength={10}
              keyboardType="number-pad"
              placeholder={t("garageProfile.placeholders.phone") || "Phone"}
              onChangeText={(value) => {
                const numericValue = value.replace(/[^0-9]/g, "")
                setGarage((prev: any) => ({ ...prev, phone: numericValue }))
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }))
              }}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Email */}
          <View onLayout={(e) => storeFieldPosition("email", e.nativeEvent.layout.y)}>
            <FieldLabel label={t("garageProfile.placeholders.email") || "Email"} />
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={garage.email}
              maxLength={60}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder={t("garageProfile.placeholders.email") || "Email"}
              onChangeText={(value) => {
                setGarage((prev: any) => ({ ...prev, email: value }))
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* GST Number */}
          <View onLayout={(e) => storeFieldPosition("gstNumber", e.nativeEvent.layout.y)}>
            <FieldLabel label={t("garageProfile.placeholders.gstNumber") || "GST Number"} />
            <TextInput
              style={[styles.input, errors.gstNumber && styles.inputError]}
              value={garage.gstNumber}
              maxLength={15}
              autoCapitalize="characters"
              placeholder={t("garageProfile.placeholders.gstNumber") || "GST Number"}
              onChangeText={(value) => {
                const formatted = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
                setGarage((prev: any) => ({ ...prev, gstNumber: formatted }))
                if (errors.gstNumber) setErrors((prev) => ({ ...prev, gstNumber: undefined }))
              }}
            />
            {errors.gstNumber && <Text style={styles.errorText}>{errors.gstNumber}</Text>}
          </View>
        </View>

        {/* ADDRESS CARD */}
        <View style={styles.card}>
          <Text style={styles.section}>
            {t("garageProfile.sections.address") || "Address"}
          </Text>

          {/* Address Line */}
          <View onLayout={(e) => storeFieldPosition("address", e.nativeEvent.layout.y)}>
            <FieldLabel label={t("garageProfile.placeholders.address") || "Address"} required />
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              value={garage.address}
              maxLength={120}
              placeholder={t("garageProfile.placeholders.address") || "Address"}
              onChangeText={(value) => {
                setGarage((prev: any) => ({ ...prev, address: value }))
                if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }))
              }}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          {/* City */}
          <View onLayout={(e) => storeFieldPosition("city", e.nativeEvent.layout.y)}>
            <FieldLabel label={t("garageProfile.placeholders.city") || "City"} required />
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              value={garage.city}
              maxLength={40}
              placeholder={t("garageProfile.placeholders.city") || "City"}
              onChangeText={(value) => {
                setGarage((prev: any) => ({ ...prev, city: value }))
                if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }))
              }}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>

          {/* State */}
          <View onLayout={(e) => storeFieldPosition("state", e.nativeEvent.layout.y)}>
            <FieldLabel label={t("garageProfile.placeholders.state") || "State"} required />
            <TextInput
              style={[styles.input, errors.state && styles.inputError]}
              value={garage.state}
              maxLength={40}
              placeholder={t("garageProfile.placeholders.state") || "State"}
              onChangeText={(value) => {
                setGarage((prev: any) => ({ ...prev, state: value }))
                if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }))
              }}
            />
            {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
          </View>

          {/* Pincode */}
          <View onLayout={(e) => storeFieldPosition("pincode", e.nativeEvent.layout.y)}>
            <FieldLabel label={t("garageProfile.placeholders.pincode") || "Pincode"} required />
            <TextInput
              style={[styles.input, errors.pincode && styles.inputError]}
              value={garage.pincode}
              maxLength={6}
              keyboardType="number-pad"
              placeholder={t("garageProfile.placeholders.pincode") || "Pincode"}
              onChangeText={(value) => {
                const numericValue = value.replace(/[^0-9]/g, "")
                setGarage((prev: any) => ({ ...prev, pincode: numericValue }))
                if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: undefined }))
              }}
            />
            {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
          </View>
        </View>

        {/* VEHICLE TYPES CARD */}
        <View style={styles.card} onLayout={(e) => storeFieldPosition("vehicleTypes", e.nativeEvent.layout.y)}>
          <View style={styles.labelContainer}>
            <Text style={styles.section}>
              {t("garageProfile.sections.vehicles") || "Supported Vehicle Types"}
            </Text>
            <Text style={styles.requiredStar}> *</Text>
          </View>

          {vehicleOptions.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.vehicleRow}
              activeOpacity={0.7}
              onPress={() => toggleVehicle(item.key)}
            >
              <MaterialIcons
                name={
                  Array.isArray(garage.vehicleTypes) &&
                  garage.vehicleTypes.includes(item.key)
                    ? "check-box"
                    : "check-box-outline-blank"
                }
                size={24}
                color="#2563EB"
              />
              <Text style={styles.vehicleText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          {errors.vehicleTypes && <Text style={styles.errorText}>{errors.vehicleTypes}</Text>}
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.8}
          onPress={saveProfile}
        >
          <Text style={styles.saveText}>
            {t("garageProfile.saveBtn") || "Save Profile"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* BACKEND ERROR POPUP MODAL */}
      <Modal
        visible={!!backendErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setBackendErrorModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <View style={styles.modalIcon}>
              <MaterialIcons name="error-outline" size={32} color="#DC2626" />
            </View>

            <Text style={styles.modalTitle}>
              {t("common.errorTitle") || "Error"}
            </Text>

            <Text style={styles.modalMessage}>{backendErrorModal}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.8}
              onPress={() => setBackendErrorModal(null)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
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
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827"
  },
  subHeading: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 2
  },
  logoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 16
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center"
  },
  logoBtn: {
    marginTop: 12
  },
  logoText: {
    color: "#2563EB",
    fontWeight: "bold"
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16
  },
  section: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 14
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
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
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    fontSize: 15,
    color: "#111827"
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
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14
  },
  vehicleText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#374151"
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center"
  },
  saveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  errorModal: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,
    alignItems: "center"
  },
  modalIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20
  },
  modalButton: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center"
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF"
  } 
})