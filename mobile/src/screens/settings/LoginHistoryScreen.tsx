import {
  View,
  FlatList,
  StyleSheet
} from "react-native"

import LoginHistoryCard
from "../../components/settings/LoginHistoryCard"

export default function LoginHistoryScreen({
  route
}: any) {

  const worker =
    route.params.worker

  return (

    <View style={styles.container}>

      <FlatList
        data={
          worker.loginHistory || []
        }
        keyExtractor={(_, index) =>
          index.toString()
        }
        renderItem={({ item }) => (
          <LoginHistoryCard
            item={item}
          />
        )}
      />

    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16
  }

})