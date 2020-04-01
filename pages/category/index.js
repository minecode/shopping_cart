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
import { SocialIcon, Input, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { post, get, put, remove } from '../../services/api';
import Modal from 'react-native-modal';
import styles from '../../style';

export default function CategoryScreen(props) {
	const [token, setToken] = useState(null);
	const [categories, setCategories] = useState(null);
	const [name, setName] = useState(null);
	const [id, setIdEdit] = useState(null);
	const [buttonText, setButtonText] = useState('Adicionar');
	const [buttonIcon, setButtonIcon] = useState('plus');
	const [pickerColor, setPickerColor] = useState(null);
	const [nameError, setNameError] = useState(null);
	const [loading, setLoading] = useState(false);

	const { height, width } = Dimensions.get('window');

	async function getToken() {
		setToken(await AsyncStorage.getItem('@shopping_cart:token', null));
	}

	async function addCategory() {
		setLoading(true);
		setNameError(null);
		await post('/api/category/', { Name: name, Color: pickerColor }, token)
			.then(response => {
				if (token !== null) {
					getCategories();
				}
				setName(null);
			})
			.catch(async error => {
				if (
					error.status === 401 &&
					error.data.detail === 'Signature has expired.'
				) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
				}
				if (
					error.data &&
					error.data.Name &&
					error.data.Name[0] &&
					(error.data.Name[0] === 'This field may not be blank.' ||
						error.data.Name[0] === 'This field may not be null.')
				) {
					setNameError('Insira um nome válido');
				}
				console.log(error);
			});
		setLoading(false);
	}

	async function getCategories() {
		return await get('/api/category/', {}, token)
			.then(result => {
				setCategories(result.data);
			})
			.catch(async error => {
				if (
					error.status === 401 &&
					error.data.detail === 'Signature has expired.'
				) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
				}
				console.log(error);
			});
	}

	async function deleteCategory(id) {
		setLoading(true);
		setNameError(null);
		return await remove('/api/category/' + id + '/', {}, token)
			.then(result => {
				if (token !== null) {
					getCategories();
				}
				setLoading(false);
			})
			.catch(async error => {
				if (
					error.status === 401 &&
					error.data.detail === 'Signature has expired.'
				) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
				}
				setLoading(false);
				console.log(error);
			});
	}

	async function updateCategory(id) {
		setLoading(true);
		setNameError(null);
		return await put(
			'/api/category/' + id + '/',
			{ Name: name, Color: pickerColor },
			token
		)
			.then(result => {
				setName(null);
				setPickerColor(null);
				setIdEdit(null);
				setButtonIcon('plus');
				setButtonText('Adicionar');
				if (token !== null) {
					getCategories();
				}
				setLoading(false);
			})
			.catch(async error => {
				if (
					error.status === 401 &&
					error.data.detail === 'Signature has expired.'
				) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
				}
				setLoading(false);
				if (
					error.data &&
					error.data.Name &&
					error.data.Name[0] &&
					(error.data.Name[0] === 'This field may not be blank.' ||
						error.data.Name[0] === 'This field may not be null.')
				) {
					setNameError('Insira um nome válido');
				}
				console.log(error);
			});
	}

	useEffect(() => {
		setLoading(true);
		getToken();
		setLoading(false);
	}, []);

	useEffect(() => {
		setLoading(true);
		if (token !== null) {
			getCategories();
			setPickerColor('#2E86AB');
		}
		setLoading(false);
	}, [token]);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#f3f3f3' }}>
			<Modal
				isVisible={false}
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
			<ScrollView>
				<View style={[styles.container]}>
					<View style={styles.row}>
						<Input
							placeholder='Nome'
							onChangeText={text => {
								setName(text);
							}}
							value={name}
							errorMessage={nameError}
							errorStyle={{ color: 'red' }}
						/>
					</View>
					<View style={styles.row}>
						<Picker
							style={{ width: 150, color: '#526b78' }}
							selectedValue={pickerColor}
							onValueChange={(itemValue, itemIndex) => {
								setPickerColor(itemValue);
							}}>
							<Picker.Item label={'Azul'} value={'#2E86AB'} />
							<Picker.Item
								label={'Azul escuro'}
								value={'#0842B6'}
							/>
							<Picker.Item label={'Verde'} value={'#1F7F1F'} />
							<Picker.Item
								label={'Verde água'}
								value={'#209F84'}
							/>
							<Picker.Item label={'Laranja'} value={'#FE5D26'} />
							<Picker.Item label={'Amarelo'} value={'#F5B841'} />
							<Picker.Item label={'Vermelho'} value={'#990000'} />
							<Picker.Item label={'Rosa'} value={'#C26296'} />
							<Picker.Item label={'Roxo'} value={'#38023B'} />
						</Picker>
					</View>
					<View style={[styles.row]}>
						<TouchableOpacity
							style={{
								backgroundColor: '#5f7d9d',
								width: width - 40,
								height: 50,
								borderRadius: 25,
								marginVertical: 20,
								alignItems: 'center',
								justifyContent: 'center',
								shadowOffset: { width: 0, height: 1 },
								shadowOpacity: 0.8,
								shadowRadius: 2,
								elevation: 5,
								flexDirection: 'row'
							}}
							onPress={async () => {
								if (id) {
									await updateCategory(id);
								} else {
									await addCategory();
								}
							}}>
							<Icon
								name={buttonIcon}
								color={'white'}
								type='font-awesome'
								iconStyle={{ margin: 10 }}
							/>
							<Text
								style={{
									color: 'white',
									margin: 5,
									fontWeight: 'bold'
								}}>
								{buttonText}
							</Text>
						</TouchableOpacity>
					</View>
					{categories &&
						categories.map((s, i) => {
							return (
								<View
									style={[
										styles.row,
										{
											marginVertical: 5,
											borderBottomWidth: 1,
											paddingBottom: 5,
											borderBottomColor: s.Color
										}
									]}
									key={i}>
									<Text
										style={{
											fontSize: 20
										}}>
										{s.Name}
									</Text>
									<View style={{ flexDirection: 'row' }}>
										<TouchableOpacity
											style={{
												backgroundColor: 'orange',
												height: 30,
												width: 30,
												justifyContent: 'center',
												borderRadius: 60,
												padding: 5,
												marginRight: 5
											}}
											onPress={() => {
												setIdEdit(s.id);
												setName(s.Name);
												setPickerColor(s.Color);
												setButtonIcon('pencil');
												setButtonText('Editar');
											}}>
											<Icon
												name='pencil'
												size={17}
												color={'white'}
												type='font-awesome'
											/>
										</TouchableOpacity>
										<TouchableOpacity
											style={{
												backgroundColor: 'red',
												height: 30,
												width: 30,
												justifyContent: 'center',
												borderRadius: 60,
												padding: 5,
												marginLeft: 5
											}}
											onPress={() => {
												deleteCategory(s.id);
											}}>
											<Icon
												name='times'
												size={17}
												color={'white'}
												type='font-awesome'
											/>
										</TouchableOpacity>
									</View>
								</View>
							);
						})}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
