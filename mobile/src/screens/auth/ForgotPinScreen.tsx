import React, {
  useState
} from "react"

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native"

import {
  useNavigation
} from "@react-navigation/native"

import {
  useTranslation
} from "../../context/LanguageContext"

import {
  forgotPin
} from "../../services/authService"


export default function ForgotPinScreen() {

  const navigation: any =
    useNavigation()

  const { t } =
    useTranslation()


  const [phone, setPhone] =
    useState("")

  const [phoneError, setPhoneError] =
    useState("")

  const [loading, setLoading] =
    useState(false)


  const handlePhoneChange =
    (text: string) => {

      const cleaned =
        text.replace(
          /[^0-9]/g,
          ""
        )

      setPhone(cleaned)

      if (phoneError) {
        setPhoneError("")
      }
    }


  const handleSendOtp =
    async () => {

      const trimmedPhone =
        phone.trim()


      if (!trimmedPhone) {

        setPhoneError(
          "Phone number is required"
        )

        return
      }


      if (
        trimmedPhone.length !== 10
      ) {

        setPhoneError(
          "Phone number must be exactly 10 digits"
        )

        return
      }


      try {

        setLoading(true)


        const data =
          await forgotPin(
            trimmedPhone
          )


        /*
         * IMPORTANT:
         *
         * Backend intentionally returns
         * a generic response so we don't
         * reveal whether an account exists.
         */

        if (!data.success) {

          Alert.alert(
            "Forgot PIN",
            data.message ||
              "Unable to process request"
          )

          return
        }


        navigation.navigate(
          "VerifyPinOtp",
          {
            phone: trimmedPhone
          }
        )

      } catch (error: any) {

        Alert.alert(
          "Forgot PIN",
          error?.response?.data?.message ||
            "Unable to process request"
        )

      } finally {

        setLoading(false)
      }
    }


  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Forgot PIN?
      </Text>


      <Text style={styles.subtitle}>
        Enter your registered phone number
        and we will send you a verification OTP.
      </Text>


      <View style={styles.inputWrapper}>

        <TextInput
          placeholder="Enter phone number"
          value={phone}
          onChangeText={
            handlePhoneChange
          }
          keyboardType="phone-pad"
          maxLength={10}
          style={[
            styles.input,
            phoneError
              ? styles.inputError
              : null
          ]}
        />


        {phoneError ? (

          <Text style={styles.errorText}>
            {phoneError}
          </Text>

        ) : null}

      </View>


      <TouchableOpacity
        style={styles.button}
        onPress={handleSendOtp}
        disabled={loading}
      >

        {loading ? (

          <ActivityIndicator
            color="white"
          />

        ) : (

          <Text style={styles.buttonText}>
            Send OTP
          </Text>

        )}

      </TouchableOpacity>


      <TouchableOpacity
        onPress={() =>
          navigation.goBack()
        }
      >

        <Text style={styles.backText}>
          Back to Login
        </Text>

      </TouchableOpacity>

    </View>
  )
}


const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      justifyContent: "center",
      padding: 24,
      backgroundColor: "#F9FAFB"
    },

    title: {
      fontSize: 30,
      fontWeight: "700",
      textAlign: "center",
      color: "#111827"
    },

    subtitle: {
      textAlign: "center",
      color: "#6B7280",
      marginTop: 10,
      marginBottom: 32,
      lineHeight: 20
    },

    inputWrapper: {
      marginBottom: 16
    },

    input: {
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: 14,
      padding: 16
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

    button: {
      backgroundColor: "#2563EB",
      padding: 18,
      borderRadius: 14
    },

    buttonText: {
      color: "white",
      textAlign: "center",
      fontWeight: "700",
      fontSize: 16
    },

    backText: {
      textAlign: "center",
      marginTop: 24,
      color: "#2563EB",
      fontWeight: "600"
    }
  })