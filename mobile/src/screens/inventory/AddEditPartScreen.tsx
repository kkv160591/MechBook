import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native"

import { useState, useRef } from "react"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { createInventory, updateInventory } from "../../services/inventoryService"
import { useTranslation } from "../../context/LanguageContext"

type Props = {
  route: RouteProp<any, any>
}

export default function AddEditPartScreen({ route }: Props) {
  const navigation: any = useNavigation()
  const { t } = useTranslation()

  const mode = route.params?.mode || "add"
  const part = route.params?.part

  const scrollViewRef = useRef<ScrollView>(null)
  const fieldYPositions = useRef<{ [key: string]: number }>({})

  const [name, setName] = useState(part?.name || "")
  const [sku, setSku] = useState(part?.sku || "")
  const [category, setCategory] = useState(part?.category || "")
  const [buyingPrice, setBuyingPrice] = useState(part?.buyingPrice?.toString() || "")
  const [sellingPrice, setSellingPrice] = useState(part?.sellingPrice?.toString() || "")
  const [stock, setStock] = useState(part?.stock?.toString() || "")
  const [minStock, setMinStock] = useState(part?.minStock?.toString() || "")

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const recordLayout = (field: string, y: number) => {
    fieldYPositions.current[field] = y
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    if (!name.trim()) {
      newErrors.name = t("inventory.validation.nameReq")
    }
    if (!category.trim()) {
      newErrors.category = t("inventory.validation.categoryReq")
    }

    if (!buyingPrice.trim()) {
      newErrors.buyingPrice = t("inventory.validation.buyingPriceReq")
    } else if (isNaN(Number(buyingPrice)) || Number(buyingPrice) < 0) {
      newErrors.buyingPrice = t("inventory.validation.buyingPriceValid")
    }

    if (!sellingPrice.trim()) {
      newErrors.sellingPrice = t("inventory.validation.sellingPriceReq")
    } else if (isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) {
      newErrors.sellingPrice = t("inventory.validation.sellingPriceValid")
    }

    if (!stock.trim()) {
      newErrors.stock = t("inventory.validation.stockReq")
    } else if (isNaN(Number(stock)) || Number(stock) < 0) {
      newErrors.stock = t("inventory.validation.stockValid")
    }

    if (!minStock.trim()) {
      newErrors.minStock = t("inventory.validation.minStockReq")
    } else if (isNaN(Number(minStock)) || Number(minStock) < 0) {
      newErrors.minStock = t("inventory.validation.minStockValid")
    }

    setErrors(newErrors)

    const firstErrorKey = Object.keys(newErrors)[0]
    if (firstErrorKey && fieldYPositions.current[firstErrorKey] !== undefined) {
      scrollViewRef.current?.scrollTo({
        y: fieldYPositions.current[firstErrorKey] - 20,
        animated: true,
      })
    }

    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim(),
        category: category.trim(),
        buyingPrice: Number(buyingPrice),
        sellingPrice: Number(sellingPrice),
        stock: Number(stock),
        minStock: Number(minStock),
      }

      if (mode === "add") {
        await createInventory(payload)
        Alert.alert(t("common.successTitle"), t("inventory.messages.addSuccess"))
      } else {
        await updateInventory(part.inventoryId || part.partId, payload)
        Alert.alert(t("common.successTitle"), t("inventory.messages.updateSuccess"))
      }

      navigation.goBack()
    } catch (error: any) {
      Alert.alert(
        t("common.errorTitle"),
        error?.response?.data?.message || t("common.somethingWentWrong")
      )
    }
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <Text style={styles.title}>
        {mode === "add" ? t("inventory.addPart") : t("inventory.editPart")}
      </Text>

      <View style={styles.card}>
        {/* Part Name */}
        <View onLayout={(e) => recordLayout("name", e.nativeEvent.layout.y)}>
          <Text style={styles.label}>
            {t("inventory.labels.name")} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={(val) => {
              setName(val)
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
            }}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* SKU (Optional) */}
        <View onLayout={(e) => recordLayout("sku", e.nativeEvent.layout.y)}>
          <Text style={styles.label}>{t("inventory.labels.sku")}</Text>
          <TextInput
            style={styles.input}
            value={sku}
            onChangeText={setSku}
          />
        </View>

        {/* Category */}
        <View onLayout={(e) => recordLayout("category", e.nativeEvent.layout.y)}>
          <Text style={styles.label}>
            {t("inventory.labels.category")} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.category && styles.inputError]}
            value={category}
            onChangeText={(val) => {
              setCategory(val)
              if (errors.category) setErrors((prev) => ({ ...prev, category: "" }))
            }}
          />
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>

        {/* Buying Price */}
        <View onLayout={(e) => recordLayout("buyingPrice", e.nativeEvent.layout.y)}>
          <Text style={styles.label}>
            {t("inventory.labels.buyingPrice")} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            keyboardType="numeric"
            style={[styles.input, errors.buyingPrice && styles.inputError]}
            value={buyingPrice}
            onChangeText={(val) => {
              setBuyingPrice(val)
              if (errors.buyingPrice) setErrors((prev) => ({ ...prev, buyingPrice: "" }))
            }}
          />
          {errors.buyingPrice && <Text style={styles.errorText}>{errors.buyingPrice}</Text>}
        </View>

        {/* Selling Price */}
        <View onLayout={(e) => recordLayout("sellingPrice", e.nativeEvent.layout.y)}>
          <Text style={styles.label}>
            {t("inventory.labels.sellingPrice")} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            keyboardType="numeric"
            style={[styles.input, errors.sellingPrice && styles.inputError]}
            value={sellingPrice}
            onChangeText={(val) => {
              setSellingPrice(val)
              if (errors.sellingPrice) setErrors((prev) => ({ ...prev, sellingPrice: "" }))
            }}
          />
          {errors.sellingPrice && <Text style={styles.errorText}>{errors.sellingPrice}</Text>}
        </View>

        {/* Current Stock */}
        <View onLayout={(e) => recordLayout("stock", e.nativeEvent.layout.y)}>
          <Text style={styles.label}>
            {t("inventory.labels.stock")} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            keyboardType="numeric"
            style={[styles.input, errors.stock && styles.inputError]}
            value={stock}
            onChangeText={(val) => {
              setStock(val)
              if (errors.stock) setErrors((prev) => ({ ...prev, stock: "" }))
            }}
          />
          {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}
        </View>

        {/* Minimum Stock */}
        <View onLayout={(e) => recordLayout("minStock", e.nativeEvent.layout.y)}>
          <Text style={styles.label}>
            {t("inventory.labels.minStock")} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            keyboardType="numeric"
            style={[styles.input, errors.minStock && styles.inputError]}
            value={minStock}
            onChangeText={(val) => {
              setMinStock(val)
              if (errors.minStock) setErrors((prev) => ({ ...prev, minStock: "" }))
            }}
          />
          {errors.minStock && <Text style={styles.errorText}>{errors.minStock}</Text>}
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>
          {mode === "add" ? t("inventory.addPart") : t("inventory.editPart")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  required: {
    color: "#DC2626",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
    fontSize: 15,
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 22,
  },
  saveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})