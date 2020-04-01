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
import { PieChart, XAxis, AreaChart } from 'react-native-svg-charts';
import { Text as SVG_TEXT } from 'react-native-svg';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import * as scale from 'd3-scale';
import * as shape from 'd3-shape';
import { element } from 'prop-types';
import { AD_MOB_UNIT_ID } from 'react-native-dotenv';
import { setTestDeviceIDAsync, AdMobBanner } from 'expo-ads-admob';

function HomeScreen(props) {
	const { navigate } = props.navigation;

	const [token, setToken] = useState(null);
	const [refreshing, setRefreshing] = useState(true);
	const [loading, setLoading] = useState(false);
	const [purchases, setPurchases] = useState(null);
	const [tempPurchases, setTempPurchases] = useState(null);
	const [GroupByBrandData, setGroupByBrandData] = useState(null);
	const [GroupByCategoryData, setGroupByCategoryData] = useState(null);
	const [GroupByStoreData, setGroupByStoreData] = useState(null);
	const [purchasesHistory, setPurchasesHistory] = useState(null);

	const screenWidth = Dimensions.get('window').width;

	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0');
	var yyyy = today.getFullYear();

	const [year, setCurrentYear] = useState(yyyy);
	const [month, setCurrentMonth] = useState(mm);
	const months = [
		'Janeiro',
		'Fevereiro',
		'Março',
		'Abril',
		'Maio',
		'Junho',
		'Julho',
		'Agosto',
		'Setembro',
		'Outubro',
		'Novembro',
		'Dezembro'
	];

	const onRefresh = () => {
		setRefreshing(true);
		if (token !== null && month !== null && year !== null) {
			getPurchases();
		}
		setRefreshing(false);
	};

	async function getToken() {
		setLoading(true);
		setToken(await AsyncStorage.getItem('@shopping_cart:token', null));
		setLoading(false);
	}

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
		return await get('/api/purchase/' + month + '/' + year + '/', {}, token)
			.then(result => {
				// console.log(result.data);
				let temp_result = [];
				result.data.map((item, i) => {
					temp_result.push(item);
				});
				let hist = [];
				temp_result.map((item, key) => {
					hist.push({
						value: item.Price,
						date: item.Timestamp
					});
				});

				hist = groupBy(hist, purchase =>
					parseInt(formatDateDays(purchase.date).split('-')[0])
				);

				if (hist.size !== 0) {
					var lowEnd = 1;
					var highEnd = 31;
					var days = [];
					while (lowEnd <= highEnd) {
						const values = hist.get(lowEnd);
						let spend = 0;
						if (values !== undefined) {
							values.forEach(item => {
								spend = spend + parseFloat(item.value);
							});
						}
						days.push({
							day: lowEnd,
							spend: spend,
							currency: '€',
							date: new Date(year, month - 1, lowEnd)
						});
						lowEnd++;
					}
					setPurchasesHistory(days);
				} else {
					setPurchasesHistory([]);
				}

				const group_by_brand = groupBy(
					result.data,
					purchase => purchase.Product.Brand.Name
				);

				const group_by_category = groupBy(
					result.data,
					purchase => purchase.Product.Category.Name
				);

				const group_by_store = groupBy(
					result.data,
					purchase => purchase.Store.Name
				);

				let keys = group_by_brand.keys();
				let arr = [];
				for (var i = 0; i < group_by_brand.size; i++) {
					var key = keys.next().value;
					const temp = group_by_brand.get(key);
					let spend = 0;
					let currency = null;
					let color = null;
					temp.forEach(item => {
						if (currency == null) {
							spend = spend + parseFloat(item.Price);
							currency = item.Currency;
						} else {
							if (item.Currency === currency) {
								spend = spend + parseFloat(item.Price);
								currency = item.Currency;
							}
						}
						color = item.Product.Brand.Color;
					});
					arr.push({
						name: key,
						spend: spend.toFixed(2),
						svg: {
							fill: color
						},
						currency: currency,
						key: i
					});
				}
				arr = arr.sort((a, b) => {
					if (parseFloat(a['spend']) > parseFloat(b['spend'])) {
						return -1;
					}
					return 1;
				});
				let new_arr = [];
				for (let j = 0; j < arr.length; j++) {
					if (j === 4) {
						new_arr.push({
							name: 'outros',
							spend: parseFloat(arr[j]['spend']).toFixed(2),
							svg: {
								fill: arr[j]['svg']['fill']
							},
							currency: arr[j]['currency'],
							key: 'outros'
						});
					} else if (j > 4) {
						new_arr[4]['spend'] = (
							parseFloat(new_arr[4]['spend']) +
							parseFloat(arr[j]['spend'])
						).toFixed(2);
					} else {
						new_arr.push(arr[j]);
					}
				}
				setGroupByBrandData(new_arr);

				keys = group_by_category.keys();
				arr = [];
				for (var i = 0; i < group_by_category.size; i++) {
					var key = keys.next().value;
					const temp = group_by_category.get(key);
					let spend = 0;
					let currency = null;
					let color = null;
					temp.forEach(item => {
						if (currency == null) {
							spend = spend + parseFloat(item.Price);
							currency = item.Currency;
						} else {
							if (item.Currency === currency) {
								spend = spend + parseFloat(item.Price);
								currency = item.Currency;
							}
						}
						color = item.Product.Category.Color;
					});
					arr.push({
						name: key,
						spend: spend.toFixed(2),
						svg: {
							fill: color
						},
						currency: currency,
						key: i
					});
				}
				arr = arr.sort((a, b) => {
					if (parseFloat(a['spend']) > parseFloat(b['spend'])) {
						return -1;
					}
					return 1;
				});
				new_arr = [];
				for (let k = 0; k < arr.length; k++) {
					if (k === 4) {
						new_arr.push({
							name: 'outros',
							spend: parseFloat(arr[k]['spend']).toFixed(2),
							svg: {
								fill: arr[k]['svg']['fill']
							},
							currency: arr[k]['currency'],
							key: 'outros'
						});
					} else if (k > 4) {
						new_arr[4]['spend'] = (
							parseFloat(new_arr[4]['spend']) +
							parseFloat(arr[k]['spend'])
						).toFixed(2);
					} else {
						new_arr.push(arr[k]);
					}
				}
				setGroupByCategoryData(new_arr);

				keys = group_by_store.keys();
				arr = [];
				for (var i = 0; i < group_by_store.size; i++) {
					var key = keys.next().value;
					const temp = group_by_store.get(key);
					let spend = 0;
					let currency = null;
					let color = null;
					temp.forEach(item => {
						if (currency == null) {
							spend = spend + parseFloat(item.Price);
							currency = item.Currency;
						} else {
							if (item.Currency === currency) {
								spend = spend + parseFloat(item.Price);
								currency = item.Currency;
							}
						}
						color = item.Store.Color;
					});
					arr.push({
						name: key,
						spend: parseFloat(spend).toFixed(2),
						svg: {
							fill: color
						},
						currency: currency,
						key: i
					});
				}
				arr = arr.sort((a, b) => {
					if (parseFloat(a['spend']) > parseFloat(b['spend'])) {
						return -1;
					}
					return 1;
				});
				new_arr = [];
				for (let j = 0; j < arr.length; j++) {
					if (j === 4) {
						new_arr.push({
							name: 'outros',
							spend: parseFloat(arr[j]['spend']).toFixed(2),
							svg: {
								fill: arr[j]['svg']['fill']
							},
							currency: arr[j]['currency'],
							key: 'outros'
						});
					} else if (j > 4) {
						new_arr[4]['spend'] = (
							parseFloat(new_arr[4]['spend']) +
							parseFloat(arr[j]['spend'])
						).toFixed(2);
					} else {
						new_arr.push(arr[j]);
					}
				}
				setGroupByStoreData(new_arr);

				setPurchases(result.data);
				setLoading(false);
			})
			.catch(async error => {
				setLoading(false);
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

	useEffect(() => {
		setLoading(true);
		setTestDeviceIDAsync('EMULATOR');
		getToken();
		setLoading(false);
	}, []);

	useEffect(() => {
		if (token !== null && month !== null && year !== null) {
			getPurchases();
		}
	}, [token, month, year]);

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
				setLoading(false);
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

	const Labels = ({ slices, height, width }) => {
		return slices.map((slice, index) => {
			const { labelCentroid, pieCentroid, data } = slice;
			return (
				<SVG_TEXT
					key={index}
					x={pieCentroid[0]}
					y={pieCentroid[1]}
					fill={'#2b2e4a'}
					textAnchor={'middle'}
					alignmentBaseline={'middle'}
					fontSize={12}
					stroke={'#2b2e4a'}
					strokeWidth={0.2}>
					{data.spend + data.currency}
				</SVG_TEXT>
			);
		});
	};

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

	const Gradient = ({ index }) => (
		<Defs key={index}>
			<LinearGradient
				id={'gradient'}
				x1={'0%'}
				y1={'0%'}
				x2={'0%'}
				y2={'100%'}>
				<Stop offset={'0%'} stopColor={'#142850'} stopOpacity={0.2} />
				<Stop offset={'100%'} stopColor={'#142850'} stopOpacity={1} />
			</LinearGradient>
		</Defs>
	);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#f3f3f3' }}>
			<AdMobBanner
				bannerSize='fullBanner'
				adUnitID={AD_MOB_UNIT_ID} // Test ID, Replace with your-admob-unit-id
				servePersonalizedAds // true or false
				bannerSize={'smartBannerLandscape'}
			/>
			<ScrollView
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={onRefresh}
					/>
				}>
				<View style={[styles.container, { marginBottom: 0 }]}>
					<View style={styles.row}>
						<TouchableOpacity
							onPress={() => {
								if (parseInt(month) === 1) {
									setCurrentYear(parseInt(year) - 1);
									setCurrentMonth(12);
								} else {
									setCurrentMonth(parseInt(month) - 1);
								}
							}}>
							<Icon
								name='arrow-left'
								type='font-awesome'
								size={25}
								color={'#5f7d9d'}
							/>
						</TouchableOpacity>
						<Text>
							{months[parseInt(month - 1)]} de {year}
						</Text>
						<TouchableOpacity
							onPress={() => {
								if (parseInt(month) === 12) {
									setCurrentYear(parseInt(year) + 1);
									setCurrentMonth(1);
								} else {
									setCurrentMonth(parseInt(month) + 1);
								}
							}}>
							<Icon
								name='arrow-right'
								type='font-awesome'
								size={25}
								color={'#5f7d9d'}
							/>
						</TouchableOpacity>
					</View>
					<ScrollView
						horizontal={true}
						decelerationRate='fast'
						showsHorizontalScrollIndicator={false}
						pagingEnabled>
						<View style={{ flexDirection: 'column' }}>
							{purchases &&
								GroupByCategoryData &&
								GroupByCategoryData.length != 0 && (
									<View
										style={{
											marginVertical: 10,
											width: screenWidth
										}}>
										<PieChart
											style={{ height: 250 }}
											valueAccessor={({ item }) =>
												item.spend
											}
											data={GroupByCategoryData}
											padAngle={0}>
											<Labels />
										</PieChart>
									</View>
								)}

							{purchases &&
								GroupByCategoryData &&
								GroupByCategoryData.length != 0 &&
								GroupByCategoryData.map((element, i) => {
									return (
										<View
											style={{
												marginHorizontal: 5,
												justifyContent: 'center'
											}}
											key={i}>
											<View
												style={[
													styles.row,
													{
														justifyContent:
															'flex-start'
													}
												]}>
												<View
													style={{
														backgroundColor:
															element.svg.fill,
														height: 14,
														width: 14,
														borderRadius: 7
													}}
												/>
												<Text
													style={{
														textAlign: 'left',
														color: element.svg.fill,
														marginLeft: 10
													}}>
													{element.name}{' '}
													{element.spend}
													{element.currency}
												</Text>
											</View>
										</View>
									);
								})}
						</View>
						<View style={{ flexDirection: 'column' }}>
							{purchases &&
								GroupByStoreData &&
								GroupByStoreData.length != 0 && (
									<View
										style={{
											marginVertical: 10,
											width: screenWidth
										}}>
										<PieChart
											style={{ height: 250 }}
											valueAccessor={({ item }) =>
												item.spend
											}
											data={GroupByStoreData}
											padAngle={0}>
											<Labels />
										</PieChart>
									</View>
								)}
							{purchases &&
								GroupByStoreData &&
								GroupByStoreData.length != 0 &&
								GroupByStoreData.map((element, i) => {
									return (
										<View
											style={{
												marginHorizontal: 5,
												justifyContent: 'center'
											}}
											key={i}>
											<View
												style={[
													styles.row,
													{
														justifyContent:
															'flex-start'
													}
												]}>
												<View
													style={{
														backgroundColor:
															element.svg.fill,
														height: 14,
														width: 14,
														borderRadius: 7
													}}
												/>
												<Text
													style={{
														textAlign: 'left',
														color: element.svg.fill,
														marginLeft: 10
													}}>
													{element.name}{' '}
													{element.spend}
													{element.currency}
												</Text>
											</View>
										</View>
									);
								})}
						</View>
						<View style={{ flexDirection: 'column' }}>
							{purchases &&
								GroupByBrandData &&
								GroupByBrandData.length != 0 && (
									<View
										style={{
											marginVertical: 10,
											width: screenWidth
										}}>
										<PieChart
											style={{ height: 250 }}
											valueAccessor={({ item }) =>
												item.spend
											}
											data={GroupByBrandData}
											padAngle={0}>
											<Labels />
										</PieChart>
									</View>
								)}
							{purchases &&
								GroupByBrandData &&
								GroupByBrandData.length != 0 &&
								GroupByBrandData.map((element, i) => {
									return (
										<View
											style={{
												marginHorizontal: 5,
												justifyContent: 'center'
											}}
											key={i}>
											<View
												style={[
													styles.row,
													{
														justifyContent:
															'flex-start'
													}
												]}>
												<View
													style={{
														backgroundColor:
															element.svg.fill,
														height: 14,
														width: 14,
														borderRadius: 7
													}}
												/>
												<Text
													style={{
														textAlign: 'left',
														color: element.svg.fill,
														marginLeft: 10
													}}>
													{element.name}{' '}
													{element.spend}
													{element.currency}
												</Text>
											</View>
										</View>
									);
								})}
						</View>
					</ScrollView>
					{purchasesHistory && purchasesHistory.length !== 0 && (
						<>
							<AreaChart
								style={{ height: 200, width: screenWidth }}
								data={purchasesHistory}
								xAccessor={({ item }) => item.day}
								yAccessor={({ item }) => item.spend}
								contentInset={{ top: 30 }}
								xScale={scale.scaleTime}
								curve={shape.curveBasis}
								svg={{ fill: 'url(#gradient)' }}>
								<Gradient />
							</AreaChart>
							<XAxis
								data={purchasesHistory}
								svg={{
									fill: 'white',
									fontSize: 8,
									fontWeight: 'bold',
									y: 5
								}}
								xAccessor={({ item }) => item.date}
								scale={scale.scaleTime}
								numberOfTicks={10}
								style={{
									marginHorizontal: -15,
									backgroundColor: '#142850'
								}}
								contentInset={{ left: 25, right: 25 }}
								formatLabel={value =>
									formatDateDays(value).split('-')[0]
								}
							/>
						</>
					)}
				</View>
				<View
					style={[
						styles.container,
						{
							backgroundColor:
								purchases && purchases.length != 0
									? '#142850'
									: '#f3f3f3',
							marginTop: 0,
							marginBottom: 0,
							paddingBottom: 10
						}
					]}>
					<View
						style={[
							styles.row,
							{
								marginBottom: 10,
								marginTop: 20,
								justifyContent: 'flex-start',
								backgroundColor:
									purchases && purchases.length != 0
										? '#142850'
										: '#f3f3f3'
							}
						]}>
						<Icon
							name='shopping-cart'
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
							Últimas compras
						</Text>
					</View>
					{purchases && purchases.length == 0 && (
						<View
							style={[
								styles.row,
								{
									marginBottom: 10,
									marginTop: 20,
									justifyContent: 'flex-start',
									backgroundColor:
										purchases && purchases.length != 0
											? '#142850'
											: '#f3f3f3'
								}
							]}>
							<Text
								style={{
									color: '#5f7d9d',
									fontSize: 20,
									textAlign: 'center'
								}}>
								{' '}
								Sem compras adicionadas este mês.
							</Text>
						</View>
					)}
					{purchases &&
						purchases.map((s, i) => {
							return (
								<View
									style={[
										styles.row,
										{
											marginVertical: 5,
											backgroundColor: '#142850'
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
												color: '#f3f3f3'
											}}>
											{s.Product.Name +
												' ' +
												s.Product.Brand.Name +
												' (' +
												s.Price +
												s.Currency +
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

export default HomeScreen;
