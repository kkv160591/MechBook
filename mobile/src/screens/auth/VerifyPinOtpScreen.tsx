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
  useNavigation,
  useRoute
} from "@react-navigation/native"

import {
  verifyPinResetOtp
} from "../../services/authService"


export default function VerifyPinOtpScreen() {

  const navigation: any =
    useNavigation()

  const route: any =
    useRoute()

  const phone =
    route.params?.phone || ""


  const [otp, setOtp] =
    useState("")

  const [otpError, setOtpError] =
    useState("")

  const [loading, setLoading] =
    useState(false)


  const handleOtpChange =
    (text: string) => {

      const cleaned =
        text.replace(
          /[^0-9]/g,
          ""
        )

      setOtp(cleaned)

      if (otpError) {
        setOtpError("")
      }
    }


  const handleVerify =
    async () => {

      const trimmedOtp =
        otp.trim()


      if (!trimmedOtp) {

        setOtpError(
          "OTP is required"
        )

        return
      }


      if (
        trimmedOtp.length !== 6
      ) {

        setOtpError(
          "OTP must be exactly 6 digits"
        )

        return
      }


      try {

        setLoading(true)


        const data =
          await verifyPinResetOtp(
            phone,
            trimmedOtp
          )


        if (!data.success) {

          Alert.alert(
            "OTP Verification",
            data.message ||
              "Invalid or expired OTP"
          )

          return
        }


        if (!data.resetToken) {

          Alert.alert(
            "OTP Verification",
            "Reset token was not returned."
          )

          return
        }


        navigation.replace(
          "ResetPin",
          {
            resetToken:
              data.resetToken
          }
        )

      } catch (error: any) {

        Alert.alert(
          "OTP Verification",
          error?.response?.data?.message ||
            "Invalid or expired OTP"
        )

      } finally {

        setLoading(false)
      }
    }


  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Verify OTP
      </Text>


      <Text style={styles.subtitle}>
        Enter the 6-digit OTP sent to
        your registered phone number.
      </Text>


      <View style={styles.inputWrapper}>

        <TextInput
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChangeText={
            handleOtpChange
          }
          keyboardType="numeric"
          maxLength={6}
          secureTextEntry
          style={[
            styles.input,
            otpError
              ? styles.inputError
              : null
          ]}
        />


        {otpError ? (

          <Text style={styles.errorText}>
            {otpError}
          </Text>

        ) : null}

      </View>


      <TouchableOpacity
        style={styles.button}
        onPress={handleVerify}
        disabled={loading}
      >

        {loading ? (

          <ActivityIndicator
            color="white"
          />

        ) : (

          <Text style={styles.buttonText}>
            Verify OTP
          </Text>

        )}

      </TouchableOpacity>


      <TouchableOpacity
        onPress={() =>
          navigation.goBack()
        }
      >

        <Text style={styles.backText}>
          Back
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
      padding: 16,
      textAlign: "center",
      fontSize: 20,
      letterSpacing: 4
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