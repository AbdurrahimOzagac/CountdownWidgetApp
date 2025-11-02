import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function HomeScreen() {

  const [today, setToday] = useState(new Date());

  const [message, setMessage] = useState('');

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
      {/* Kullanıcıdan metin girişi */}
      <TextInput
        style={styles.input}
        placeholder="Bugünün mesajını yaz..."
        placeholderTextColor="#999"
        value={message}
        onChangeText={setMessage}
      />

      {/* Mesaj + tarih */}
      <Text style={styles.text}>
        {message ? `${message} — ${formattedDate}` : formattedDate}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    color: '#fff',
    width: '100%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 18,
  },
  text: {
    color: '#0f0',
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
