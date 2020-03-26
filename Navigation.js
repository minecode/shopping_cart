import React from 'react';
import HomeScreen from './pages/home';
import LoginScreen from './pages/login';
import PurchaseScreen from './pages/purchase';
import RegisterScreen from './pages/register';
import SettingsScreen from './pages/settings';
import StoreScreen from './pages/store';
import ProductScreen from './pages/product';
import CategoryScreen from './pages/category';
import BrandScreen from './pages/brand';
import ReportScreen from './pages/report';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Icon } from 'react-native-elements';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import ShareScreen from './pages/share';

const Stack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

function TabNavigator() {
	return (
		<Tab.Navigator
			activeColor='#f0edf6'
			inactiveColor='#27496d'
			labeled
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
				name='Report'
				component={ReportScreen}
				options={{
					tabBarLabel: 'Relatório',
					tabBarIcon: ({ color, size }) => (
						<Icon
							name='bar-chart'
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
		<Stack.Navigator
			screenOptions={{
				headerTintColor: 'white'
			}}>
			<Stack.Screen
				name='Login'
				component={LoginScreen}
				options={{
					headerShown: false
				}}
			/>
			<Stack.Screen
				name='Store'
				component={StoreScreen}
				options={{
					headerStyle: { backgroundColor: '#142850' },
					headerTitleStyle: { color: 'white' },
					title: 'Lojas'
				}}
			/>
			<Stack.Screen
				name='PurchaseStack'
				component={PurchaseScreen}
				options={{
					headerStyle: { backgroundColor: '#142850' },
					headerTitleStyle: { color: 'white' },
					title: 'Compras'
				}}
			/>
			<Stack.Screen
				name='Product'
				component={ProductScreen}
				options={{
					headerStyle: { backgroundColor: '#142850' },
					headerTitleStyle: { color: 'white' },
					title: 'Produtos'
				}}
			/>
			<Stack.Screen
				name='Category'
				component={CategoryScreen}
				options={{
					headerStyle: { backgroundColor: '#142850' },
					headerTitleStyle: { color: 'white' },
					title: 'Categorias'
				}}
			/>
			<Stack.Screen
				name='Brand'
				component={BrandScreen}
				options={{
					headerStyle: { backgroundColor: '#142850' },
					headerTitleStyle: { color: 'white' },
					title: 'Marcas'
				}}
			/>
			<Stack.Screen
				name='Share'
				component={ShareScreen}
				options={{
					headerStyle: { backgroundColor: '#142850' },
					headerTitleStyle: { color: 'white' },
					title: 'Partilhar'
				}}
			/>
			<Stack.Screen
				name='Register'
				component={RegisterScreen}
				options={{
					headerStyle: { backgroundColor: '#142850' },
					headerTitleStyle: { color: 'white' },
					title: 'Registo'
				}}
			/>
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
