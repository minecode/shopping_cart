import React, { useState, useEffect } from 'react';
import {
	View,
	TouchableOpacity,
	Text,
	Dimensions,
	ScrollView,
	AsyncStorage,
	ActivityIndicator
} from 'react-native';
import styles from '../../style';
import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';
import { SocialIcon, Input, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { post, get, put, remove } from '../../services/api';
import Modal from 'react-native-modal';
import {
	ANDROID_CLIENT_ID,
	ANDROID_STANDALONE_APP_CLIENT_ID,
	FACEBOOK_APP_ID
} from 'react-native-dotenv';

function LoginScreen(props) {
	const [loginGoogleError, setLoginGoogleError] = useState(null);
	const [loginFacebookError, setLoginFacebookError] = useState(null);
	const [loginError, setLoginError] = useState(null);
	const [loginUsernameError, setLoginUsernameError] = useState(null);
	const [loginPasswordError, setLoginPasswordError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [username, setUsername] = useState(false);
	const [password, setPassword] = useState(false);

	const { height, width } = Dimensions.get('window');

	const { navigate, reset } = props.navigation;

	async function signInWithGoogleAsync() {
		setLoginError(null);
		setLoginGoogleError(null);
		setLoginFacebookError(null);
		setLoading(true);
		try {
			const result = await Google.logInAsync({
				androidClientId: { ANDROID_CLIENT_ID },
				androidStandaloneAppClientId: {
					ANDROID_STANDALONE_APP_CLIENT_ID
				},
				scopes: ['profile', 'email']
			});

			if (result.type === 'success') {
				await post('/rest-auth/google/', {
					access_token: result.accessToken
				})
					.then(async response => {
						await AsyncStorage.setItem(
							'@shopping_cart:token',
							response.data.token
						);
						setLoading(false);
						reset({ index: 1, routes: [{ name: 'Home' }] });
					})
					.catch(error => {
						console.log(error);
						setLoading(false);
						if (
							error.data &&
							error.data.non_field_errors &&
							error.data.non_field_errorserror[0] &&
							error.data.non_field_errors[0] ===
								'User is already registered with this e-mail address.'
						) {
							setLoginFacebookError(
								'Já existe um utilizador registado com este email. Por favor tente outra forma de autenticação.'
							);
						}
					});
			} else {
				setLoading(false);
				setLoginGoogleError('Autentincação cancelada.');
			}
		} catch (e) {
			console.log(e);
			setLoading(false);
			setLoginGoogleError('Ocorreu um erro durante a autenticação.');
		}
	}

	async function signInWithFacebookAsync() {
		setLoginError(null);
		setLoginGoogleError(null);
		setLoginFacebookError(null);
		setLoading(true);
		try {
			await Facebook.initializeAsync({ FACEBOOK_APP_ID });
			const {
				type,
				token,
				expires,
				permissions,
				declinedPermissions
			} = await Facebook.logInWithReadPermissionsAsync({
				permissions: ['public_profile', 'email']
			});
			await post('/rest-auth/facebook/', { access_token: token })
				.then(async response => {
					await AsyncStorage.setItem(
						'@shopping_cart:token',
						response.data.token
					);
					setLoading(false);
					reset({ index: 1, routes: [{ name: 'Home' }] });
				})
				.catch(error => {
					console.log(error);
					setLoading(false);
					if (
						error.data &&
						error.data.non_field_errors &&
						error.data.non_field_errors[0] &&
						error.data.non_field_errors[0] ===
							'User is already registered with this e-mail address.'
					) {
						setLoginFacebookError(
							'Já existe um utilizador registado com este email. Por favor tente outra forma de autenticação.'
						);
					}
				});
		} catch ({ message }) {
			setLoading(false);
			console.log(message);
			setLoginFacebookError('Ocorreu um erro durante a autenticação');
			// Alert.alert(`Facebook Login Error: ${message}`);
		}
	}

	async function login() {
		setLoginError(null);
		setLoginGoogleError(null);
		setLoginFacebookError(null);
		setLoginPasswordError(null);
		setLoginUsernameError(null);
		setLoading(true);
		await post('/rest-auth/login/', {
			username: username,
			password: password
		})
			.then(async response => {
				await AsyncStorage.setItem(
					'@shopping_cart:token',
					response.data.token
				);
				setLoading(false);
				reset({ index: 1, routes: [{ name: 'Home' }] });
			})
			.catch(error => {
				console.log(error);
				setLoading(false);
				if (
					error.data &&
					error.data.password &&
					error.data.password[0] &&
					(error.data.password[0] === 'Not a valid string.' ||
						error.data.password[0] ===
							'This field may not be blank.')
				) {
					setLoginPasswordError('Este campo é obrigatório.');
				}
				if (
					error.data &&
					error.data.username &&
					error.data.username[0] &&
					(error.data.password[0] === 'Not a valid string.' ||
						error.data.password[0] ===
							'This field may not be blank.')
				) {
					setLoginUsernameError('Este campo é obrigatório.');
				}
				if (
					error.data &&
					error.data.non_field_errors &&
					error.data.non_field_errors[0] &&
					error.data.non_field_errors[0] ===
						'Unable to log in with provided credentials.'
				) {
					setLoginError('Username ou password incorretos!');
				}
			});
	}

	async function getToken() {
		setLoading(false);
		let token = await AsyncStorage.getItem('@shopping_cart:token', null);
		if (token != null) {
			reset({ index: 1, routes: [{ name: 'Home' }] });
		}
		setLoading(false);
		return token;
	}

	useEffect(() => {
		getToken();
	}, []);

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
					<Text style={{ color: '#526b78' }}> Loanding...</Text>
				</View>
			</Modal>
			<View style={styles.container}>
				<Icon
					name='shopping-cart'
					color={'#142850'}
					type='font-awesome'
					iconStyle={{ margin: 10 }}
					size={100}
				/>
				<View
					style={[
						styles.row,
						{ justifyContent: 'center', alignItems: 'center' }
					]}>
					<Text
						style={{
							color: '#142850',
							margin: 10,
							fontSize: 30,
							fontWeight: 'bold',
							textAlign: 'center',
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.8,
							shadowRadius: 2,
							elevation: 5
						}}>
						Shopping Cart
					</Text>
				</View>
				{(loginGoogleError !== null ||
					loginFacebookError !== null ||
					loginError !== null) && (
					<View
						style={[
							styles.row,
							{
								justifyContent: 'center',
								alignItems: 'center'
							}
						]}>
						<Text style={{ color: 'red', textAlign: 'center' }}>
							{loginFacebookError}
						</Text>
						<Text style={{ color: 'red', textAlign: 'center' }}>
							{loginGoogleError}
						</Text>
						<Text style={{ color: 'red', textAlign: 'center' }}>
							{loginError}
						</Text>
					</View>
				)}
				{/* <View style={styles.row}>
					<Input
						placeholder='Username'
						onChangeText={text => {
							setUsername(text);
						}}
						errorMessage={loginUsernameError}
						errorStyle={{ color: 'red' }}
					/>
				</View>
				<View style={styles.row}>
					<Input
						placeholder='Password'
						secureTextEntry={true}
						onChangeText={text => {
							setPassword(text);
						}}
						errorMessage={loginPasswordError}
						errorStyle={{ color: 'red' }}
					/>
				</View>
				<View
					style={[
						styles.row,
						{ marginHorizontal: 0, marginTop: 20 }
					]}>
					<TouchableOpacity
						style={{
							backgroundColor: '#142850',
							height: 50,
							width: (width - 30) / 2,
							borderRadius: 25,
							marginLeft: 10,
							marginRight: 5,
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
							login();
						}}>
						<Icon
							name='sign-in'
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
							Entrar
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={{
							backgroundColor: '#27496d',
							height: 50,
							width: (width - 30) / 2,
							borderRadius: 25,
							marginLeft: 5,
							marginRight: 10,
							marginVertical: 10,
							alignItems: 'center',
							justifyContent: 'center',
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.8,
							shadowRadius: 2,
							elevation: 5,
							flexDirection: 'row'
						}}
						onPress={() => {
							navigate('Register');
						}}>
						<Icon
							name='address-book'
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
							Registar
						</Text>
					</TouchableOpacity>
				</View> */}
				<SocialIcon
					title='Entrar com o Facebook'
					button
					type='facebook'
					onPress={async () => {
						await signInWithFacebookAsync();
					}}
				/>

				{/* <SocialIcon
					title='Entrar com o Google'
					button
					type='google'
					onPress={async () => {
						await signInWithGoogleAsync();
					}}
				/> */}
			</View>
		</SafeAreaView>
	);
}

export default LoginScreen;
