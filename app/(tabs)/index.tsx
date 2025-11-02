import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Button, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

export default function HomeScreen() {
  const [title, setTitle] = useState(''); // yazı1
  const [subtitle, setSubtitle] = useState(''); // yazı2
  const [targetDate, setTargetDate] = useState<Date | null>(null); // hedef tarih
  const [showPicker, setShowPicker] = useState(false); // tarih seçici görünürlüğü
  const [today, setToday] = useState(new Date()); // bugünün tarihi

  // Verileri yükle (uygulama açıldığında)
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTitle = await AsyncStorage.getItem('title');
        const savedSubtitle = await AsyncStorage.getItem('subtitle');
        const savedDate = await AsyncStorage.getItem('targetDate');
        if (savedTitle) setTitle(savedTitle);
        if (savedSubtitle) setSubtitle(savedSubtitle);
        if (savedDate) setTargetDate(new Date(savedDate));
      } catch (err) {
        console.error('Veriler yüklenemedi:', err);
      }
    };
    loadData();
  }, []);

  // Değişiklikleri kalıcı kaydet
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('title', title);
        await AsyncStorage.setItem('subtitle', subtitle);
        if (targetDate) {
          await AsyncStorage.setItem('targetDate', targetDate.toISOString());
        }
      } catch (err) {
        console.error('Veriler kaydedilemedi:', err);
      }
    };
    saveData();
  }, [title, subtitle, targetDate]);

  // Her gece 00:00’da bugünü yenile (gün azalacak)
  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0
    );
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    const timer = setTimeout(() => setToday(new Date()), msUntilMidnight);
    return () => clearTimeout(timer);
  }, [today]);

  // Hedefe kalan gün sayısı
  let daysLeft = 0;
  if (targetDate) {
    const diff = targetDate.getTime() - today.getTime();
    daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24)); // milisaniyeyi güne çevir
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Yazı 1 (örnek: Tatildeyim)"
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
      />

      <Button title="Hedef Tarihi Seç" onPress={() => setShowPicker(true)} color="#0f0" />

      {showPicker && (
        <DateTimePicker
          value={targetDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setTargetDate(selectedDate);
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Yazı 2 (örnek: gün kaldı!)"
        placeholderTextColor="#999"
        value={subtitle}
        onChangeText={setSubtitle}
      />

      <View style={styles.resultBox}>
        {targetDate ? (
          <Text style={styles.resultText}>
            {title} {daysLeft > 0 ? `${daysLeft} ${subtitle}` : 'Tarih geçti 🎉'}
          </Text>
        ) : (
          <Text style={styles.infoText}>Henüz hedef tarihi seçmedin ⏳</Text>
        )}
      </View>
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
    marginBottom: 15,
    fontSize: 18,
  },
  resultBox: {
    marginTop: 30,
    alignItems: 'center',
  },
  resultText: {
    color: '#0f0',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoText: {
    color: '#999',
    fontSize: 18,
  },
});
