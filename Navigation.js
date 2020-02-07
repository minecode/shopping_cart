import React from 'react';
import HomeScreen from './pages/home';
import LoginScreen from './pages/login';
import PurchaseScreen from './pages/purchase';
import RegisterScreen from './pages/register';
import SettingsScreen from './pages/settings';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Icon } from 'react-native-elements';
import { MaterialCommunityIcons } from 'react-native-vector-icons';

const Stack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

function TabNavigator() {
	return (
		<Tab.Navigator
			activeColor='#f0edf6'
			inactiveColor='#27496d'
			shifting
			barStyle={{ backgroundColor: '#142850' }}>
			<Tab.Screen
				name='Home'
				component={HomeScreen}
				options={{
					tabBarLabel: 'Home',
					tabBarIcon: ({ color, size }) => (
						<Icon
							name='shopping-basket'
							color={color}
							type='font-awesome'
							size={20}
						/>
					)
				}}
			/>
			<Tab.Screen
				name='Purchase'
				component={PurchaseScreen}
				options={{
					tabBarLabel: 'Compras',
					tabBarIcon: ({ color, size }) => (
						<Icon
							name='money'
							color={color}
							type='font-awesome'
							size={20}
						/>
					)
				}}
			/>
			<Tab.Screen
				name='Settings'
				component={SettingsScreen}
				options={{
					tabBarLabel: 'Definições',
					tabBarIcon: ({ color, size }) => (
						<Icon
							name='cogs'
							color={color}
							type='font-awesome'
							size={20}
						/>
					)
				}}
			/>
		</Tab.Navigator>
	);
}

function StackNavigator() {
	return (
		<Stack.Navigator>
			<Stack.Screen
				name='Login'
				component={LoginScreen}
				options={{
					headerShown: false
				}}
			/>
			<Stack.Screen name='Register' component={RegisterScreen} />
			<Stack.Screen
				name='Home'
				component={TabNavigator}
				options={{
					headerShown: false
				}}
			/>
		</Stack.Navigator>
	);
}

export default StackNavigator;
