import { useState, useRef } from "react"
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
import { Country, State, City } from 'country-state-city'
import { useNavigation } from "@react-navigation/native"
import { Feather, Ionicons } from "@expo/vector-icons"
import { registerGarage } from "../../services/authService"
import { useTranslation } from "../../context/LanguageContext"
import LanguageSelector from "../../components/LanguageSelector"

const VEHICLE_SPECIALIZATIONS = [
  { id: "2-Wheeler", label: "2-Wheeler (Bike/Scooter)" },
  { id: "3-Wheeler", label: "3-Wheeler (Auto/Rickshaw)" },
  { id: "Car & SUV", label: "Car & SUV" },
  { id: "Light Commercial", label: "Light Commercial (Pickup/Van)" },
  { id: "Heavy Commercial", label: "Heavy Commercial (Truck/Bus)" },
  { id: "Electric Vehicles (EV)", label: "Electric Vehicles (EV)" }
]

export default function RegisterScreen() {
  const { t } = useTranslation()
  const navigation: any = useNavigation()

  const scrollViewRef = useRef<ScrollView>(null)

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
  
  // Location States
  const [selectedCountryIso, setSelectedCountryIso] = useState("IN")
  const [country, setCountry] = useState("India")
  
  const [selectedStateIso, setSelectedStateIso] = useState("")
  const [state, setState] = useState("")
  
  const [city, setCity] = useState("")
  const [pincode, setPincode] = useState("")

  // Inline Searchable Dropdown Active States ('country' | 'state' | 'city' | null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Vehicle Types Selection state (Multiple selection defaults to 2-Wheeler & Car & SUV)
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(["2-Wheeler", "Car & SUV"])

  // Field errors state object
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

  const toggleVehicleType = (type: string) => {
    if (selectedVehicles.includes(type)) {
      if (selectedVehicles.length > 1) {
        setSelectedVehicles(selectedVehicles.filter((v) => v !== type))
      } else {
        Alert.alert("Notice", "Please select at least one vehicle type.")
      }
    } else {
      setSelectedVehicles([...selectedVehicles, type])
    }
    clearError("vehicleTypes")
  }

  const handleRegister = async () => {
    const newErrors: { [key: string]: string } = {}

    if (!ownerName.trim()) {
      newErrors.ownerName = t("register.validation.ownerNameReq") || "Owner name is required"
    }

    if (!phone.trim()) {
      newErrors.phone = t("register.validation.phoneReq") || "Phone number is required"
    } else if (phone.trim().length !== 10) {
      newErrors.phone = t("register.validation.phoneValid") || "Enter a valid phone number"
    }

    if (!pin.trim()) {
      newErrors.pin = t("register.validation.pinReq") || "PIN is required"
    } else if (pin.trim().length !== 4) {
      newErrors.pin = t("register.validation.pinLength") || "PIN must be 4 digits"
    }

    if (!confirmPin.trim()) {
      newErrors.confirmPin = t("register.validation.pinReq") || "Confirm PIN is required"
    } else if (pin !== confirmPin) {
      newErrors.confirmPin = t("register.validation.pinMismatch") || "PINs do not match"
    }

    if (!garageName.trim()) {
      newErrors.garageName = t("register.validation.garageNameReq") || "Garage name is required"
    }

    if (!address1.trim()) {
      newErrors.address1 = t("register.validation.addressReq") || "Address is required"
    }

    if (!country.trim()) {
      newErrors.country = t("register.validation.countryReq") || "Country is required"
    }

    if (!state.trim()) {
      newErrors.state = t("register.validation.stateReq") || "State is required"
    }

    if (!city.trim()) {
      newErrors.city = t("register.validation.cityReq") || "City is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      scrollViewRef.current?.scrollTo({ y: 0, animated: true })
      return
    }

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
        pincode,
        address: address1 + (address2 ? `, ${address2}` : ""),
        vehicleTypes: selectedVehicles,
        logo: ""
      }

      const response = await registerGarage(payload)

      if (response?.success) {
        Alert.alert(
          t("common.successTitle") || "Success",
          t("register.success.message") || "Garage registered successfully!",
          [
            {
              text: t("register.success.loginBtn") || "Login Now",
              onPress: () => navigation.replace("Login")
            }
          ]
        )
      }
    } catch (error: any) {
      Alert.alert(
        t("register.error.title") || "Registration Failed",
        error?.response?.data?.message || t("common.somethingWentWrong") || "Something went wrong"
      )
    } finally {
      setLoading(false)
    }
  }

  // Filtered lists based on search query
  const allCountries = Country.getAllCountries()
  const allStates = selectedCountryIso ? State.getStatesOfCountry(selectedCountryIso) : []
  const allCities = (selectedCountryIso && selectedStateIso) ? City.getCitiesOfState(selectedCountryIso, selectedStateIso) : []

  const filteredCountries = allCountries.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredStates = allStates.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredCities = allCities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER BAR WITH LANGUAGE SELECTOR */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.heading}>{t("register.title") || "Register Your Garage"}</Text>
          <Text style={styles.subHeading}>
            {t("register.subtitle") || "Setup your garage and start managing jobs digitally."}
          </Text>
        </View>
        <LanguageSelector />
      </View>

      {/* SECTION 1: OWNER PROFILE */}
      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>{t("register.ownerProfile") || "Garage Owner Profile"}</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>
            {t("register.placeholders.ownerName") || "Owner Name"} <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
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
          <Text style={styles.label}>
            {t("register.placeholders.mobile") || "Mobile Number"} <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
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
          <Text style={styles.label}>
            {t("register.placeholders.createPin") || "Create 4 Digit PIN"} <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
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
          <Text style={styles.label}>
            {t("register.placeholders.confirmPin") || "Confirm PIN"} <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
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
      </View>

      {/* SECTION 2: GARAGE DETAILS */}
      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>{t("register.garageDetails") || "Garage Details"}</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>
            {t("register.placeholders.garageName") || "Garage Name"} <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
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
          <Text style={styles.label}>{t("register.placeholders.gstNumber") || "GST Number (Optional)"}</Text>
          <TextInput
            value={gstNumber}
            onChangeText={setGstNumber}
            style={styles.input}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>{t("register.placeholders.email") || "Email (Optional)"}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>
      </View>

      {/* SECTION 3: ADDRESS & LOCATION */}
      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>{t("register.address") || "Address"}</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>
            {t("register.placeholders.address1") || "Address Line 1"} <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
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
          <Text style={styles.label}>{t("register.placeholders.address2") || "Address Line 2 (Optional)"}</Text>
          <TextInput
            value={address2}
            onChangeText={setAddress2}
            style={styles.input}
          />
        </View>

        {/* COUNTRY FIELD & INLINE SEARCHABLE DROPDOWN */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>{t("register.placeholders.country") || "Country"} <Text style={styles.requiredStar}>*</Text></Text>
          <TouchableOpacity
            style={styles.dropdownToggle}
            onPress={() => {
              setActiveDropdown(activeDropdown === "country" ? null : "country")
              setSearchQuery("")
            }}
          >
            <Text style={styles.dropdownToggleText}>{country || t("register.placeholders.country") || "Country"}</Text>
            <Ionicons name={activeDropdown === "country" ? "chevron-up" : "chevron-down"} size={18} color="#6B7280" />
          </TouchableOpacity>

          {activeDropdown === "country" && (
            <View style={styles.inlineDropdownContainer}>
              <TextInput
                style={styles.dropdownSearchInput}
                placeholder="Search country..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <ScrollView style={styles.dropdownListScroll} nestedScrollEnabled={true}>
                {filteredCountries.map((item) => (
                  <TouchableOpacity
                    key={item.isoCode}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedCountryIso(item.isoCode)
                      setCountry(item.name)
                      setSelectedStateIso("")
                      setState("")
                      setCity("")
                      setActiveDropdown(null)
                      clearError("country")
                    }}
                  >
                    <Text style={[styles.dropdownItemText, country === item.name && styles.dropdownItemTextSelected]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* STATE FIELD & INLINE SEARCHABLE DROPDOWN */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>{t("register.placeholders.state") || "State"} <Text style={styles.requiredStar}>*</Text></Text>
          <TouchableOpacity
            style={[styles.dropdownToggle, errors.state ? styles.inputError : null]}
            onPress={() => {
              setActiveDropdown(activeDropdown === "state" ? null : "state")
              setSearchQuery("")
            }}
          >
            <Text style={[styles.dropdownToggleText, !state && { color: "#9CA3AF" }]}>
              {state || t("register.placeholders.state") || "State"}
            </Text>
            <Ionicons name={activeDropdown === "state" ? "chevron-up" : "chevron-down"} size={18} color="#6B7280" />
          </TouchableOpacity>
          {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}

          {activeDropdown === "state" && (
            <View style={styles.inlineDropdownContainer}>
              <TextInput
                style={styles.dropdownSearchInput}
                placeholder="Search state..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <ScrollView style={styles.dropdownListScroll} nestedScrollEnabled={true}>
                {filteredStates.map((item) => (
                  <TouchableOpacity
                    key={item.isoCode}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedStateIso(item.isoCode)
                      setState(item.name)
                      setCity("")
                      setActiveDropdown(null)
                      clearError("state")
                    }}
                  >
                    <Text style={[styles.dropdownItemText, state === item.name && styles.dropdownItemTextSelected]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* CITY FIELD & INLINE SEARCHABLE DROPDOWN */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>{t("register.placeholders.city") || "City"} <Text style={styles.requiredStar}>*</Text></Text>
          <TouchableOpacity
            style={[styles.dropdownToggle, errors.city ? styles.inputError : null]}
            onPress={() => {
              setActiveDropdown(activeDropdown === "city" ? null : "city")
              setSearchQuery("")
            }}
          >
            <Text style={[styles.dropdownToggleText, !city && { color: "#9CA3AF" }]}>
              {city || t("register.placeholders.city") || "City"}
            </Text>
            <Ionicons name={activeDropdown === "city" ? "chevron-up" : "chevron-down"} size={18} color="#6B7280" />
          </TouchableOpacity>
          {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}

          {activeDropdown === "city" && (
            <View style={styles.inlineDropdownContainer}>
              <TextInput
                style={styles.dropdownSearchInput}
                placeholder="Search city..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <ScrollView style={styles.dropdownListScroll} nestedScrollEnabled={true}>
                {filteredCities.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCity(item.name)
                      setActiveDropdown(null)
                      clearError("city")
                    }}
                  >
                    <Text style={[styles.dropdownItemText, city === item.name && styles.dropdownItemTextSelected]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>{t("register.placeholders.pincode") || "Pincode"}</Text>
          <TextInput
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>
      </View>

      {/* SECTION 4: VEHICLE SPECIALIZATION */}
      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>{t("register.vehicleTypes") || "Vehicle Types Supported"}</Text>

        <View style={styles.vehicleRow}>
          {VEHICLE_SPECIALIZATIONS.map((item) => {
            const isSelected = selectedVehicles.includes(item.id)
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.vehicleChip, isSelected && styles.vehicleChipSelected]}
                onPress={() => toggleVehicleType(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isSelected ? "checkbox" : "square-outline"} 
                  size={16} 
                  color={isSelected ? "#2563EB" : "#6B7280"} 
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.vehicleText, isSelected && styles.vehicleTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <TouchableOpacity style={styles.logoButton} activeOpacity={0.7}>
          <Text style={styles.logoButtonText}>{t("register.uploadLogo") || "Upload Garage Logo (Optional)"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>{t("register.submitBtn") || "Create Garage Account"}</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingTop: 10
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
    zIndex: 50,
    elevation: 5
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827"
  },
  subHeading: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 8
  },
  inputWrapper: {
    marginBottom: 14,
    position: "relative"
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6
  },
  requiredStar: {
    color: "#EF4444"
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827"
  },
  dropdownToggle: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  dropdownToggleText: {
    fontSize: 14,
    color: "#111827"
  },
  inlineDropdownContainer: {
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 8,
    maxHeight: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 99
  },
  dropdownSearchInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: "#111827",
    marginBottom: 6
  },
  dropdownListScroll: {
    maxHeight: 150
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB"
  },
  dropdownItemText: {
    fontSize: 13,
    color: "#374151"
  },
  dropdownItemTextSelected: {
    color: "#2563EB",
    fontWeight: "600"
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2"
  },
  errorText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 2
  },
  vehicleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16
  },
  vehicleChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8
  },
  vehicleChipSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB"
  },
  vehicleText: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "500"
  },
  vehicleTextSelected: {
    color: "#2563EB",
    fontWeight: "600"
  },
  logoButton: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#F8FAFC"
  },
  logoButtonText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16
  }
})