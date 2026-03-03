import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule a reminder 1 hour before the appointment.
 * dateTime should be a Date object representing the appointment time.
 */
export async function scheduleAppointmentReminder(doctorName, hospitalName, dateTime) {
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const triggerDate = new Date(dateTime.getTime() - 60 * 60 * 1000);
  // Only schedule if the reminder is in the future
  if (triggerDate <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Appointment Reminder',
      body: `Your appointment with ${doctorName} at ${hospitalName} is in 1 hour.`,
      sound: true,
    },
    trigger: triggerDate,
  });

  return id;
}
