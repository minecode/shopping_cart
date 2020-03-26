import React, { useState, useEffect } from 'react';
import {
	View,
	TouchableOpacity,
	Text,
	Dimensions,
	ScrollView,
	Picker,
	AsyncStorage,
	ActivityIndicator,
	RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import styles from '../../style';
import { SocialIcon, Input, Icon } from 'react-native-elements';

function SettingsScreen(props) {
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {}, []);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		setRefreshing(false);
	}, [refreshing]);

	const { navigate, dispatch } = props.navigation;

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#f3f3f3' }}>
			<Modal
				isVisible={loading}
				coverScreen={false}
				backdropColor={'white'}
				backdropOpacity={0.8}>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center'
					}}>
					<ActivityIndicator size='large' color='#526b78' />
					<Text style={{ color: '#526b78' }}> loading...</Text>
				</View>
			</Modal>
			<ScrollView
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={onRefresh}
					/>
				}>
				<View style={[styles.container]}>
					<View
						style={[
							styles.row,
							{
								justifyContent: 'flex-start'
							}
						]}>
						<Icon
							name='cogs'
							type='font-awesome'
							size={25}
							color={'#5f7d9d'}
						/>
						<Text
							style={{
								color: '#5f7d9d',
								fontWeight: 'bold',
								fontSize: 25
							}}>
							{' '}
							Definições
						</Text>
					</View>
					<View style={[styles.row, { marginTop: 20 }]}>
						<TouchableOpacity
							style={{ flexDirection: 'row' }}
							onPress={() => {
								navigate('Store');
							}}>
							<Icon
								name='map-marker'
								type='font-awesome'
								color={'#5f7d9d'}
							/>
							<Text
								style={{
									color: '#5f7d9d',
									fontWeight: 'bold',
									fontSize: 15
								}}>
								{' '}
								Lojas
							</Text>
						</TouchableOpacity>
					</View>
					<View style={[styles.row, { marginTop: 20 }]}>
						<TouchableOpacity
							style={{ flexDirection: 'row' }}
							onPress={() => {
								navigate('Category');
							}}>
							<Icon
								name='glass'
								type='font-awesome'
								color={'#5f7d9d'}
							/>
							<Text
								style={{
									color: '#5f7d9d',
									fontWeight: 'bold',
									fontSize: 15
								}}>
								{' '}
								Categorias
							</Text>
						</TouchableOpacity>
					</View>
					<View style={[styles.row, { marginTop: 20 }]}>
						<TouchableOpacity
							style={{ flexDirection: 'row' }}
							onPress={() => {
								navigate('Brand');
							}}>
							<Icon
								name='copyright'
								type='font-awesome'
								color={'#5f7d9d'}
							/>
							<Text
								style={{
									color: '#5f7d9d',
									fontWeight: 'bold',
									fontSize: 15
								}}>
								{' '}
								Marcas
							</Text>
						</TouchableOpacity>
					</View>
					<View style={[styles.row, { marginTop: 20 }]}>
						<TouchableOpacity
							style={{ flexDirection: 'row' }}
							onPress={() => {
								navigate('Product');
							}}>
							<Icon
								name='shopping-basket'
								type='font-awesome'
								color={'#5f7d9d'}
							/>
							<Text
								style={{
									color: '#5f7d9d',
									fontWeight: 'bold',
									fontSize: 15
								}}>
								{' '}
								Produtos
							</Text>
						</TouchableOpacity>
					</View>
					<View style={[styles.row, { marginTop: 20 }]}>
						<TouchableOpacity
							style={{ flexDirection: 'row' }}
							onPress={() => {
								navigate('Share');
							}}>
							<Icon
								name='share-alt'
								type='font-awesome'
								color={'#5f7d9d'}
							/>
							<Text
								style={{
									color: '#5f7d9d',
									fontWeight: 'bold',
									fontSize: 15
								}}>
								{' '}
								Partilhar compras
							</Text>
						</TouchableOpacity>
					</View>
					<View style={[styles.row, { marginTop: 20 }]}>
						<TouchableOpacity
							style={{ flexDirection: 'row' }}
							onPress={async () => {
								await AsyncStorage.removeItem(
									'@shopping_cart:token'
								);
								navigate({ name: 'Login' });
							}}>
							<Icon
								name='sign-out'
								type='font-awesome'
								color={'#5f7d9d'}
							/>
							<Text
								style={{
									color: '#5f7d9d',
									fontWeight: 'bold',
									fontSize: 15
								}}>
								{' '}
								Logout
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

export default SettingsScreen;
