import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native"

import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { registerGarage } from "../../services/authService"
import { useTranslation } from "../../context/LanguageContext"
import LanguageSelector from "../../components/LanguageSelector"

export default function RegisterScreen() {
  const { t } = useTranslation()
  const navigation: any = useNavigation()

  const [loading, setLoading] = useState(false)
  const [ownerName, setOwnerName] = useState("")
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [garageName, setGarageName] = useState("")
  const [gstNumber, setGstNumber] = useState("")
  const [email, setEmail] = useState("")
  const [address1, setAddress1] = useState("")
  const [address2, setAddress2] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [pincode, setPincode] = useState("")
  const [country, setCountry] = useState("India")

  // Inline Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }

  const handleRegister = async () => {
    const newErrors: { [key: string]: string } = {}

    if (!ownerName.trim()) {
      newErrors.ownerName = t("register.validation.ownerNameReq")
    }

    if (!phone.trim()) {
      newErrors.phone = t("register.validation.phoneReq")
    } else if (phone.trim().length !== 10) {
      newErrors.phone = t("register.validation.phoneValid")
    }

    if (!pin.trim()) {
      newErrors.pin = t("register.validation.pinReq")
    } else if (pin.trim().length !== 4) {
      newErrors.pin = t("register.validation.pinLength")
    }

    if (!confirmPin.trim()) {
      newErrors.confirmPin = t("register.validation.pinReq")
    } else if (pin !== confirmPin) {
      newErrors.confirmPin = t("register.validation.pinMismatch")
    }

    if (!garageName.trim()) {
      newErrors.garageName = t("register.validation.garageNameReq")
    }

    if (!address1.trim()) {
      newErrors.address1 = t("register.validation.addressReq")
    }

    if (!city.trim()) {
      newErrors.city = t("register.validation.cityStateReq")
    }

    if (!state.trim()) {
      newErrors.state = t("register.validation.cityStateReq")
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Clear all errors if validation passes
    setErrors({})

    try {
      setLoading(true)

      const payload = {
        garageName,
        ownerName,
        phone,
        pin,
        city,
        state,
        country,
        address: address1 + (address2 ? `, ${address2}` : ""),
        logo: ""
      }

      const response = await registerGarage(payload)

      if (response.success) {
        Alert.alert(
          t("common.successTitle"),
          t("register.success.message"),
          [
            {
              text: t("register.success.loginBtn"),
              onPress: () => navigation.replace("Login")
            }
          ]
        )
      }
    } catch (error: any) {
      Alert.alert(
        t("register.error.title"),
        error?.response?.data?.message || t("common.somethingWentWrong")
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Language Selector */}
      <View style={styles.headerRow}>
        <LanguageSelector />
      </View>

      <Text style={styles.title}>{t("register.title")}</Text>

      <Text style={styles.subtitle}>{t("register.subtitle")}</Text>

      {/* OWNER PROFILE */}
      <Text style={styles.sectionTitle}>{t("register.ownerProfile")}</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("register.placeholders.ownerName")}
          value={ownerName}
          onChangeText={(val) => {
            setOwnerName(val)
            clearError("ownerName")
          }}
          style={[styles.input, errors.ownerName ? styles.inputError : null]}
        />
        {errors.ownerName ? <Text style={styles.errorText}>{errors.ownerName}</Text> : null}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("register.placeholders.mobile")}
          value={phone}
          onChangeText={(val) => {
            const cleaned = val.replace(/[^0-9]/g, "")
            setPhone(cleaned)
            clearError("phone")
          }}
          keyboardType="phone-pad"
          maxLength={10}
          style={[styles.input, errors.phone ? styles.inputError : null]}
        />
        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("register.placeholders.createPin")}
          value={pin}
          onChangeText={(val) => {
            const cleaned = val.replace(/[^0-9]/g, "")
            setPin(cleaned)
            clearError("pin")
          }}
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
          style={[styles.input, errors.pin ? styles.inputError : null]}
        />
        {errors.pin ? <Text style={styles.errorText}>{errors.pin}</Text> : null}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("register.placeholders.confirmPin")}
          value={confirmPin}
          onChangeText={(val) => {
            const cleaned = val.replace(/[^0-9]/g, "")
            setConfirmPin(cleaned)
            clearError("confirmPin")
          }}
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
          style={[styles.input, errors.confirmPin ? styles.inputError : null]}
        />
        {errors.confirmPin ? <Text style={styles.errorText}>{errors.confirmPin}</Text> : null}
      </View>

      {/* GARAGE DETAILS */}
      <Text style={styles.sectionTitle}>{t("register.garageDetails")}</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("register.placeholders.garageName")}
          value={garageName}
          onChangeText={(val) => {
            setGarageName(val)
            clearError("garageName")
          }}
          style={[styles.input, errors.garageName ? styles.inputError : null]}
        />
        {errors.garageName ? <Text style={styles.errorText}>{errors.garageName}</Text> : null}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("register.placeholders.gstNumber")}
          value={gstNumber}
          onChangeText={setGstNumber}
          style={styles.input}
        />
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("register.placeholders.email")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      {/* ADDRESS */}
      <Text style={styles.sectionTitle}>{t("register.address")}</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("register.placeholders.address1")}
          value={address1}
          onChangeText={(val) => {
            setAddress1(val)
            clearError("address1")
          }}
          style={[styles.input, errors.address1 ? styles.inputError : null]}
        />
        {errors.address1 ? <Text style={styles.errorText}>{errors.address1}</Text> : null}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("register.placeholders.address2")}
          value={address2}
          onChangeText={setAddress2}
          style={styles.input}
        />
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("register.placeholders.city")}
          value={city}
          onChangeText={(val) => {
            setCity(val)
            clearError("city")
          }}
          style={[styles.input, errors.city ? styles.inputError : null]}
        />
        {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("register.placeholders.state")}
          value={state}
          onChangeText={(val) => {
            setState(val)
            clearError("state")
          }}
          style={[styles.input, errors.state ? styles.inputError : null]}
        />
        {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("register.placeholders.pincode")}
          value={pincode}
          onChangeText={setPincode}
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("register.placeholders.country")}
          value={country}
          onChangeText={setCountry}
          style={styles.input}
        />
      </View>

      <Text style={styles.sectionTitle}>{t("register.vehicleTypes")}</Text>

      <View style={styles.vehicleRow}>
        <View style={styles.vehicleChip}>
          <Text style={styles.vehicleText}>{t("register.twoWheeler")}</Text>
        </View>

        <View style={styles.vehicleChip}>
          <Text style={styles.vehicleText}>{t("register.fourWheeler")}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoButton}>
        <Text style={styles.logoButtonText}>{t("register.uploadLogo")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>{t("register.submitBtn")}</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20
  },
  headerRow: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "flex-end",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    marginTop: 10
  },
  subtitle: {
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 10,
    marginBottom: 12
  },
  inputWrapper: {
    marginBottom: 12
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2"
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 4
  },
  vehicleRow: {
    flexDirection: "row",
    marginBottom: 16
  },
  vehicleChip: {
    backgroundColor: "#EFF6FF",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10
  },
  vehicleText: {
    color: "#2563EB",
    fontWeight: "600"
  },
  logoButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#2563EB",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginBottom: 20
  },
  logoButtonText: {
    color: "#2563EB",
    fontWeight: "600"
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 14,
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16
  }
})