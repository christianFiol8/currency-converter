import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import * as Location from "expo-location"; // <--- NUEVA IMPORTACIÓN
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { createExchangeStyles } from "../styles/exchange.styles"

type Currency = {
  code: string
  name: string
  flag: string
}

// <--- NUEVO: Mapeo simple de código de país a moneda
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  MX: "MXN",
  US: "USD",
  ES: "EUR",
  FR: "EUR",
  DE: "EUR",
  IT: "EUR",
  PT: "EUR",
  CA: "CAD",
  GB: "GBP",
  JP: "JPY",
  BR: "BRL",
  AR: "ARS",
  CO: "COP",
  CL: "CLP",
  PE: "PEN",
  AU: "AUD",
  CH: "CHF",
  CN: "CNY",
  KR: "KRW",
  IN: "INR",
}

export default function ExchangeScreeen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const styles = createExchangeStyles(isDark)

  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [from, setFrom] = useState("MXN")
  const [to, setTo] = useState("USD")
  const [showFromList, setShowFromList] = useState(false)
  const [showToList, setShowToList] = useState(false)
  const [rateLoading, setRateLoading] = useState(false)
  const [rate, setRate] = useState<number | null>(null)
  const [amount, setAmount] = useState("")
  const [result, setResult] = useState("")

  useEffect(() => {
    fetchCurrencyData()
  }, [])

  const getFlagEmoji = (code: string) => {
    const base = 127397
    const country = code.slice(0, 2)
    return country
      .toUpperCase()
      .split("")
      .map((char) => String.fromCodePoint(base + char.charCodeAt(0)))
      .join("")
  }

  const fetchCurrencyData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`https://api.frankfurter.dev/v1/currencies`)
      const data = await response.json()
      if (response.status == 200) {
        const list = Object.entries(data).map(([code, name]) => ({
          code,
          name: name as string,
          flag: getFlagEmoji(code),
        }))
        setCurrencies(list)
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch currency data")
    } finally {
      setIsLoading(false)
    }
  }

  // <--- NUEVA FUNCIÓN: Lógica de Ubicación
  const handleUseLocation = async () => {
    setIsLoading(true)
    try {
      // 1. Pedir Permiso
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "No podemos detectar tu moneda local sin permiso de ubicación."
        )
        setIsLoading(false)
        return
      }

      // 2. Obtener coordenadas
      let location = await Location.getCurrentPositionAsync({})

      // 3. Geocodificación inversa (Coords -> País)
      let address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })

      if (address.length > 0 && address[0].isoCountryCode) {
        const countryCode = address[0].isoCountryCode
        const detectedCurrency = COUNTRY_TO_CURRENCY[countryCode]

        if (detectedCurrency) {
          // Verificar si la moneda detectada existe en nuestra lista de monedas de la API
          const existsInApi = currencies.find((c) => c.code === detectedCurrency)
          
          if (existsInApi) {
            setFrom(detectedCurrency)
            Alert.alert("Ubicación detectada", `Moneda actualizada a ${detectedCurrency} (${countryCode})`)
          } else {
             // Si el país existe pero la moneda no está en la API de frankfurter
             // Intentamos usar EUR si es Europa, o simplemente avisamos
             if(["AT", "BE", "CY", "EE", "FI", "GR", "IE", "LV", "LT", "LU", "MT", "NL", "SK", "SI"].includes(countryCode)) {
                 setFrom("EUR")
                 Alert.alert("Ubicación detectada", `Moneda actualizada a EUR`)
             } else {
                Alert.alert("Aviso", `Estás en ${countryCode}, pero esa moneda no está soportada por la API actualmente.`)
             }
          }
        } else {
          Alert.alert("Aviso", `No pudimos determinar la moneda local para el código: ${countryCode}`)
        }
      }
    } catch (error) {
      console.log(error)
      Alert.alert("Error", "Ocurrió un problema al obtener la ubicación.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (rate && amount) {
        const converted = (Number.parseFloat(amount) * rate).toFixed(2)
        setResult(`${amount}${from}=${converted}${to}`)
      } else setResult("")
    }, 500)
    return () => clearTimeout(timeout)
  }, [amount, rate])

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (from && to && from !== to) {
        setRateLoading(true)
        try {
          const url = `https://api.frankfurter.dev/v1/latest?from=${from}&to=${to}`
          const response = await fetch(url)
          const data = await response.json()
          if (data?.rates?.[to]) {
            setRate(data.rates[to])
          }
        } catch (error) {
          setRate(null)
        } finally {
          setRateLoading(false)
        }
      }
    }
    fetchExchangeRate()
  }, [from, to])

  const renderCurrencyList = (onSelect: (code: string) => void, top: number) => {
    return (
      <FlatList
        data={currencies}
        keyExtractor={(item) => item.code}
        style={[
          styles.list,
          {
            top,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item]}
            onPress={() => {
              onSelect(item.code)
              Keyboard.dismiss()
              setShowFromList(false)
              setShowToList(false)
            }}
          >
            <Text style={styles.itemText}>
              {item.flag}
              {item.code} - {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={isDark ? "#818CF8" : "#3B82F6"} />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss()
        setShowFromList(false)
        setShowToList(false)
      }}
      accessible={false}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.header}>
            <Image source={require("@/assets/images/logoConverter.png")} style={styles.logo} />
            <Text style={styles.title}>Conversor de divisas</Text>
          </View>

          {/* <--- NUEVO: Contenedor con Label y Botón de Ubicación */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 6 }}>
            <Text style={[styles.label, { marginTop: 0, marginBottom: 0 }]}>De:</Text>
            
            <TouchableOpacity onPress={handleUseLocation} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={16} color={isDark ? "#818CF8" : "#3B82F6"} />
              <Text style={{ color: isDark ? "#818CF8" : "#3B82F6", marginLeft: 4, fontSize: 13, fontWeight: "600" }}>
                Usar mi ubicación
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              setShowFromList(!showFromList)
              setShowToList(false)
            }}
          >
            <View style={styles.inputBox}>
              <Text style={styles.selected}>
                {getFlagEmoji(from)}
                {from}
              </Text>
            </View>
          </TouchableOpacity>
          {showFromList && renderCurrencyList(setFrom, 240)}

          {(showFromList || showToList) && (
            <Pressable
              style={styles.overlay}
              onPress={() => {
                setShowFromList(false)
                setShowToList(false)
                Keyboard.dismiss()
              }}
            />
          )}

          <Text style={styles.label}>A:</Text>
          <TouchableOpacity
            onPress={() => {
              setShowToList(!showToList)
              setShowFromList(false)
            }}
          >
            <View style={styles.inputBox}>
              <Text style={styles.selected}>
                {getFlagEmoji(to)}
                {to}
              </Text>
            </View>
          </TouchableOpacity>
          {showToList && renderCurrencyList(setTo, 340)}

          {rateLoading && (
            <ActivityIndicator size="large" style={{ marginTop: 30 }} color={isDark ? "#818CF8" : "#3B82F6"} />
          )}
          {rate && !rateLoading && from !== to && (
            <View style={styles.rateBox}>
              <Text style={styles.rateText}>
                100{from}
                {"  "}
                <Ionicons name="swap-horizontal" size={20} color={isDark ? "#A5B4FC" : "#3B82F6"} />
                {"  "}
                {(rate * 100).toFixed(4)}
                {to}
              </Text>
            </View>
          )}

          <TextInput
            style={styles.amount}
            placeholder="Ingresa cantidad"
            placeholderTextColor={isDark ? "#666" : "#999"}
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) => {
              const filtered = text.replace(/[^0-9.]/g, "")
              const parts = filtered.split(".")
              if (parts.length > 2) return
              setAmount(filtered)
            }}
          />
          {result && from !== to && (
            <LinearGradient
              colors={isDark ? ["#312E81", "#6366F1"] : ["#3B82F6", "#10B981"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.resultCard}
            >
              <Text style={styles.resultText}>{result}</Text>
            </LinearGradient>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}