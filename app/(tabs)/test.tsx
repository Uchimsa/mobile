import { Image } from 'expo-image'
import { StyleSheet } from 'react-native'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

export default function TestScreen() {
	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
			headerImage={
				<Image
					source={require('@/assets/images/partial-react-logo.png')}
					style={styles.reactLogo}
				/>
			}
		>
			<ThemedView style={styles.titleContainer}>
				<ThemedText type='title'>№1</ThemedText>
				<ThemedText type='title'>10:09</ThemedText>
			</ThemedView>
			<ThemedView style={styles.cardContainer}>
				<ThemedText type='defaultSemiBold'>
					Время ответа оператора в секундах равно x = [18,20,22,20,25]. Найдите
					среднее арифметическое
				</ThemedText>
			</ThemedView>
			<ThemedView style={styles.cardContainer}>
				<ThemedText type='defaultSemiBold'>20</ThemedText>
			</ThemedView>
		</ParallaxScrollView>
	)
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	cardContainer: {
		backgroundColor: '#06232c',
		padding: 10,
		borderRadius: 20,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	reactLogo: {
		height: 178,
		width: 290,
		bottom: 0,
		left: 0,
		position: 'absolute',
	},
})
