import { ProfileFieldProps } from "@/type";
import React from "react";
import { Image, Text, View } from "react-native";

const ProfileField = ({ label, value, icon }: ProfileFieldProps) => {
  return (
    <View>
      <Image source={icon} />
      <Text>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
};

export default ProfileField;
