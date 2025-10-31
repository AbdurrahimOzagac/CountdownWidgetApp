import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {

  const [today, setToday] = useState(new Date());

  useEffect(() => {

    const now = new Date();

    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0
    );

    const timeUntilMidnight = nextMidnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      setToday(new Date());
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, [today]);

  
  const formattedDate = today.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric', 
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bugün: {formattedDate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#0f0',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
