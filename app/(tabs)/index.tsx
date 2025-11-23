import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Currency = {
  code: string;
  name: string;
  flag: string;
}
export default function ExchangeScreeen () {
  const colorScheme = useColorScheme();
  const isDark = colorScheme ==="dark";
  const [currencies,setCurrencies] = useState<Currency[]>([]);
  const [isLoading,setIsLoading] = useState(true);
  const[from,setFrom]= useState("MXN");
  const[to,setTo]=useState("USD");
  const[showFromList,setShowFromList]=useState(false);
  const[showToList,setShowToList]=useState(false);
  const[rateLoading,setRateLoading]=useState(false);
  const[rate,setRate]=useState<number | null>(null);
  const[amount,setAmount]=useState("");
  const[result,setResult]=useState("");

  useEffect(()=>{
    fetchCurrencyData();
  },[]);

  const getFlagEmoji = (code:string)=>{
    const base = 127397;
    const country = code.slice(0,2);
    return country
      .toUpperCase()
      .split("")
      .map((char)=>String.fromCodePoint(base + char.charCodeAt(0)))
      .join("");
  };

  const fetchCurrencyData = async () => {
    setIsLoading(true);
    try{
      const response = await fetch(`https://api.frankfurter.dev/v1/currencies`)
      const data = await response.json();
      console.log("Currency Data:" , data);
      if(response.status==200){
        const list = Object.entries(data).map(([code,name])=>({
        code,
        name: name as string,
        flag: getFlagEmoji(code),
      }));
      setCurrencies(list);
      }
    }catch(error){
      Alert.alert("Error" , "Failed to fetch currency data");
    }finally{
      setIsLoading(false);
    }
  };

  useEffect(()=>{
    const timeout = setTimeout(()=>{
      if(rate && amount){
        const converted = (parseFloat(amount)*rate).toFixed(2);
        setResult(`${amount}${from}=${converted}${to}`);
      }else setResult("")
    },500);
    return()=>clearTimeout(timeout)
  },[amount,rate])

  useEffect(()=>{
    const fetchExchangeRate = async () => {
      if(from && to && from !==to){
        setRateLoading(true);
        try{
          const url = `https://api.frankfurter.dev/v1/latest?from=${from}&to=${to}`;
          const response = await fetch(url);
          const data = await response.json();
          if(data?.rates?.[to]){
            setRate(data.rates[to]);
          }
        }catch(error){
          setRate(null);
        }finally{
          setRateLoading(false);
        }
      }
    };
    fetchExchangeRate();
  },[from,to]);

  const renderCurrencyList = (
    onSelect:(code:string)=>void,
    top:number
  )=>{
    return (
    <FlatList
      data={currencies}
      keyExtractor={(item)=>item.code}
      style={[
        styles.list,
        {
          top,
          backgroundColor: isDark ? "#1C1C28" : "#fff",
          borderColor: isDark ? "#333" : "#ddd"
        }
      ]}
      keyboardShouldPersistTaps="handled"
      renderItem={({item})=>(
        <TouchableOpacity
          style={[
            styles.item,
            {borderBottomColor: isDark ? "#2D2D3A" : "#F3F4F6"},
          ]}
          onPress={()=>{
            onSelect(item.code);
            Keyboard.dismiss();
            setShowFromList(false);
            setShowToList(false);
          }}
        >
          <Text
            style={{
              color: isDark ? "#E0E0E6" : "#111",
              fontSize: 15,
            }}
          >
            {item.flag}{item.code} - {item.name}
          </Text>
        </TouchableOpacity>
      )}
    />
    )
  };

  if(isLoading){
    return(
      <SafeAreaView
        style={[
          styles.loadingContainer,
          {backgroundColor: isDark? "#0E0E14" : "#F9FAFB"}
        ]}
      >
        <View style={styles.loadingCenter}>
          <ActivityIndicator
            size="large"
            color={isDark?"#818CF8" : "#3B82F6"}
          />
          <Text
            style={[
              styles.loadingText,
              {color: isDark? "#A1A1B5" : "#4B5563"},
            ]}
          >
            Cargando información...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  return(
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setShowFromList(false);
        setShowToList(false);
      }}
      accessible={false}
    >
      <SafeAreaView
        style={[
          styles.container,
          {backgroundColor: isDark?"#0F111A" : "#f9f9f9"},
        ]}
      >
        <KeyboardAvoidingView
          style={{flex:1}}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
      <View style={styles.header}>
        <Image 
          source={require("@/assets/images/logoConverter.png")}
          style={styles.logo}
        />
        <Text
          style={[styles.title , {color: isDark ? "#E5E7EB" : "#111827"}]}
        >
          Conversor de monedas
        </Text>
      </View>
      
      <Text style={[styles.label,{color: isDark? "#A1A1B5" : "#374151"}]}>
        De:
      </Text>
      <TouchableOpacity
        onPress={()=>{
          setShowFromList(!showFromList);
          setShowToList(false);
        }}
      >
      <View
        style={[
          styles.inputBox,
          {
            borderColor: isDark ? "#2E2E3D" : "#E5E7EB",
            backgroundColor: isDark ? "#181823" : "#fff"
          },
        ]}
      >
        <Text
          style={[styles.selected , {color: isDark ? "#fff" : "#000"}]}
        >
          {getFlagEmoji(from)}{from}
        </Text>
      </View>
      </TouchableOpacity>
        {showFromList && renderCurrencyList(setFrom,240)}
      {(showFromList || showToList) && (
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setShowFromList(false);
            setShowToList(false);
            Keyboard.dismiss();
          }}
        />
      )}
      <Text style={[styles.label,{color: isDark? "#A1A1B5" : "#374151"}]}>
        A:
      </Text>
      <TouchableOpacity
        onPress={() =>{
          setShowToList(!showToList);
          setShowFromList(false);
        }}
      >
      <View
        style={[
          styles.inputBox,
          {
            borderColor: isDark ? "#2E2E3D" : "#E5E7EB",
            backgroundColor: isDark ? "#181823" : "#fff"
          },
        ]}
      >
        <Text
          style={[styles.selected , {color: isDark ? "#fff" : "#000"}]}
        >
          {getFlagEmoji(to)}{to}
        </Text>
      </View>
      </TouchableOpacity>
      {showToList && renderCurrencyList(setTo,340)}

      {rateLoading && (
        <ActivityIndicator 
          size="large"
          style={{marginTop:30}}
          color={isDark ? "#818CF8" : "#3B82F6"}
        />
      )}
      {rate && !rateLoading && from !== to && (
        <View
          style={[
            styles.rateBox,
            {
              backgroundColor: isDark ? "#1E1E2F" : "#EFF6FF",
            },
          ]}
        >
          <Text
            style={[
              styles.rateText,
              {color: isDark ? "#A5B4FC" : "#1D4ED8"},
            ]}
          >
            100{from}
            {"  "}
            <Ionicons 
              name="swap-horizontal"
              size={20}
              color={isDark ? "#A5B4FC" : "#3B82F6"}
            />
            {"  "}
            {(rate * 100).toFixed(4)}{to}
          </Text>
        </View>
      )}

      <TextInput 
        style={[
          styles.amount,
          {
            borderColor: isDark? "#2E2E3D" : "#E5E7EB",
            backgroundColor: isDark ? "#181823" : "#fff",
            color : isDark ? "#fff" : "#000"
          }
        ]}
        placeholder="Ingresa cantidad"
        placeholderTextColor={isDark?"#666":"#999"}
        keyboardType='numeric'
        value={amount}
        onChangeText={(text)=>{
          const filtered = text.replace(/[^0-9.]/g,"");
          const parts = filtered.split(".");
          if(parts.length>2)return;
          setAmount(filtered);
        }}
      />
      {result && from !== to &&(
        <LinearGradient
          colors={isDark? ["#312E81" , "#6366F1"] : ["#3B82F6","#10B981"]}
          start={{x:0,y:0}}
          end={{x:1,y:0}}
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

const styles = StyleSheet.create({
  container:{flex:1 , paddingHorizontal:24 , paddingVertical:32},
  loadingContainer: {flex: 1},
  loadingCenter: {flex: 1 , justifyContent:"center" , alignItems:"center"},
  loadingText:{marginTop:16,fontSize:16},
  header:{alignItems:"center" , marginBottom:28},
  logo:{width:70,height:70,resizeMode:"contain", marginBottom:8},
  title:{fontSize:26,fontWeight:"700" , textAlign:"center"},
  label:{fontSize:15,fontWeight:"500",marginBottom:6,marginTop:8},
  inputBox:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderWidth:1,borderRadius:12,paddingVertical:12,paddingHorizontal:16,marginBottom:12},
  selected:{fontSize:16,fontWeight:"500"},
  list: {
    position: 'absolute',
    left: 0,
    right: 0,
    height:300,
    borderWidth:1,
    borderRadius:14,
    shadowColor: "#000",
    shadowOpacity:0.12,
    shadowRadius:8,
    shadowOffset:{width:0,height:4},
    elevation:8,
    zIndex:20,
  },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 10 },
  item: {flexDirection:"row",alignItems:"center",paddingVertical:12,paddingHorizontal:16,borderBottomWidth:1},
  rateBox:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    gap:8,
    marginTop:24,
    paddingVertical:10,
    paddingHorizontal:16,
    borderRadius:12,
  },
  rateText:{fontSize:16,fontWeight:"600"},
  amount:{
    borderWidth:1,
    borderRadius:12,
    paddingVertical:15,
    paddingHorizontal:16,
    fontSize:16,
    marginTop:30,
  },
  resultCard:{
    marginTop:28,
    borderRadius:16,
    paddingVertical:20,
    paddingHorizontal:24,
    shadowColor:"#000",
    shadowOpacity:0.15,
    shadowRadius:10,
    shadowOffset:{width:0,height:6},
    elevation:6,
  },
  resultText:{
    fontSize:20,
    fontWeight:"700",
    color:"#fff",
    textAlign:"center",
    letterSpacing:0.5,
  }
})