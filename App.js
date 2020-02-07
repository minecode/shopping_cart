import React from 'react';
import Navigator from './Navigation';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
	return (
		<View style={{ flex: 1 }}>
			<SafeAreaProvider>
				<StatusBar backgroundColor='#142850' barStyle='light-content' />
				<NavigationContainer>
					<Navigator />
				</NavigationContainer>
			</SafeAreaProvider>
		</View>
	);
}
