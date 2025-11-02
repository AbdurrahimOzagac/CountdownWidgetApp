import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  calculateCountdown,
  formatDateForInput,
  parseDateInput,
  type CountdownMetrics,
} from '@/utils/countdown';
import {
  updateCountdownWidget,
  type CountdownWidgetPayload,
} from '@/widgets/countdown-widget';

export default function HomeScreen() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [today, setToday] = useState(new Date());
  const [dateInput, setDateInput] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

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
        console.error('Veriler yuklenemedi:', err);
      } finally {
        setIsDataLoaded(true);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!isDataLoaded) return;

    const saveData = async () => {
      try {
        await AsyncStorage.setItem('title', title);
        await AsyncStorage.setItem('subtitle', subtitle);

        if (targetDate) {
          await AsyncStorage.setItem('targetDate', targetDate.toISOString());
        } else {
          await AsyncStorage.removeItem('targetDate');
        }
      } catch (err) {
        console.error('Veriler kaydedilemedi:', err);
      }
    };

    saveData();
  }, [isDataLoaded, title, subtitle, targetDate]);

  useEffect(() => {
    if (targetDate) {
      setDateInput(formatDateForInput(targetDate));
    } else {
      setDateInput('');
    }
  }, [targetDate]);

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0
    );
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    const timer = setTimeout(() => setToday(new Date()), msUntilMidnight);
    return () => clearTimeout(timer);
  }, [today]);

  useEffect(() => {
    if (!isDataLoaded || Platform.OS !== 'android') {
      return;
    }

    const payload: CountdownWidgetPayload = {
      title,
      subtitle,
      targetDateIso: targetDate ? targetDate.toISOString() : null,
    };

    updateCountdownWidget(payload).catch((err) => {
      console.error('Widget guncellenemedi:', err);
    });
  }, [isDataLoaded, title, subtitle, targetDate, today]);

  const countdown: CountdownMetrics = useMemo(
    () => calculateCountdown(targetDate, today),
    [targetDate, today]
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Yazi 1 (ornek: Tatildeyim)"
        placeholderTextColor="#999999"
        value={title}
        onChangeText={setTitle}
      />

      <View style={styles.dateRow}>
        <TextInput
          style={styles.dateInput}
          placeholder="Hedef tarih girin: Or: 17.4.2026"
          placeholderTextColor="#777777"
          value={dateInput}
          onChangeText={setDateInput}
          onEndEditing={({ nativeEvent }) => {
            const parsed = parseDateInput(nativeEvent.text);
            if (parsed) {
              setTargetDate(parsed);
            } else if (!nativeEvent.text.trim()) {
              setTargetDate(null);
            }
          }}
          onSubmitEditing={({ nativeEvent }) => {
            const parsed = parseDateInput(nativeEvent.text);
            if (parsed) {
              setTargetDate(parsed);
            } else if (!nativeEvent.text.trim()) {
              setTargetDate(null);
            }
          }}
          keyboardType="numbers-and-punctuation"
          returnKeyType="done"
        />
        <Text style={styles.dateOrText}>ya da</Text>
        <View style={styles.dateButtonWrapper}>
          <Button title="Hedef Tarihi Sec" onPress={() => setShowPicker(true)} color="#4c6372" />
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={targetDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) {
              setTargetDate(selectedDate);
            }
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Yazi 2 (ornek: gun kaldi!)"
        placeholderTextColor="#999999"
        value={subtitle}
        onChangeText={setSubtitle}
      />

      <View style={styles.resultBox}>
        {renderCountdownResult({
          countdown,
          title,
          subtitle,
        })}
      </View>
    </View>
  );
}

type CountdownResultProps = {
  countdown: CountdownMetrics;
  title: string;
  subtitle: string;
};

const renderCountdownResult = ({ countdown, title, subtitle }: CountdownResultProps) => {
  if (!countdown.hasTargetDate) {
    return <Text style={styles.infoText}>Hedef tarihi secmedin.</Text>;
  }

  if (countdown.isPastTarget) {
    return <Text style={styles.infoText}>Tarih gecti :(</Text>;
  }

  if (!countdown.weeksParts || !countdown.monthsParts) {
    return <Text style={styles.infoText}>Veriler hesaplanamadi.</Text>;
  }

  return (
    <Text style={styles.resultWrapper}>
      {title ? <Text style={styles.titleText}>{title} </Text> : null}
      <Text style={styles.numberText}>{countdown.daysLeft}</Text>
      <Text style={styles.unitText}> Gun</Text>
      <Text style={styles.connectorText}> ya da </Text>
      <Text style={styles.numberText}>{countdown.weeksParts.intPart}</Text>
      <Text style={styles.decimalText}>,{countdown.weeksParts.decimalPart}</Text>
      <Text style={styles.unitText}> Hafta</Text>
      <Text style={styles.connectorText}> ya da </Text>
      <Text style={styles.numberText}>{countdown.monthsParts.intPart}</Text>
      <Text style={styles.decimalText}>,{countdown.monthsParts.decimalPart}</Text>
      <Text style={styles.unitText}> Ay</Text>
      {subtitle ? <Text style={styles.subtitleText}> {subtitle}</Text> : null}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#4d4d4d',
    color: '#ffffff',
    width: '100%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 18,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '50%',
    alignSelf: 'center',
    marginBottom: 15,
  },
  dateInput: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    maxWidth: '60%',
    borderWidth: 1,
    borderColor: '#4d4d4d',
    color: '#ffffff',
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
  },
  dateOrText: {
    marginHorizontal: 16,
    color: '#bbbbbb',
    fontSize: 16,
    fontWeight: '500',
    minWidth: 48,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
  dateButtonWrapper: {
    flexShrink: 0,
  },
  resultBox: {
    marginTop: 30,
    alignItems: 'center',
  },
  resultWrapper: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 18,
  },
  titleText: {
    color: '#8be9fd',
    fontSize: 26,
    fontWeight: '600',
  },
  subtitleText: {
    color: '#ff79c6',
    fontSize: 24,
    fontWeight: '600',
  },
  numberText: {
    color: '#50fa7b',
    fontSize: 32,
    fontWeight: '700',
  },
  decimalText: {
    color: '#f1fa8c',
    fontSize: 22,
    fontWeight: '500',
  },
  unitText: {
    color: '#bd93f9',
    fontSize: 20,
    fontWeight: '500',
  },
  connectorText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  infoText: {
    color: '#999999',
    fontSize: 18,
  },
});
