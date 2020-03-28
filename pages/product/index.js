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

export default function ProductScreen(props) {
	const [token, setToken] = useState(null);
	const [products, setProducts] = useState(null);
	const [categories, setCategories] = useState(null);
	const [pickerCategory, setPickerCategory] = useState(null);
	const [pickerBrand, setPickerBrand] = useState(null);
	const [brands, setBrands] = useState(null);
	const [name, setName] = useState(null);
	const [id, setIdEdit] = useState(null);
	const [buttonText, setButtonText] = useState('Adicionar');
	const [buttonIcon, setButtonIcon] = useState('plus');
	const [nameError, setNameError] = useState(null);
	const [brandError, setBrandError] = useState(null);
	const [refreshing, setRefreshing] = useState(true);
	const [categoryError, setCategoryError] = useState(null);
	const [loading, setLoading] = useState(false);

	const { height, width } = Dimensions.get('window');

	async function getToken() {
		setToken(await AsyncStorage.getItem('@shopping_cart:token', null));
	}

	async function addProduct() {
		setLoading(true);
		setNameError(null);
		setCategoryError(null);
		setBrandError(null);
		await post(
			'/api/product/',
			{ Name: name, Brand: pickerBrand, Category: pickerCategory },
			token
		)
			.then(response => {
				if (token !== null) {
					getProducts();
				}
				setName(null);
			})
			.catch(async error => {
				if (error.status === 401) {
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
				if (
					error.data &&
					error.data.Brand &&
					error.data.Brand[0] &&
					error.data.Brand[0] === 'This field is required.'
				) {
					setBrandError('Este campo é obrigatório');
				}

				if (
					error.data &&
					error.data.Category &&
					error.data.Category[0] &&
					error.data.Category[0] === 'This field is required.'
				) {
					setCategoryError('Este campo é obrigatório');
				}
				console.log(error);
			});
		setLoading(false);
	}

	async function getProducts() {
		return await get('/api/product/', {}, token)
			.then(result => {
				setProducts(result.data);
			})
			.catch(async error => {
				if (error.status === 401) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
				}
				console.log(error);
			});
	}

	async function deleteProduct(id) {
		setLoading(true);
		setNameError(null);
		setCategoryError(null);
		setBrandError(null);
		return await remove('/api/product/' + id + '/', {}, token)
			.then(result => {
				if (token !== null) {
					getProducts();
				}
				setLoading(false);
			})
			.catch(async error => {
				if (error.status === 401) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
				}
				setLoading(false);
				console.log(error);
			});
	}

	async function updateProduct(id) {
		setLoading(true);
		setNameError(null);
		setCategoryError(null);
		setBrandError(null);
		return await put(
			'/api/product/' + id + '/',
			{ Name: name, Brand: pickerBrand, Category: pickerCategory },
			token
		)
			.then(result => {
				setName(null);
				setIdEdit(null);
				setButtonIcon('plus');
				setButtonText('Adicionar');
				if (token !== null) {
					getProducts();
				}
				setLoading(false);
			})
			.catch(async error => {
				if (error.status === 401) {
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
				if (
					error.data &&
					error.data.Brand &&
					error.data.Brand[0] &&
					error.data.Brand[0] === 'This field is required.'
				) {
					setBrandError('Este campo é obrigatório');
				}

				if (
					error.data &&
					error.data.Category &&
					error.data.Category[0] &&
					error.data.Category[0] === 'This field is required.'
				) {
					setCategoryError('Este campo é obrigatório');
				}
				console.log(error);
			});
	}

	async function getCategories() {
		return await get('/api/category/', {}, token)
			.then(result => {
				setCategories(result.data);
			})
			.catch(async error => {
				if (error.status === 401) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
				}
				console.log(error);
			});
	}

	async function getBrands() {
		return await get('/api/brand/', {}, token)
			.then(result => {
				setBrands(result.data);
			})
			.catch(async error => {
				if (error.status === 401) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
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
			getProducts();
			getCategories();
			getBrands();
		}
		setLoading(false);
	}, [token]);

	const onRefresh = () => {
		setRefreshing(true);
		getProducts();
		getCategories();
		getBrands();
		setRefreshing(false);
	};

	const { navigate } = props.navigation;

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
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between'
							}}>
							<Icon
								name='glass'
								type='font-awesome'
								color={'#5f7d9d'}
							/>
							<Text
								style={{
									fontWeight: 'bold',
									fontSize: 20,
									color: '#5f7d9d'
								}}>
								{' '}
								Categoria:{' '}
							</Text>
						</View>

						<Picker
							selectedValue={pickerCategory}
							style={{ width: 150, color: '#526b78' }}
							onValueChange={(itemValue, itemIndex) => {
								setPickerCategory(itemValue);
							}}>
							<Picker.Item label={''} value={''} />
							{categories &&
								categories.map((p, i) => {
									return (
										<Picker.Item
											key={i}
											label={p.Name}
											value={p.id}
										/>
									);
								})}
						</Picker>
					</View>
					{categoryError && (
						<View style={[styles.row, { marginBottom: 10 }]}>
							<Text
								style={{
									fontSize: 12,
									color: 'red'
								}}>
								{categoryError}
							</Text>
						</View>
					)}
					<View style={[styles.row, { marginBottom: 10 }]}>
						<TouchableOpacity
							style={{ flexDirection: 'row' }}
							onPress={() => {
								navigate('Category');
							}}>
							<Icon
								name='plus'
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
								Adicionar nova categoria
							</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.row}>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between'
							}}>
							<Icon
								name='copyright'
								type='font-awesome'
								color={'#5f7d9d'}
							/>
							<Text
								style={{
									fontWeight: 'bold',
									fontSize: 20,
									color: '#5f7d9d'
								}}>
								{' '}
								Marca:{' '}
							</Text>
						</View>

						<Picker
							selectedValue={pickerBrand}
							style={{ width: 150, color: '#526b78' }}
							onValueChange={(itemValue, itemIndex) => {
								setPickerBrand(itemValue);
							}}>
							<Picker.Item label={''} value={''} />
							{brands &&
								brands.map((p, i) => {
									return (
										<Picker.Item
											key={i}
											label={p.Name}
											value={p.id}
										/>
									);
								})}
						</Picker>
					</View>
					{brandError && (
						<View style={[styles.row, { marginBottom: 10 }]}>
							<Text
								style={{
									fontSize: 12,
									color: 'red'
								}}>
								{brandError}
							</Text>
						</View>
					)}
					<View style={[styles.row, { marginBottom: 10 }]}>
						<TouchableOpacity
							style={{ flexDirection: 'row' }}
							onPress={() => {
								navigate('Brand');
							}}>
							<Icon
								name='plus'
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
								Adicionar nova marca
							</Text>
						</TouchableOpacity>
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
									await updateProduct(id);
								} else {
									await addProduct();
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
					{products &&
						products.map((s, i) => {
							return (
								<View
									style={[
										styles.row,
										{
											marginVertical: 5,
											borderBottomWidth: 1,
											paddingBottom: 5,
											borderBottomColor: s.Category.Color
										}
									]}
									key={i}>
									<Text
										style={{
											fontSize: 20,
											flex: 7
										}}>
										{s.Name + ' - ' + s.Brand.Name}
									</Text>
									<View
										style={{
											flexDirection: 'row',
											flex: 2
										}}>
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
												setPickerBrand(s.Brand.id);
												setName(s.Name);
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
												deleteProduct(s.id);
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
