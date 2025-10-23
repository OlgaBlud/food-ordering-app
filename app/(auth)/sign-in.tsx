import React from "react";
import { Button, Text, View } from "react-native";

const SignIn = () => {
  return (
    <View>
      <Text>SignIn</Text>
      <Button
        title="Sign Up"
        onPress={() => {
          pathname: "/sign-up";
        }}
      />
    </View>
  );
};

export default SignIn;
