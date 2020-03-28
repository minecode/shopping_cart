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
import DateTimePicker from '@react-native-community/datetimepicker';
import { AD_MOB_UNIT_ID } from 'react-native-dotenv';
import { setTestDeviceIDAsync, AdMobBanner } from 'expo-ads-admob';

function PurchaseScreen(props) {
	const { navigate } = props.navigation;
	const { params } = props.route;
	const [token, setToken] = useState(null);
	const [stores, setStores] = useState(null);
	const [products, setProducts] = useState(null);
	const [pickerStore, setPickerStore] = useState(null);
	const [pickerCurrency, setPickerCurrency] = useState(null);
	const [pickerUnit, setPickerUnit] = useState(null);
	const [pickerProduct, setPickerProduct] = useState(null);
	const [buttonIcon, setButtonIcon] = useState('plus');
	const [buttonText, setButtonText] = useState('Adicionar');
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(true);
	const [priceError, setPriceError] = useState(null);
	const [productError, setProductError] = useState(null);
	const [storeError, setStoreError] = useState(null);
	const [quantityError, setQuantityError] = useState(null);
	const [unitError, setUnitError] = useState(null);
	const [messageSuccess, setSuccessMessage] = useState(null);
	const [price, setPrice] = useState(null);
	const [quantity, setQuantity] = useState(null);
	const { height, width } = Dimensions.get('window');
	const [date, setDate] = useState(new Date(1598051730000));
	const [mode, setMode] = useState('date');
	const [show, setShow] = useState(false);
	const [dateString, setDateString] = useState(null);

	async function getToken() {
		setLoading(true);
		var today = new Date();
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = today.getFullYear();
		setDate(today);
		formatDateDays(today);
		setToken(await AsyncStorage.getItem('@shopping_cart:token', null));
		setLoading(false);
	}

	const onChange = (event, selectedDate) => {
		const currentDate = selectedDate || date;
		setShow(Platform.OS === 'ios');
		setDate(currentDate);
		formatDateDays(currentDate);
	};

	function formatDateDays(date) {
		var d = new Date(date),
			month = '' + (d.getMonth() + 1),
			day = '' + d.getDate(),
			year = d.getFullYear();

		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;

		setDateString(day + '-' + month + '-' + year);
	}

	const showDatepicker = () => {
		showMode('date');
	};

	const showMode = currentMode => {
		setShow(true);
		setMode(currentMode);
	};

	const onRefresh = () => {
		setSuccessMessage(null);
		if (token !== null) {
			setRefreshing(true);
			getStores();
			getProducts();
			setRefreshing(false);
		} else {
			getToken();
		}
	};

	async function getStores() {
		setLoading(true);
		return await get('/api/store/', {}, token)
			.then(result => {
				setStores(result.data);
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

	async function getProducts() {
		setLoading(true);
		return await get('/api/product/', {}, token)
			.then(result => {
				setProducts(result.data);
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

	async function updatePurchase(id) {
		setLoading(true);
		setPriceError(null);
		setProductError(null);
		setStoreError(null);
		setQuantityError(null);
		setUnitError(null);
		setSuccessMessage(null);
		return await put(
			'/api/purchase/' + id + '/',
			{
				Store: pickerStore,
				Product: pickerProduct,
				Price: price,
				Currency: pickerCurrency,
				quantity: quantity,
				unit: pickerUnit,
				Timestamp: date
			},
			token
		)
			.then(result => {
				setSuccessMessage('Alteração efetuada com sucesso');
				setLoading(false);
			})
			.catch(async error => {
				if (error.status === 401) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
				}
				console.log(error);
				if (
					error.data &&
					error.data.Price &&
					error.data.Price[0] &&
					(error.data.Price[0] === 'This field is required.' ||
						error.data.Price[0] === 'This field may not be null.')
				) {
					setPriceError('Este campo é obrigatório');
				}
				if (
					error.data &&
					error.data.Price &&
					error.data.Price[0] &&
					error.data.Price[0] === 'A valid number is required.'
				) {
					setPriceError('Insira um valor válido');
				}
				if (
					error.data &&
					error.data.Product &&
					error.data.Product[0] &&
					(error.data.Product[0] === 'This field is required.' ||
						error.data.Product[0] === 'This field may not be null.')
				) {
					setProductError('Este campo é obrigatório');
				}
				if (
					error.data &&
					error.data.Currency &&
					error.data.Currency[0] &&
					(error.data.Currency[0] === 'This field is required.' ||
						error.data.Currency[0] ===
							'This field may not be null.')
				) {
					setCurrencyError('Este campo é obrigatório');
				}
				if (
					error.data &&
					error.data.Store &&
					error.data.Store[0] &&
					(error.data.Store[0] === 'This field is required.' ||
						error.data.Store[0] === 'This field may not be null.')
				) {
					setStoreError('Este campo é obrigatório');
				}
				if (
					error.data &&
					error.data.quantity &&
					error.data.quantity[0] &&
					(error.data.quantity[0] === 'This field is required.' ||
						error.data.quantity[0] ===
							'This field may not be null.')
				) {
					setQuantityError('Este campo é obrigatório');
				}
				if (
					error.data &&
					error.data.quantity &&
					error.data.quantity[0] &&
					error.data.quantity[0] === 'A valid number is required.'
				) {
					setQuantityError('Insira um valor válido');
				}
				if (
					error.data &&
					error.data.unit &&
					error.data.unit[0] &&
					(error.data.unit[0] === 'This field is required.' ||
						error.data.unit[0] === 'This field may not be null.')
				) {
					setUnitError('Este campo é obrigatório');
				}
				setLoading(false);
			});
	}

	async function addPurchase() {
		setLoading(true);
		setPriceError(null);
		setProductError(null);
		setStoreError(null);
		setQuantityError(null);
		setUnitError(null);
		setSuccessMessage(null);
		return await post(
			'/api/purchase/',
			{
				Store: pickerStore,
				Product: pickerProduct,
				Price: price,
				Currency: pickerCurrency,
				quantity: quantity,
				unit: pickerUnit,
				Timestamp: date
			},
			token
		)
			.then(result => {
				setLoading(false);
				setSuccessMessage('Compra adicionada com sucesso!');
				// console.log(result);
			})
			.catch(async error => {
				if (error.status === 401) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
				}
				console.log(error);
				if (
					error.data &&
					error.data.Price &&
					error.data.Price[0] &&
					(error.data.Price[0] === 'This field is required.' ||
						error.data.Price[0] === 'This field may not be null.')
				) {
					setPriceError('Este campo é obrigatório');
				}
				if (
					error.data &&
					error.data.Price &&
					error.data.Price[0] &&
					error.data.Price[0] === 'A valid number is required.'
				) {
					setPriceError('Insira um valor válido');
				}
				if (
					error.data &&
					error.data.Product &&
					error.data.Product[0] &&
					(error.data.Product[0] === 'This field is required.' ||
						error.data.Product[0] === 'This field may not be null.')
				) {
					setProductError('Este campo é obrigatório');
				}
				if (
					error.data &&
					error.data.Currency &&
					error.data.Currency[0] &&
					(error.data.Currency[0] === 'This field is required.' ||
						error.data.Currency[0] ===
							'This field may not be null.')
				) {
					setCurrencyError('Este campo é obrigatório');
				}
				if (
					error.data &&
					error.data.Store &&
					error.data.Store[0] &&
					(error.data.Store[0] === 'This field is required.' ||
						error.data.Store[0] === 'This field may not be null.')
				) {
					setStoreError('Este campo é obrigatório');
				}
				if (
					error.data &&
					error.data.quantity &&
					error.data.quantity[0] &&
					(error.data.quantity[0] === 'This field is required.' ||
						error.data.quantity[0] ===
							'This field may not be null.')
				) {
					setQuantityError('Este campo é obrigatório');
				}
				if (
					error.data &&
					error.data.quantity &&
					error.data.quantity[0] &&
					error.data.quantity[0] === 'A valid number is required.'
				) {
					setQuantityError('Insira um valor válido');
				}
				if (
					error.data &&
					error.data.unit &&
					error.data.unit[0] &&
					(error.data.unit[0] === 'This field is required.' ||
						error.data.unit[0] === 'This field may not be null.')
				) {
					setUnitError('Este campo é obrigatório');
				}
				setLoading(false);
			});
	}

	useEffect(() => {
		setSuccessMessage(null);
		setTestDeviceIDAsync('EMULATOR');
		getToken();
		setPickerUnit('ml');
		setPickerCurrency('€');
	}, []);

	useEffect(() => {
		setSuccessMessage(null);
		if (token !== null) {
			getStores();
			getProducts();
		}
	}, [token]);

	useEffect(() => {
		setSuccessMessage(null);
		if (params && params.purchase) {
			const { purchase } = params;
			setPickerStore(purchase.Store.id);
			setPickerProduct(purchase.Product.id);
			setPrice(purchase.Price);
			setPickerCurrency(purchase.Currency);
			setQuantity(purchase.quantity);
			setPickerUnit(purchase.unit);
			setDate(new Date(purchase.Timestamp));
			formatDateDays(purchase.Timestamp);
			setButtonText('Editar');
			setButtonIcon('pencil');
		}
	}, [params]);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#f3f3f3' }}>
			<AdMobBanner
				bannerSize='fullBanner'
				adUnitID={AD_MOB_UNIT_ID} // Test ID, Replace with your-admob-unit-id
				servePersonalizedAds // true or false
				bannerSize={'smartBannerLandscape'}
			/>
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
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between'
							}}>
							<Icon
								name='map-marker'
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
								Loja:{' '}
							</Text>
						</View>
						<Picker
							style={{ width: 150, color: '#526b78' }}
							selectedValue={pickerStore}
							onValueChange={(itemValue, itemIndex) => {
								setPickerStore(itemValue);
							}}>
							{stores &&
								stores.map((s, i) => {
									return (
										<Picker.Item
											key={i}
											label={s.Name}
											value={s.id}
										/>
									);
								})}
						</Picker>
					</View>
					{storeError && (
						<View
							style={[
								styles.row,
								{ marginBottom: 10, marginHorizontal: 30 }
							]}>
							<Text
								style={{
									fontSize: 12,
									color: 'red'
								}}>
								{storeError}
							</Text>
						</View>
					)}
					<View style={[styles.row, { marginBottom: 10 }]}>
						<TouchableOpacity
							style={{ flexDirection: 'row' }}
							onPress={() => {
								navigate('Store');
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
								Adicionar nova loja
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
								name='shopping-basket'
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
								Produto:{' '}
							</Text>
						</View>
						<Picker
							selectedValue={pickerProduct}
							style={{ width: 150, color: '#526b78' }}
							onValueChange={(itemValue, itemIndex) => {
								setPickerProduct(itemValue);
							}}>
							{products &&
								products.map((p, i) => {
									return (
										<Picker.Item
											key={i}
											label={
												p.Name + ' - ' + p.Brand.Name
											}
											value={p.id}
										/>
									);
								})}
						</Picker>
					</View>
					{productError && (
						<View
							style={[
								styles.row,
								{ marginBottom: 10, marginHorizontal: 30 }
							]}>
							<Text
								style={{
									fontSize: 12,
									color: 'red'
								}}>
								{productError}
							</Text>
						</View>
					)}
					<View style={[styles.row, { marginBottom: 10 }]}>
						<TouchableOpacity
							style={{ flexDirection: 'row' }}
							onPress={() => {
								navigate('Product');
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
								Adicionar novo produto
							</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.row}>
						<Input
							value={price && price + ''}
							placeholder='Preço'
							onChangeText={text => {
								setPrice(text);
							}}
							errorMessage={''}
							errorStyle={{ color: 'red' }}
							containerStyle={{ width: width / 2 }}
						/>
						<Picker
							selectedValue={pickerCurrency}
							style={{ width: 150, color: '#526b78' }}
							onValueChange={(itemValue, itemIndex) => {
								setPickerCurrency(itemValue);
							}}>
							<Picker.Item label={'€'} value={'€'} />
							<Picker.Item label={'$'} value={'$'} />
							<Picker.Item label={'£'} value={'£'} />
						</Picker>
					</View>
					{priceError && (
						<View
							style={[
								styles.row,
								{ marginBottom: 10, marginHorizontal: 30 }
							]}>
							<Text
								style={{
									fontSize: 12,
									color: 'red'
								}}>
								{priceError}
							</Text>
						</View>
					)}

					<View style={styles.row}>
						<Input
							value={quantity && quantity + ''}
							placeholder='Quantidade'
							onChangeText={text => {
								setQuantity(text);
							}}
							errorMessage={''}
							errorStyle={{ color: 'red' }}
							containerStyle={{ width: width / 2 }}
						/>
						<Picker
							selectedValue={pickerUnit}
							style={{ width: 150, color: '#526b78' }}
							onValueChange={(itemValue, itemIndex) => {
								setPickerUnit(itemValue);
							}}>
							<Picker.Item label={'ml'} value={'ml'} />
							<Picker.Item label={'l'} value={'l'} />
							<Picker.Item label={'g'} value={'g'} />
							<Picker.Item label={'kg'} value={'kg'} />
							<Picker.Item label={'unidades'} value={'units'} />
							<Picker.Item label={'outro'} value={'other'} />
						</Picker>
					</View>
					{quantityError && (
						<View
							style={[
								styles.row,
								{ marginBottom: 10, marginHorizontal: 30 }
							]}>
							<Text
								style={{
									fontSize: 12,
									color: 'red'
								}}>
								{quantityError}
							</Text>
						</View>
					)}
					{unitError && (
						<View
							style={[
								styles.row,
								{ marginBottom: 10, marginHorizontal: 30 }
							]}>
							<Text
								style={{
									fontSize: 12,
									color: 'red'
								}}>
								{unitError}
							</Text>
						</View>
					)}
					{dateString && (
						<View
							style={[
								styles.row,
								{
									marginTop: 10,
									marginHorizontal: 30,
									justifyContent: 'center'
								}
							]}>
							<Text
								style={{
									color: '#5f7d9d',
									fontWeight: 'bold',
									fontSize: 15
								}}>
								{dateString}
							</Text>
						</View>
					)}
					<View style={[styles.row, { marginTop: 5 }]}>
						<TouchableOpacity
							style={{
								backgroundColor: '#5f7d9d',
								width: width - 40,
								height: 50,
								borderRadius: 25,
								marginBottom: 20,
								alignItems: 'center',
								justifyContent: 'center',
								shadowOffset: { width: 0, height: 1 },
								shadowOpacity: 0.8,
								shadowRadius: 2,
								elevation: 5,
								flexDirection: 'row'
							}}
							onPress={() => {
								showDatepicker();
							}}>
							<Icon
								name={'calendar'}
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
								Data
							</Text>
						</TouchableOpacity>
						{show && (
							<DateTimePicker
								testID='dateTimePicker'
								timeZoneOffsetInMinutes={0}
								value={date}
								mode={mode}
								is24Hour={true}
								display='default'
								onChange={onChange}
							/>
						)}
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
								if (params && params.purchase) {
									await updatePurchase(params.purchase.id);
								} else {
									await addPurchase();
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

					{messageSuccess && (
						<View
							style={[
								styles.row,
								{
									backgroundColor: 'green',
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
								}
							]}>
							<Text
								style={{
									fontSize: 12,
									color: 'white'
								}}>
								{messageSuccess}
							</Text>
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

export default PurchaseScreen;
