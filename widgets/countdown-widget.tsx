import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Platform } from 'react-native';
import {
  FlexWidget,
  type FlexWidgetStyle,
  registerWidgetTaskHandler,
  requestWidgetUpdate,
  TextWidget,
  type TextWidgetStyle,
} from 'react-native-android-widget';

import { calculateCountdown, type CountdownMetrics } from '@/utils/countdown';

export const COUNTDOWN_WIDGET_NAME = 'CountdownInfoWidget';

export type CountdownWidgetPayload = {
  title: string;
  subtitle: string;
  targetDateIso: string | null;
};

const STORAGE_KEYS = {
  title: 'title',
  subtitle: 'subtitle',
  targetDate: 'targetDate',
};

const FALLBACK_PAYLOAD: CountdownWidgetPayload = {
  title: '',
  subtitle: '',
  targetDateIso: null,
};

const loadPayloadFromStorage = async (): Promise<CountdownWidgetPayload> => {
  try {
    const [storedTitle, storedSubtitle, storedTargetDate] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.title),
      AsyncStorage.getItem(STORAGE_KEYS.subtitle),
      AsyncStorage.getItem(STORAGE_KEYS.targetDate),
    ]);

    return {
      title: storedTitle ?? '',
      subtitle: storedSubtitle ?? '',
      targetDateIso: storedTargetDate ?? null,
    };
  } catch (error) {
    console.error('Widget verileri okunamadi:', error);
    return FALLBACK_PAYLOAD;
  }
};

const buildCountdownWidget = (
  payload: CountdownWidgetPayload,
  referenceDate: Date = new Date()
): React.JSX.Element => {
  const targetDate = payload.targetDateIso ? new Date(payload.targetDateIso) : null;
  const countdown: CountdownMetrics = calculateCountdown(targetDate, referenceDate);

  if (!countdown.hasTargetDate) {
    return (
      <FlexWidget style={widgetContainerStyle}>
        <TextWidget
          text="Hedef tarihi secmedin."
          style={infoTextStyle}
          maxLines={2}
          truncate="END"
        />
      </FlexWidget>
    );
  }

  if (countdown.isPastTarget) {
    return (
      <FlexWidget style={widgetContainerStyle}>
        <TextWidget text="Tarih gecti :(" style={infoTextStyle} />
      </FlexWidget>
    );
  }

  if (!countdown.weeksParts || !countdown.monthsParts) {
    return (
      <FlexWidget style={widgetContainerStyle}>
        <TextWidget text="Veriler hesaplanamadi." style={infoTextStyle} />
      </FlexWidget>
    );
  }

  return (
    <FlexWidget style={{ ...widgetContainerStyle, flexGap: 8 }}>
      {payload.title ? (
        <TextWidget
          text={payload.title}
          style={titleTextStyle}
          maxLines={1}
          truncate="END"
        />
      ) : null}

      <FlexWidget
        style={countdownRowStyle}
      >
        <TextWidget text={`${countdown.daysLeft}`} style={numberTextStyle} />
        <TextWidget text="Gun" style={unitTextStyle} />
        <TextWidget text="ya da" style={connectorTextStyle} />
        <TextWidget text={countdown.weeksParts.intPart} style={numberTextStyle} />
        <TextWidget text={`,${countdown.weeksParts.decimalPart}`} style={decimalTextStyle} />
        <TextWidget text="Hafta" style={unitTextStyle} />
        <TextWidget text="ya da" style={connectorTextStyle} />
        <TextWidget text={countdown.monthsParts.intPart} style={numberTextStyle} />
        <TextWidget text={`,${countdown.monthsParts.decimalPart}`} style={decimalTextStyle} />
        <TextWidget text="Ay" style={unitTextStyle} />
      </FlexWidget>

      {payload.subtitle ? (
        <TextWidget
          text={payload.subtitle}
          style={subtitleTextStyle}
          maxLines={1}
          truncate="END"
        />
      ) : null}
    </FlexWidget>
  );
};

const widgetContainerStyle: FlexWidgetStyle = {
  flexDirection: 'column',
  padding: 16,
  borderRadius: 16,
  backgroundColor: '#1e1e1e',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'match_parent',
  height: 'match_parent',
};

const countdownRowStyle: FlexWidgetStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  flexGap: 4,
};

const infoTextStyle: TextWidgetStyle = {
  color: '#bbbbbb',
  fontSize: 16,
  textAlign: 'center',
};

const numberTextStyle: TextWidgetStyle = {
  color: '#50fa7b',
  fontSize: 18,
  fontWeight: '700',
};

const unitTextStyle: TextWidgetStyle = {
  color: '#bd93f9',
  fontSize: 14,
  fontWeight: '500',
};

const connectorTextStyle: TextWidgetStyle = {
  color: '#ffffff',
  fontSize: 14,
  fontWeight: '500',
};

const decimalTextStyle: TextWidgetStyle = {
  color: '#f1fa8c',
  fontSize: 14,
  fontWeight: '500',
};

const titleTextStyle: TextWidgetStyle = {
  color: '#8be9fd',
  fontSize: 18,
  fontWeight: '600',
};

const subtitleTextStyle: TextWidgetStyle = {
  color: '#ff79c6',
  fontSize: 16,
  fontWeight: '600',
};

export const updateCountdownWidget = async (
  overridePayload?: CountdownWidgetPayload
): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }

  const payload = overridePayload ?? (await loadPayloadFromStorage());

  await requestWidgetUpdate({
    widgetName: COUNTDOWN_WIDGET_NAME,
    renderWidget: async () => buildCountdownWidget(payload),
  });
};

if (Platform.OS === 'android') {
  registerWidgetTaskHandler(async ({ renderWidget }) => {
    const payload = await loadPayloadFromStorage();
    renderWidget(buildCountdownWidget(payload));
  });
}
