import { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  Modal,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Типы для задачи
interface Task {
  id: number;
  title: string;        // условие задачи
  course: string;       // название курса
  hint?: string;        // подсказка
  correctAnswer?: string; // правильный ответ (для демо)
}

// Моковые данные задач
const mockTasks: Task[] = [
  {
    id: 1,
    course: 'Введение в экономику',
    title: 'Вычислите эластичность спроса по цене, если при снижении цены с 10 до 8 рублей объем спроса вырос с 100 до 120 единиц.',
    hint: 'Формула точечной эластичности: (ΔQ/ΔP) * (P/Q).',
    correctAnswer: '-1',
  },
  {
    id: 2,
    course: 'Линейная алгебра',
    title: 'Найдите определитель матрицы [[2, 3], [1, 4]].',
    hint: 'Определитель 2x2: ad - bc.',
    correctAnswer: '5',
  },
  {
    id: 3,
    course: 'Математический анализ',
    title: 'Найдите производную функции f(x) = x^2 * sin(x).',
    hint: 'Используйте правило произведения: (uv)\' = u\'v + uv\'.',
    correctAnswer: '2x*sin(x) + x^2*cos(x)',
  },
];

export default function TaskScreen() {
  // Состояния
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [task, setTask] = useState<Task>(mockTasks[0]);
  const [customTime, setCustomTime] = useState<string | null>(null); // заданное пользователем время
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [timeInput, setTimeInput] = useState('');

  // Состояния для ответа
  const [latexAnswer, setLatexAnswer] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [answerType, setAnswerType] = useState<'latex' | 'photo'>('latex');

  // Состояния для проверки
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{ correct: boolean; message: string } | null>(null);

  // При смене задачи сбрасываем ответ и результат
  useEffect(() => {
    setLatexAnswer('');
    setPhotoUri(null);
    setCheckResult(null);
  }, [currentTaskIndex]);

  // Загрузка задачи по индексу
  const loadTask = (index: number) => {
    if (index >= 0 && index < mockTasks.length) {
      setTask(mockTasks[index]);
      setCurrentTaskIndex(index);
    } else {
      Alert.alert('Конец', 'Вы прошли все задачи!');
    }
  };

  // Переход к следующей задаче
  const nextTask = () => {
    if (currentTaskIndex + 1 < mockTasks.length) {
      loadTask(currentTaskIndex + 1);
    } else {
      Alert.alert('Поздравляем!', 'Вы решили все задачи.');
    }
  };

  // Установка времени (пользователь задает при старте)
  const setUserTime = () => {
    setTimeModalVisible(true);
  };

  const confirmTime = () => {
    const parsed = parseInt(timeInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setCustomTime(`${parsed} мин`);
    } else {
      Alert.alert('Ошибка', 'Введите положительное число минут');
    }
    setTimeModalVisible(false);
    setTimeInput('');
  };

  // Подсказка
  const askHint = () => {
    if (task.hint) {
      Alert.alert('Подсказка', task.hint);
    } else {
      Alert.alert('Подсказка', 'К сожалению, подсказки для этой задачи нет.');
    }
  };

  // Выбор фото
  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет прав', 'Разрешите доступ к галерее для прикрепления фото.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0].uri) {
      setPhotoUri(result.assets[0].uri);
      setAnswerType('photo');
    }
  };

  // Отправка на проверку (имитация API)
  const submitForCheck = async () => {
    // Проверяем, что введен ответ
    if (answerType === 'latex' && !latexAnswer.trim()) {
      Alert.alert('Ошибка', 'Введите ответ в формате LaTeX');
      return;
    }
    if (answerType === 'photo' && !photoUri) {
      Alert.alert('Ошибка', 'Прикрепите фото с решением');
      return;
    }

    setIsChecking(true);
    setCheckResult(null);

    // Формируем данные для отправки
    const payload = {
      type: answerType,
      answer: answerType === 'latex' ? latexAnswer : photoUri,
      taskId: task.id,
    };

    console.log('Отправка на сервер:', payload);

    // Имитация задержки ответа от сервера (например, 2 секунды)
    setTimeout(() => {
      // Моковая проверка: сравниваем с правильным ответом (для демо)
      const isCorrect = task.correctAnswer && latexAnswer.trim().toLowerCase() === task.correctAnswer.toLowerCase();
      if (isCorrect) {
        setCheckResult({
          correct: true,
          message: '✅ Правильно! Отличная работа.',
        });
      } else {
        setCheckResult({
          correct: false,
          message: `❌ Неправильно. ${task.correctAnswer ? `Правильный ответ: ${task.correctAnswer}` : 'Попробуйте ещё раз.'}`,
        });
      }
      setIsChecking(false);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Верхняя панель: курс и время */}
        <View style={styles.header}>
          <ThemedView style={styles.courseContainer}>
            <ThemedText type="defaultSemiBold" style={styles.courseLabel}>
              Курс:
            </ThemedText>
            <ThemedText type="title" style={styles.courseName}>
              {task.course}
            </ThemedText>
          </ThemedView>
          <TouchableOpacity style={styles.timeButton} onPress={setUserTime}>
            <ThemedText style={styles.timeButtonText}>
              {customTime ? `⏱️ ${customTime}` : '⏱️ Задать время'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Блок с условием задачи */}
        <ThemedView style={styles.taskCard}>
          <ThemedText type="subtitle" style={styles.taskTitle}>
            Задача №{task.id}
          </ThemedText>
          <ThemedText style={styles.taskText}>{task.title}</ThemedText>
        </ThemedView>

        {/* Блок ввода ответа */}
        <ThemedView style={styles.answerSection}>
          <View style={styles.answerTypeSwitcher}>
            <TouchableOpacity
              style={[styles.typeButton, answerType === 'latex' && styles.activeTypeButton]}
              onPress={() => setAnswerType('latex')}
            >
              <ThemedText style={answerType === 'latex' ? styles.activeTypeText : styles.typeText}>
                LaTeX
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, answerType === 'photo' && styles.activeTypeButton]}
              onPress={() => setAnswerType('photo')}
            >
              <ThemedText style={answerType === 'photo' ? styles.activeTypeText : styles.typeText}>
                Фото
              </ThemedText>
            </TouchableOpacity>
          </View>

          {answerType === 'latex' ? (
            <TextInput
              style={styles.latexInput}
              multiline
              placeholder="Введите ответ в формате LaTeX, например: x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}"
              placeholderTextColor="#94a3b8"
              value={latexAnswer}
              onChangeText={setLatexAnswer}
            />
          ) : (
            <View style={styles.photoContainer}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              ) : (
                <TouchableOpacity style={styles.photoButton} onPress={pickPhoto}>
                  <ThemedText style={styles.photoButtonText}>📸 Прикрепить фото</ThemedText>
                </TouchableOpacity>
              )}
              {photoUri && (
                <TouchableOpacity style={styles.removePhotoButton} onPress={() => setPhotoUri(null)}>
                  <ThemedText style={styles.removePhotoText}>Удалить фото</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Кнопка отправки на проверку */}
          <TouchableOpacity style={styles.submitButton} onPress={submitForCheck} disabled={isChecking}>
            {isChecking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Отправить на проверку</ThemedText>
            )}
          </TouchableOpacity>

          {/* Результат проверки */}
          {checkResult && (
            <ThemedView style={[styles.resultContainer, checkResult.correct ? styles.correctResult : styles.wrongResult]}>
              <ThemedText style={styles.resultText}>{checkResult.message}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Нижние кнопки: подсказка и следующая задача */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.hintButton} onPress={askHint}>
            <ThemedText style={styles.hintButtonText}>💡 Попросить помощь / подсказку</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={nextTask}>
            <ThemedText style={styles.nextButtonText}>➡️ Перейти к следующей задаче</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Модальное окно для ввода времени */}
      <Modal visible={timeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Задайте время на решение (минуты)</ThemedText>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="Например, 15"
              placeholderTextColor="#94a3b8"
              value={timeInput}
              onChangeText={setTimeInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setTimeModalVisible(false)}>
                <Text style={styles.modalCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmTime}>
                <Text style={styles.modalConfirmText}>Установить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  courseContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  courseLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  timeButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeButtonText: {
    color: '#f1f5f9',
    fontSize: 14,
  },
  taskCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 12,
  },
  taskText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#e2e8f0',
  },
  answerSection: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  answerTypeSwitcher: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#334155',
  },
  activeTypeButton: {
    backgroundColor: '#3b82f6',
  },
  typeText: {
    color: '#cbd5e1',
    fontWeight: '500',
  },
  activeTypeText: {
    color: '#fff',
    fontWeight: '600',
  },
  latexInput: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    color: '#f8fafc',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#334155',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoButton: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#f1f5f9',
    fontSize: 16,
  },
  photoPreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  removePhotoButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  removePhotoText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  correctResult: {
    backgroundColor: '#14532d',
  },
  wrongResult: {
    backgroundColor: '#7f1d1d',
  },
  resultText: {
    color: '#f8fafc',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  hintButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  hintButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#cbd5e1',
  },
  modalConfirm: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});