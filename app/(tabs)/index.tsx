import { StyleSheet, Text, View } from 'react-native';

export default function HeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}> Merhaba {isim} !</Text>
    </View>
  );
}

let isim: string = "Abdurrahim";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(58, 146, 138, 1)',
  },
  text: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'rgba(255, 196, 0, 1)',
    textAlign: 'center',
  },
});
