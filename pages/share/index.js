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
export default function ShareScreen(props) {
	const [token, setToken] = useState(null);
	const [refreshing, setRefreshing] = useState(true);
	const [name, setName] = useState(null);
	const [email, setEmail] = useState(null);
	const [id, setIdEdit] = useState(null);
	const [buttonText, setButtonText] = useState('Criar novo grupo');
	const [buttonIcon, setButtonIcon] = useState('plus');
	const [emailError, setEmailError] = useState(null);
	const [nameError, setNameError] = useState(null);
	const [loading, setLoading] = useState(true);
	const [groups, setGroups] = useState(null);
	const [users, setUsers] = useState(null);
	const [user, setUser] = useState(null);
	const [members, setMembers] = useState(null);
	const [displayState, setDisplayState] = useState('none');
	const [pickerUser, setPickerUser] = useState(null);
	const { height, width } = Dimensions.get('window');

	const { navigate } = props.navigation;

	async function getToken() {
		setLoading(true);
		setToken(await AsyncStorage.getItem('@shopping_cart:token', null));
		setLoading(false);
	}

	async function addGroup() {
		setLoading(true);
		setNameError(null);
		await post('/api/group/', { Name: name }, token)
			.then(response => {
				if (token !== null) {
					getGroups();
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
				console.log(error);
			});
		setLoading(false);
	}

	async function getGroups() {
		setLoading(true);
		return await get('/api/group/', {}, token)
			.then(result => {
				setLoading(false);
				setGroups(result.data);
			})
			.catch(async error => {
				setLoading(false);
				if (error.status === 401) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
				}
				console.log(error);
			});
	}

	async function deleteGroup(id) {
		setLoading(true);
		setNameError(null);
		return await remove('/api/group/' + id + '/', {}, token)
			.then(result => {
				if (token !== null) {
					getGroups();
				}
				setLoading(false);
			})
			.catch(async error => {
				setLoading(false);
				if (error.status === 401) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
				}
				console.log(error);
			});
	}

	async function updateGroup(id) {
		setLoading(true);
		setNameError(null);
		return await put('/api/product/' + id + '/', { Name: name }, token)
			.then(result => {
				setName(null);
				setIdEdit(null);
				setButtonIcon('plus');
				setButtonText('Criar novo grupo');
				if (token !== null) {
					getGroups();
				}
				setLoading(false);
			})
			.catch(async error => {
				setLoading(false);
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
				console.log(error);
			});
	}

	async function getUsers() {
		setLoading(true);
		return await get('/api/users/', {}, token)
			.then(result => {
				setLoading(false);
				setUsers(result.data);
			})
			.catch(async error => {
				setLoading(false);
				if (error.status === 401) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
				}
				console.log(error);
			});
	}

	async function getUser() {
		setLoading(true);
		return await get('/api/user/', {}, token)
			.then(result => {
				setLoading(false);
				setUser(result.data);
			})
			.catch(async error => {
				setLoading(false);
				if (error.status === 401) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
				}
				console.log(error);
			});
	}

	async function addMember() {
		setLoading(true);
		setEmailError(null);
		setNameError(null);
		var user_insert = users.find(user => user.email === email);
		var exists = user_insert !== undefined;
		if (exists) {
			return await post(
				'/api/groupmembers/',
				{ User: user_insert.id, Group: id },
				token
			)
				.then(response => {
					setName(null);
					setEmail(null);
					setIdEdit(null);
					setButtonIcon('plus');
					setButtonText('Criar novo grupo');
					setLoading(false);
				})
				.catch(async error => {
					setLoading(false);
					if (error.status === 401) {
						await AsyncStorage.removeItem('@shopping_cart:token');
						navigate({ name: 'Login' });
					}
				});
		} else {
			setEmailError('Não existe nenhum utilizador com esse email!');
		}
		setLoading(false);
	}

	async function getMembersOfGroup(id) {
		setLoading(true);
		return await get('/api/groupmembers/' + id + '/', {}, token)
			.then(response => {
				setMembers(response.data);
				setLoading(false);
			})
			.catch(async error => {
				setLoading(false);
				if (error.status === 401) {
					await AsyncStorage.removeItem('@shopping_cart:token');
					navigate({ name: 'Login' });
				}
			});
	}

	useEffect(() => {
		getToken();
	}, []);

	useEffect(() => {
		if (id && members) {
			setDisplayState('flex');
			// getMembersOfGroup();
		} else {
			setDisplayState('none');
		}
	}, [id, members]);

	useEffect(() => {
		setLoading(true);
		if (token !== null) {
			getGroups();
			getUsers();
			getUser();
		}
		setLoading(false);
	}, [token]);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		if (token !== null) {
			getGroups();
			getUsers();
			getUser();
		}
		setRefreshing(false);
	}, [refreshing]);

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
								name='users'
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
								Grupos
							</Text>
						</View>
					</View>
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
					<View style={[styles.row, { marginBottom: 10 }]}>
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
									await updateGroup(id);
								} else {
									await addGroup();
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

					{groups &&
						groups.map((s, i) => {
							return (
								<View
									style={[
										styles.row,
										{
											marginVertical: 5
										}
									]}
									key={i}>
									<Text
										style={{
											fontSize: 20
										}}>
										{s.Name}
									</Text>
									{user && user.id == s.CreatedBy && (
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
												onPress={async () => {
													await getMembersOfGroup(
														s.id
													);
													setIdEdit(s.id);
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
													deleteGroup(s.id);
												}}>
												<Icon
													name='times'
													size={17}
													color={'white'}
													type='font-awesome'
												/>
											</TouchableOpacity>
										</View>
									)}
								</View>
							);
						})}

					<View
						style={[
							styles.row,
							{
								marginTop: 20,
								display: displayState ? displayState : 'flex'
							}
						]}>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between',
								marginBottom: 10
							}}>
							<Icon
								name='user'
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
								Membros:{' '}
							</Text>
						</View>

						{/* <Picker
							selectedValue={pickerUser}
							style={{ width: 150, color: '#526b78' }}
							onValueChange={(itemValue, itemIndex) => {
								setPickerUser(itemValue);
							}}>
							{users &&
								users.map((p, i) => {
									return (
										<Picker.Item
											key={i}
											label={p.username}
											value={p.id}
										/>
									);
								})}
						</Picker> */}
					</View>

					{members &&
						members.map((m, i) => {
							return (
								<View
									key={i}
									style={[
										styles.row,
										{
											display: displayState
												? displayState
												: 'flex'
										}
									]}>
									<Text
										style={{
											fontSize: 15,
											marginVertical: 2,
											paddingLeft: 10
										}}>
										{m.User.username}
									</Text>
								</View>
							);
						})}
					<View
						style={[
							styles.row,
							{
								display: displayState ? displayState : 'flex',
								marginTop: 10
							}
						]}>
						<Input
							placeholder='Email'
							onChangeText={text => {
								setEmail(text);
							}}
							value={email}
							errorMessage={emailError}
							errorStyle={{ color: 'red' }}
						/>
					</View>

					{id && (
						<View style={styles.row}>
							<TouchableOpacity
								style={{
									backgroundColor: '#5f7d9d',
									width: width - 40,
									height: 50,
									borderRadius: 25,
									marginVertical: 10,
									alignItems: 'center',
									justifyContent: 'center',
									shadowOffset: { width: 0, height: 1 },
									shadowOpacity: 0.8,
									shadowRadius: 2,
									elevation: 5,
									flexDirection: 'row'
								}}
								onPress={async () => {
									await addMember();
								}}>
								<Icon
									name={'plus'}
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
									{'Adicionar membro'}
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
