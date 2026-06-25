import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text
} from "react-native"

import {
  Ionicons
} from "@expo/vector-icons"

import {
  useState,
  useCallback
} from "react"

import {
  useFocusEffect
} from "@react-navigation/native"

import ServiceTypeCard
from "../../components/settings/ServiceTypeCard"

import {
  getServiceTypes
} from "../../services/serviceTypesService"

export default function ServiceTypesScreen({
  navigation
}: any) {

  const [services, setServices] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const loadServices =
  async () => {

    try {

      setLoading(true)

      const response =
        await getServiceTypes()

      setServices(
        response.data.services || []
      )

    }

    catch (error) {

      console.log(error)

    }

    finally {

      setLoading(false)

    }

  }

  useFocusEffect(
    useCallback(() => {

      loadServices()

    }, [])
  )

  if (loading) {

    return (

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text>
          Loading Services...
        </Text>

      </View>

    )

  }

  return (

    <View style={styles.container}>

      <FlatList
        data={services}
        keyExtractor={(item) =>
          item.serviceTypeId
        }
        renderItem={({ item }) => (

          <ServiceTypeCard
            service={item}
            onPress={() =>
              navigation.navigate(
                "EditServiceType",
                {
                  serviceId:
                    item.serviceTypeId
                }
              )
            }
          />

        )}

        ListEmptyComponent={() => (

          <View
            style={{
              marginTop: 100,
              alignItems: "center"
            }}
          >

            <Text>
              No Services Added
            </Text>

          </View>

        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate(
            "AddServiceType"
          )
        }
      >

        <Ionicons
          name="add"
          size={28}
          color="white"
        />

      </TouchableOpacity>

    </View>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center"
  }

})