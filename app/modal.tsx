import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';


const screenWidth = Dimensions.get("window").width;

type ExchangeParams = {
  from: string;
  to: string;
}

export default function CurrencyTrendChart(){

  const params = useLocalSearchParams<ExchangeParams>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const[rates,setRates]=useState<number[]>([]);
  const[loading,setLoading]=useState(true);
  const[currentRate,setCurrentRate]=useState(null);
  const router = useRouter();

  const getLast30Days = useCallback(()=>{
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate()-30);
    const format = (d:Date) => d.toISOString().split("T")[0];
    return {start:format(start) , end: format(end)};
  },[]);

  const fetchRates = useCallback(
    async(from:string,to:string): Promise<void> => {
      const{start,end} = getLast30Days();
      setLoading(true);
      try{
        const url = `https://api.frankfurter.dev/v1/${start}..${end}?from=${from}&to=${to}`;
        const res = await fetch(url);
        const json = await res.json();
        const values = Object.values(json.rates).map((r:any)=>r[to]);
        setRates(values);
        setCurrentRate(values[values.length - 1]);
      }catch(err){
        console.error("Error fetching rates:" , err);
      }finally{
        setLoading(false);
      }
    },
    [getLast30Days]
  );

  useEffect(()=>{
    if(params.from && params.to){
      fetchRates(params.from,params.to);
    }
  },[params.from , params.to , fetchRates]);

  if(loading){
    return(
      <View
        style={[
          styles.loadingContainer,
          {backgroundColor: isDark ? "#0f172a" : "#F9FAFB"},
        ]}
      >
        <ActivityIndicator size="large" color="#2563EB" />
        <Text
          style={[
            styles.loadingText,
            {color: isDark ? "#cbd5e1" : "#374151"},
          ]}
        >
          Cargando datos del tipo de cambio...
        </Text>
      </View>
    )
  }

  return(
    <View
      style={[
        styles.container,
        {backgroundColor: isDark ? "#0f172a" : "#F3F4F6"},
      ]}

    >
      <View style={styles.header2}>
        <TouchableOpacity
          onPress={()=>router.back()}
          style={[
            styles.backButton,
            {backgroundColor:isDark ? "#334155" : "#E5E7EB"},
          ]}
        >
          <Ionicons 
            name="arrow-back"
            size={20}
            color={isDark ? "#e2e8f0" : "#374151"}
          />
        </TouchableOpacity>
        <View style={styles.placeholder}></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,paddingHorizontal:16,paddingTop:10},
  loadingContainer:{flex:1,justifyContent:"center",alignItems:"center"},
  loadingText:{marginTop:12,fontSize:16,fontWeight:"500"},
  header2:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:20,paddingVertical:14,marginBottom:10},
  backButton:{width:40,height:40,borderRadius:20,alignItems:"center",justifyContent:"center"},
  placeholder:{width:40},
  header:{alignItems:"center",marginBottom:10},
  title:{fontSize:26,fontWeight:"700",letterSpacing:0.5},
  subtitle:{fontSize:15,marginTop:4},
});