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
import { post, get, put, remove } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import styles from '../../style';
import { SocialIcon, Input, Icon } from 'react-native-elements';
import { LineChart, Grid, YAxis } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { Circle, G, Line, Rect, Text as SVG_Text } from 'react-native-svg';

function ReportScreen(props) {
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [products, setProduts] = useState(null);
	const [brands, setBrands] = useState(null);
	const [stores, setStores] = useState(null);
	const [purchases, setPurchases] = useState(null);
	const [groupByBrand, setGroupByBrand] = useState([]);
	const [groupByProduct, setGroupByProduct] = useState([]);
	const [groupByStore, setGroupByStore] = useState([]);
	const [pickerBrand, setPickerBrand] = useState(null);
	const [pickerProduct, setPickerProduct] = useState(null);
	const [pickerStore, setPickerStore] = useState(null);
	const [filteredProducts, setFilteredProducts] = useState(null);
	const [byString, setBy] = useState(null);
	const [minValue, setMin] = useState(null);
	const [minPurchaseElement, setMinPurchase] = useState(null);
	const [maxValue, setMax] = useState(null);
	const [maxPurchaseElement, setMaxPurchase] = useState(null);
	const [medValue, setMed] = useState(null);
	const [data, setData] = useState([]);

	const { navigate } = props.navigation;

	const HorizontalLine = ({ y }) => (
		<Line
			key={'zero-axis'}
			x1={'0%'}
			x2={'100%'}
			y1={y(medValue)}
			y2={y(medValue)}
			stroke={'grey'}
			strokeDasharray={[4, 8]}
			strokeWidth={2}
		/>
	);

	function normalizePrice(purchase) {
		let quantity = null;
		if (purchase.unit === 'ml' || purchase.unit === 'g') {
			quantity = purchase.quantity * 0.001;
		} else {
			if (purchase.unit === 'units') {
				return (
					(purchase.Price / purchase.quantity).toFixed(2) +
					purchase.Currency +
					'/unidade'
				);
			} else if (purchase.unit === 'other') {
				return (
					purchase.Price.toFixed(2) +
					purchase.Currency +
					'/' +
					purchase.quantity
				);
			}
			quantity = purchase.quantity;
		}
		return (
			(purchase.Price / quantity).toFixed(2) +
			purchase.Currency +
			(purchase.unit === 'ml' ? '/L' : '/Kg')
		);
	}

	async function deletePurchase(id) {
		setLoading(true);
		return await remove('/api/purchase/' + id + '/', {}, token)
			.then(result => {
				if (token !== null) {
					getPurchases();
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

	function formatDateDays(date) {
		var d = new Date(date),
			month = '' + (d.getMonth() + 1),
			day = '' + d.getDate(),
			year = d.getFullYear();

		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;

		return day + '-' + month + '-' + year;
	}

	function formatDate(date) {
		var d = new Date(date),
			month = '' + (d.getMonth() + 1),
			day = '' + d.getDate(),
			year = d.getFullYear(),
			hour = d.getHours(),
			minutes = d.getMinutes();

		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;

		return day + '-' + month + '-' + year + ' ' + hour + ':' + minutes;
	}

	const onRefresh = () => {
		setRefreshing(true);
		getPurchases();
		setRefreshing(false);
	};

	async function getToken() {
		setLoading(true);
		setToken(await AsyncStorage.getItem('@shopping_cart:token', null));
		setLoading(false);
	}

	useEffect(() => {
		if (pickerProduct || pickerBrand) {
			getProducts(pickerProduct, pickerBrand, pickerStore);
		}
	}, [pickerProduct, pickerBrand, pickerStore, purchases]);

	async function getProducts(product, brand, store) {
		setLoading(true);
		let temp = [];
		if (product && product != -1) {
			temp = groupBy(purchases, purchase => purchase.Product.Name);
			products.forEach(element => {
				if (element.id == product) {
					temp = temp.get(element.Name);
				}
			});
		}
		if (brand && brand != -1) {
			temp = groupBy(
				temp.length == 0 ? purchases : temp,
				purchase => purchase.Product.Brand.Name
			);
			brands.forEach(element => {
				if (element.id == brand) {
					temp = temp.get(element.Name);
				}
			});
		}
		if (store && store != -1) {
			if (!temp) {
				if (product != -1 && brand != -1) {
					temp = null;
				} else {
					temp = groupBy(
						temp.length == 0 ? purchases : temp,
						purchase => purchase.Store.Name
					);
					stores.forEach(element => {
						if (element.id == store) {
							temp = temp.get(element.Name);
						}
					});
				}
			} else {
				temp = groupBy(
					temp.length == 0 ? purchases : temp,
					purchase => purchase.Store.Name
				);
				stores.forEach(element => {
					if (element.id == store) {
						temp = temp.get(element.Name);
					}
				});
			}
		}
		if (product == -1 && brand == -1 && store == -1) temp = purchases;

		let min = null;
		let minPurchase = null;
		let max = null;
		let maxPurchase = null;
		let med = 0;
		let idx = 0;
		let units = null;
		let by = null;
		let temp_data = [];
		temp.forEach(element => {
			let quantity = null;
			let price = null;
			if (element.unit === 'ml' || element.unit === 'g') {
				quantity = element.quantity * 0.001;
				price = element.Price / quantity;
				by = element.Currency + (element.unit === 'ml' ? '/L' : '/Kg');
			} else if (element.unit === 'units') {
				price = element.Price / element.quantity;
				by = element.Currency + '/unidade';
			} else if (element.unit === 'kg' || element.unit === 'l') {
				price = element.Price / element.quantity;
				by = element.Currency + (element.unit === 'ml' ? '/L' : '/Kg');
			}

			if (price) {
				if (units === null) {
					units = by;
				}
				if (units === by) {
					if (min === null) {
						min = price;
						minPurchase = element;
					} else {
						if (price < min) {
							min = price;
							minPurchase = element;
						}
					}
					if (max === null) {
						max = price;
						maxPurchase = element;
					} else {
						if (price > max) {
							max = price;
							maxPurchase = element;
						}
					}

					med += price;
					idx++;
				}
				temp_data.push(price);
			}
		});

		setData(temp_data);

		med = med / idx;

		min = min;
		max = max;

		setBy(by);
		if (min !== null) setMin(min.toFixed(2));
		setMinPurchase(minPurchase);
		if (max !== null) setMax(max.toFixed(2));
		setMaxPurchase(maxPurchase);
		if (med !== null) setMed(med.toFixed(2));

		setFilteredProducts(temp);
		setLoading(false);
	}

	useEffect(() => {
		if (token != null) {
			getPurchases();
		}
	}, [token]);

	useEffect(() => {
		getToken();
	}, []);

	function groupBy(list, keyGetter) {
		const map = new Map();
		list.forEach(item => {
			const key = keyGetter(item);
			const collection = map.get(key);
			if (!collection) {
				map.set(key, [item]);
			} else {
				collection.push(item);
			}
		});
		return map;
	}

	async function getPurchases() {
		setLoading(true);
		return await get('/api/purchase/', {}, token)
			.then(result => {
				setPurchases(result.data);
				let group_by_brand = groupBy(
					result.data,
					purchase => purchase.Product.Brand.Name
				);
				setGroupByBrand(group_by_brand);
				let keys = group_by_brand.keys();
				let temp_brands = [];
				for (var i = 0; i < group_by_brand.size; i++) {
					var key = keys.next().value;
					const temp = group_by_brand.get(key);
					let id = null;
					temp.forEach(item => {
						id = item.Product.Brand.id;
						return;
					});
					temp_brands.push({ Name: key, id: id });
				}
				temp_brands = temp_brands.sort((a, b) => {
					if (String(a.Name) > String(b.Name)) {
						return 1;
					}
					return -1;
				});

				let new_temp_brands = [];
				new_temp_brands.push({ Name: 'Qualquer', id: '-1' });
				temp_brands.forEach(element => {
					new_temp_brands.push(element);
				});

				setBrands(new_temp_brands);

				const group_by_product = groupBy(
					result.data,
					purchase => purchase.Product.Name
				);
				setGroupByProduct(group_by_product);
				keys = group_by_product.keys();
				let temp_products = [];
				for (var i = 0; i < group_by_product.size; i++) {
					var key = keys.next().value;
					const temp = group_by_product.get(key);
					let id = null;
					temp.forEach(item => {
						id = item.Product.id;
						return;
					});
					temp_products.push({ Name: key, id: id });
				}

				temp_products.push({ Name: 'Qualquer', id: '-1' });
				temp_products = temp_products.sort((a, b) => {
					if (String(a.Name) > String(b.Name)) {
						return 1;
					}
					return -1;
				});
				let new_temp_products = [];
				new_temp_products.push({ Name: 'Qualquer', id: '-1' });
				temp_products.forEach(element => {
					new_temp_products.push(element);
				});
				setProduts(new_temp_products);

				const group_by_store = groupBy(
					result.data,
					purchase => purchase.Store.Name
				);
				setGroupByStore(group_by_store);
				keys = group_by_store.keys();
				let temp_stores = [];
				for (var i = 0; i < group_by_store.size; i++) {
					var key = keys.next().value;
					const temp = group_by_store.get(key);
					let id = null;
					temp.forEach(item => {
						id = item.Store.id;
						return;
					});
					temp_stores.push({ Name: key, id: id });
				}
				temp_stores = temp_stores.sort((a, b) => {
					if (String(a.Name) > String(b.Name)) {
						return 1;
					}
					return -1;
				});

				let new_temp_stores = [];
				new_temp_stores.push({ Name: 'Qualquer', id: '-1' });
				temp_stores.forEach(element => {
					new_temp_stores.push(element);
				});

				setStores(new_temp_stores);
				setLoading(false);
			})
			.catch(error => {
				setLoading(false);
				console.log(error);
			});
	}

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
							style={{ width: 150, color: '#526b78' }}
							selectedValue={pickerProduct}
							onValueChange={(itemValue, itemIndex) => {
								setPickerProduct(itemValue);
							}}>
							{products &&
								products.map((s, i) => {
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
							style={{ width: 150, color: '#526b78' }}
							selectedValue={pickerBrand}
							onValueChange={(itemValue, itemIndex) => {
								setPickerBrand(itemValue);
							}}>
							{brands &&
								brands.map((s, i) => {
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
					{minValue !== null &&
						maxValue !== null &&
						medValue !== null && (
							<View style={[styles.row, { marginVertical: 20 }]}>
								<View
									style={[
										styles.row,
										{
											marginHorizontal: 0,
											flex: 1,
											justifyContent: 'center'
										}
									]}>
									<Icon
										name='arrow-circle-down'
										size={17}
										color={'green'}
										type='font-awesome'
									/>
									<Text
										style={{
											fontSize: 17,
											color: '#142850'
										}}>
										{' '}
										{minValue} {byString}
									</Text>
								</View>
								<View
									style={[
										styles.row,

										{
											marginHorizontal: 0,
											flex: 1,
											justifyContent: 'center'
										}
									]}>
									<Icon
										name='arrow-circle-up'
										size={17}
										color={'red'}
										type='font-awesome'
									/>
									<Text
										style={{
											fontSize: 17,
											color: '#142850'
										}}>
										{' '}
										{maxValue} {byString}
									</Text>
								</View>
								<View
									style={[
										styles.row,
										{
											marginHorizontal: 0,
											flex: 1,
											justifyContent: 'center'
										}
									]}>
									<Icon
										name='arrow-circle-right'
										size={17}
										color={'orange'}
										type='font-awesome'
									/>
									<Text
										style={{
											fontSize: 17,
											color: '#142850'
										}}>
										{' '}
										{medValue} {byString}
									</Text>
								</View>
							</View>
						)}
					<View
						style={{
							height: 250,
							padding: 20,
							flexDirection: 'row'
						}}>
						<YAxis
							data={data}
							contentInset={{ top: 20, bottom: 20 }}
							svg={{ fontSize: 10, fill: 'grey' }}
							formatLabel={value => `${value}`}
						/>
						<View style={{ flex: 1, marginLeft: 10 }}>
							<LineChart
								style={{ flex: 1 }}
								data={data}
								svg={{
									stroke: 'orange',
									strokeWidth: 2
								}}
								contentInset={{ top: 20, bottom: 20 }}
								curve={shape.curveCardinal}
								numberOfTicks={5}>
								<Grid />
								<HorizontalLine />
							</LineChart>
						</View>
					</View>
					{filteredProducts &&
						filteredProducts.map((s, i) => {
							return (
								<View
									style={[
										styles.row,
										{
											marginVertical: 5,
											backgroundColor: '#f3f3f3',
											borderBottomWidth: 1,
											borderBottomColor: s.Store.Color
										}
									]}
									key={i}>
									<View
										style={{
											flexDirection: 'column',
											flex: 7
										}}>
										<Text
											style={{
												fontSize: 17,
												color: '#142850'
											}}>
											{s.Product.Name +
												' ' +
												s.Product.Brand.Name +
												' (' +
												normalizePrice(s) +
												')'}
										</Text>
										<Text
											style={{
												fontSize: 10,
												color: 'grey'
											}}>
											{formatDate(s.Timestamp)}
										</Text>
									</View>
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
												navigate('PurchaseStack', {
													purchase: s
												});
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
												deletePurchase(s.id);
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

export default ReportScreen;
