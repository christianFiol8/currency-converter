import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


type Currency = {
  code:string;
  name:string;
  flag:string;
};

type ExchangeRate = {
  code:string;
  value:number;
};


export default function AllCurrencyScreen(){
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme ==="dark";
  const[currencies,setCurrencies]=useState<Currency[]>([]);
  const[selectedCurrency,setSelectedCurrency]=useState("AUD");
  const[rates,setRates]=useState<ExchangeRate[]>([]);
  const[rateLoading,setRateLoading]=useState(true);
  const[refreshing,setRefreshing]=useState(false);
  const[isLoading,setIsLoading]=useState(true);

  useEffect(()=>{
    fetchAllCurrencyData();
  },[]);

  const fetchAllCurrencyData = async () => {
    setIsLoading(true);
    try{
      const url = `https://api.frankfurter.dev/v1/currencies`;
      const response = await fetch(url);
      const data = await response.json();
      const list = Object.entries(data).map(([code,name])=>({
        code,
        name: name as string,
        flag:getFlagEmoji(code),
      }));
      if(response.ok){
        setCurrencies(list);
      }else{
        Alert.alert("Error" , "Failed to fetch currency data");
      }
    }catch(error){
      console.error("Currency api error:" , error);
      Alert.alert("Error" , "Failed to fetch currency data");
    }finally{
      setIsLoading(false);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllCurrencyData();
    setRefreshing(false);
  }

  const getFlagEmoji = (code:string)=>{
    const base = 127397;
    const country = code.slice(0,2);
    return country  
      .toUpperCase()
      .split("")
      .map((char)=>String.fromCodePoint(base + char.charCodeAt(0)))
      .join("");
  };

  
  useEffect(()=>{
    if(currencies.length > 0){
      const exists = currencies.find(c=>c.code === selectedCurrency);
      const code = exists ? selectedCurrency : currencies[0].code;
      if(code !== selectedCurrency) setSelectedCurrency(code);
      fetchRates(code);
    }
  },[currencies]);

  const fetchRates = async (baseCode:string) => {
    setRateLoading(true);
    try{
      const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${baseCode}`);
      const json = await res.json();
      if(res.ok){
        const ratesArray = Object.entries(json.rates).map(([code,value])=>({
          code: code as string,
          value: value as number,
        }));
        setRates(ratesArray);
      }
    }catch(err){
      console.error("Fectches error:" , err)
      setRates([]);
    }finally{
      setRateLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRates(selectedCurrency);
    setRefreshing(false);
  };

  const renderRateRow = (item:ExchangeRate) =>(
    <TouchableOpacity
      style={[styles.row,{backgroundColor: isDark ? "#2A2E39" : "#FFFFFF"}]}
      activeOpacity={0.7}
      onPress={()=>router.push({
        pathname:"/modal",
        params:{from: selectedCurrency , to: item.code}
      })}
    >
      <Text
        style={[styles.cellLeft , {color: isDark ? "#E5E7EB" : "#111827"}]}
      >
        {getFlagEmoji(item.code)}{" "}
        <Text
          style={[styles.code, {color: isDark ? "#93C5FD" : "#1F2937"}]}
        >
          {item.code}
        </Text>
      </Text>

      <Text
        style={[styles.cellRight, {color : isDark ? "#D1D5DB" : "#111827"}]}
      >
        {`100${selectedCurrency} = ${(item.value*100).toFixed(2)}${item.code}`}
      </Text>

    </TouchableOpacity>
  );

  if(isLoading){
    return(
      <SafeAreaView
        style={[
          styles.container,
          {backgroundColor: isDark ? "#1E1E1E" : "#F9FAFB"},
        ]}
      >
        <View style={styles.loadingCenter}>
          <ActivityIndicator 
            size="large"
            color={isDark? "#60A5FA" : "#3B82F6"}
          />
          <Text
            style={[
              styles.loadingText,
              {color: isDark ? "#9CA3AF" : "#6B7280"},
            ]}
          >
            Cargando información...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // UI principal: header, chips y lista de tasas
  return(
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? "#1E1E1E" : "#F9FAFB"}
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? "" : "#FFFFFF",
            borderBottomColor: isDark ? "#3F3F46" : "#E5E7EB",
          },
        ]}
      >
        <Text style={[styles.title, {color: isDark ? "#E5E7EB" : "#1E1E1E"}]}>Divisas</Text>
      </View>

      <View style={{height:52,paddingVertical:6,paddingHorizontal:10}}>
        <FlatList
          horizontal
          data={currencies}
            keyExtractor={(item: Currency)=>item.code}
            showsHorizontalScrollIndicator={false}
            renderItem={({item}: {item: Currency})=>(
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.chip,
                {
                  backgroundColor:
                  selectedCurrency === item.code
                    ? "#2563EB"
                    : isDark
                    ? "#374151"
                    :"#FFFFFF",
                    borderColor: isDark ? "#4B5563" : "#E6E9EE",
                },
              ]}
              onPress={()=>{
                if(selectedCurrency!==item.code){
                  setSelectedCurrency(item.code);
                  fetchRates(item.code);
                }
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      selectedCurrency === item.code
                        ? "#FFFFFF"
                        : isDark
                        ? "#E5E7EB"
                        : "#111827",
                  },
                ]}
              >
                {item.flag}{item.code}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {rateLoading ? (
        <View style = {styles.center}>
          <ActivityIndicator 
            size="large"
            color={isDark ? "#60A5FA" : "#3B82F6"}
          />
          <Text
            style={{color: isDark ? "#D1D5DB" : "#111827",
            marginTop:10}}
          >
            Cargando tipos de cambio de {selectedCurrency}
          </Text>
        </View>
      ) : (
        <FlatList 
          data={rates}
            keyExtractor={(item: ExchangeRate) => item.code}
            renderItem={({item}: {item: ExchangeRate}) => renderRateRow(item)}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ItemSeparatorComponent={()=><View style={styles.separator} />}
          contentContainerStyle={{paddingBottom:0}}
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1},
  loadingCenter:{flex:1,justifyContent:"center",alignItems:"center"},
  loadingText:{marginTop:10,fontSize:16,fontWeight:"500"},
  header:{paddingHorizontal:20,paddingVertical:14},
  title:{fontSize:20,fontWeight:"700"},
  chip:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    paddingVertical:8,
    paddingHorizontal:14,
    borderRadius:20,
    marginRight:10,
    borderWidth:1,
  },
  chipText:{fontSize:15,fontWeight:"600",letterSpacing:0.2},
  center:{flex:1,justifyContent:"center",alignItems:"center"},
  centerSmall:{padding:20,alignItems:"center"},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginVertical: 6},
  cellLeft: {flex: 1, fontSize: 16},
  code: {fontSize: 14, fontWeight: '700', marginLeft: 6},
  cellRight: {fontSize: 14, textAlign: 'right'},
  separator: {height: 1, backgroundColor: '#E6E6E6', marginLeft: 16},
})