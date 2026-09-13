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
  resetPin
} from "../../services/authService"


export default function ResetPinScreen() {

  const navigation: any =
    useNavigation()

  const route: any =
    useRoute()

  const resetToken =
    route.params?.resetToken || ""


  const [newPin, setNewPin] =
    useState("")

  const [confirmPin, setConfirmPin] =
    useState("")

  const [newPinError, setNewPinError] =
    useState("")

  const [confirmPinError, setConfirmPinError] =
    useState("")

  const [loading, setLoading] =
    useState(false)


  const handleNewPinChange =
    (text: string) => {

      const cleaned =
        text.replace(
          /[^0-9]/g,
          ""
        )

      setNewPin(cleaned)

      if (newPinError) {
        setNewPinError("")
      }
    }


  const handleConfirmPinChange =
    (text: string) => {

      const cleaned =
        text.replace(
          /[^0-9]/g,
          ""
        )

      setConfirmPin(cleaned)

      if (confirmPinError) {
        setConfirmPinError("")
      }
    }


  const handleReset =
    async () => {

      let hasError =
        false


      if (!newPin) {

        setNewPinError(
          "New PIN is required"
        )

        hasError = true

      } else if (
        newPin.length !== 4
      ) {

        setNewPinError(
          "PIN must be exactly 4 digits"
        )

        hasError = true
      }


      if (!confirmPin) {

        setConfirmPinError(
          "Please confirm your PIN"
        )

        hasError = true

      } else if (
        confirmPin.length !== 4
      ) {

        setConfirmPinError(
          "PIN must be exactly 4 digits"
        )

        hasError = true

      } else if (
        confirmPin !== newPin
      ) {

        setConfirmPinError(
          "PINs do not match"
        )

        hasError = true
      }


      if (hasError) {
        return
      }


      if (!resetToken) {

        Alert.alert(
          "Reset PIN",
          "Your reset session has expired. Please request a new OTP."
        )

        navigation.replace(
          "ForgotPin"
        )

        return
      }


      try {

        setLoading(true)


        const data =
          await resetPin(
            resetToken,
            newPin
          )


        if (!data.success) {

          Alert.alert(
            "Reset PIN",
            data.message ||
              "Unable to reset PIN"
          )

          return
        }


        Alert.alert(
          "PIN Reset",
          "Your PIN has been reset successfully.",
          [
            {
              text: "OK",
              onPress: () =>
                navigation.replace(
                  "Login"
                )
            }
          ]
        )

      } catch (error: any) {

        Alert.alert(
          "Reset PIN",
          error?.response?.data?.message ||
            "Unable to reset PIN"
        )

      } finally {

        setLoading(false)
      }
    }


  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Set New PIN
      </Text>


      <Text style={styles.subtitle}>
        Create a new 4-digit PIN for your account.
      </Text>


      {/* NEW PIN */}

      <View style={styles.inputWrapper}>

        <TextInput
          placeholder="Enter new PIN"
          value={newPin}
          onChangeText={
            handleNewPinChange
          }
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          style={[
            styles.input,
            newPinError
              ? styles.inputError
              : null
          ]}
        />


        {newPinError ? (

          <Text style={styles.errorText}>
            {newPinError}
          </Text>

        ) : null}

      </View>


      {/* CONFIRM PIN */}

      <View style={styles.inputWrapper}>

        <TextInput
          placeholder="Confirm new PIN"
          value={confirmPin}
          onChangeText={
            handleConfirmPinChange
          }
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          style={[
            styles.input,
            confirmPinError
              ? styles.inputError
              : null
          ]}
        />


        {confirmPinError ? (

          <Text style={styles.errorText}>
            {confirmPinError}
          </Text>

        ) : null}

      </View>


      <TouchableOpacity
        style={styles.button}
        onPress={handleReset}
        disabled={loading}
      >

        {loading ? (

          <ActivityIndicator
            color="white"
          />

        ) : (

          <Text style={styles.buttonText}>
            Reset PIN
          </Text>

        )}

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
      marginBottom: 32
    },

    inputWrapper: {
      marginBottom: 14
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
      borderRadius: 14,
      marginTop: 6
    },

    buttonText: {
      color: "white",
      textAlign: "center",
      fontWeight: "700",
      fontSize: 16
    }
  })