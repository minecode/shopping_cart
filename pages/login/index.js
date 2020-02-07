import React from 'react';
import { View, TouchableOpacity, Text, Dimensions, Alert } from 'react-native';
import styles from '../../style';
import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';
import { SocialIcon, Input, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

function LoginScreen(props) {
	async function signInWithGoogleAsync() {
		try {
			const result = await Google.logInAsync({
				androidClientId:
					'671373496683-7riatae571tq5m6d30gduh2auqkprh9r.apps.googleusercontent.com',
				scopes: ['profile', 'email']
			});

			if (result.type === 'success') {
				Alert.alert(result.accessToken);
				return result.accessToken;
			} else {
				Alert.alert('cancelled');
				return { cancelled: true };
			}
		} catch (e) {
			Alert.alert('Error', e);
			return { error: true };
		}
	}

	async function signInWithFacebookAsync() {
		try {
			await Facebook.initializeAsync('555184831743487');
			const {
				type,
				token,
				expires,
				permissions,
				declinedPermissions
			} = await Facebook.logInWithReadPermissionsAsync({
				permissions: ['public_profile']
			});
			Alert.alert(type, token, expires, permissions, declinedPermissions);

			// if (type === 'success') {
			// 	// Get the user's name using Facebook's Graph API
			// 	const response = await fetch(
			// 		`https://graph.facebook.com/me?access_token=${token}`
			//      Alert.alert('Logged in!', `Hi ${(await response.json()).name}!`);
			// 	);
			// } else {
			// 	// type === 'cancel'
			// }
		} catch ({ message }) {
			Alert.alert(`Facebook Login Error: ${message}`);
		}
	}

	const { height, width } = Dimensions.get('window');

	const { navigate, reset } = props.navigation;

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#f3f3f3' }}>
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
				<View style={styles.row}>
					<Input placeholder='Username' />
				</View>
				<View style={styles.row}>
					<Input placeholder='Password' secureTextEntry={true} />
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
						onPress={() => {
							reset({ index: 1, routes: [{ name: 'Home' }] });
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
				</View>
				<SocialIcon
					title='Entrar com o Facebook'
					button
					type='facebook'
					onPress={async () => {
						await signInWithFacebookAsync();
					}}
				/>

				<SocialIcon
					title='Entrar com o Google'
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

export default LoginScreen;
