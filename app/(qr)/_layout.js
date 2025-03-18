import { View } from "react-native";
import { Stack, Link } from "expo-router";
import { Pressable } from "react-native";
import { CircleInfoIcon } from "../../components/Icons";
import { Logo } from "../../components/Logo";
import {StatusBar} from "expo-status-bar";

export default function qrLayout(){
    return (
      <View className="flex-1">
        <Stack
          screenOptions={{
            header: () => (
              <View className="bg-white px-4 pt-12 pb-2 flex flex-row justify-between items-center border-b-2 border-stone-600">
                <Logo />
                <Link asChild href="/about">
                  <Pressable>
                    <CircleInfoIcon />
                  </Pressable>
                </Link>
              </View>
            ),
            headerShown: true,
            tabBarStyle: { backgroundColor: "#000" },
            tabBarActiveTintColor: "#ffffff",
          }}
        />
        <StatusBar style="dark" />
      </View>
    );
}