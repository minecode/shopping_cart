import React, { useState, useEffect } from 'react';
import {
	View,
	TouchableOpacity,
	Text,
	Dimensions,
	AsyncStorage
} from 'react-native';
import styles from '../../style';
import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';
import { SocialIcon, Input, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
	ANDROID_CLIENT_ID,
	ANDROID_STANDALONE_APP_CLIENT_ID,
	FACEBOOK_APP_ID
} from 'react-native-dotenv';

function RegisterScreen(props) {
	const [loginGoogleError, setLoginGoogleError] = useState(null);
	const [loginFacebookError, setLoginFacebookError] = useState(null);

	const { height, width } = Dimensions.get('window');

	const { navigate, reset } = props.navigation;

	async function signInWithGoogleAsync() {
		setLoginGoogleError(null);
		setLoginFacebookError(null);
		try {
			const result = await Google.logInAsync({
				androidClientId: { ANDROID_CLIENT_ID },
				androidStandaloneAppClientId: {
					ANDROID_STANDALONE_APP_CLIENT_ID
				},
				scopes: ['profile', 'email']
			});

			if (result.type === 'success') {
				post('/rest-auth/google/', {}, (token = token)).then(
					async response => {
						await AsyncStorage.setItem(
							'@shopping_cart:token',
							response.data.token
						);
					}
				);
			} else {
				setLoginGoogleError('Autentincação cancelada.');
			}
		} catch (e) {
			setLoginGoogleError('Ocorreu um erro durante a autenticação.');
		}
	}

	async function signInWithFacebookAsync() {
		setLoginGoogleError(null);
		setLoginFacebookError(null);
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
			post('/rest-auth/facebook/', {}, (token = token)).then(
				async response => {
					await AsyncStorage.setItem(
						'@shopping_cart:token',
						response.data.token
					);
				}
			);
		} catch ({ message }) {
			setLoginFacebookError('Ocorreu um erro durante a autenticação');
			// Alert.alert(`Facebook Login Error: ${message}`);
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#f3f3f3' }}>
			<View style={styles.container}>
				{(loginGoogleError !== null || loginFacebookError !== null) && (
					<View
						style={[
							styles.row,
							{ justifyContent: 'center', alignItems: 'center' }
						]}>
						<Text style={{ color: 'red' }}>
							{loginFacebookError}
						</Text>
						<Text style={{ color: 'red' }}>{loginGoogleError}</Text>
					</View>
				)}
				<View style={styles.row}>
					<Input placeholder='Username' />
				</View>
				<View style={styles.row}>
					<Input placeholder='Email' />
				</View>
				<View style={styles.row}>
					<Input placeholder='Password' secureTextEntry={true} />
				</View>
				<View style={styles.row}>
					<Input
						placeholder='Confirmar password'
						secureTextEntry={true}
					/>
				</View>
				{/* <View
					style={[
						styles.row,
						{ marginHorizontal: 0, marginTop: 20 }
					]}>
					<TouchableOpacity
						style={{
							backgroundColor: '#27496d',
							height: 50,
							width: width - 20,
							borderRadius: 25,
							margin: 10,
							alignItems: 'center',
							justifyContent: 'center',
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.8,
							shadowRadius: 2,
							elevation: 5,
							flexDirection: 'row'
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
							Registar
						</Text>
					</TouchableOpacity>
				</View> */}
				<SocialIcon
					title='Registar com o Facebook'
					button
					type='facebook'
					onPress={async () => {
						await signInWithFacebookAsync();
					}}
				/>
				<SocialIcon
					title='Registar com o Google'
					button
					type='google'
					onPress={async () => {
						await signInWithGoogleAsync();
					}}
				/>
			</View>
		</SafeAreaView>
	);
}

export default RegisterScreen;
