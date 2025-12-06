import { View, Text } from 'react-native'
import React from 'react'
import Register from '@/components/login/Register'
import { SafeAreaView } from 'react-native-safe-area-context'
  
const index = () => {
  return (
    <SafeAreaView style={{flex:1, backgroundColor:"black"}}>
        <Register/>
     </SafeAreaView>
  )
}

export default index