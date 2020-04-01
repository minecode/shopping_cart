import { create } from 'apisauce';

const api = create({
	// baseURL: 'http://192.168.1.68:8000/'
	baseURL: 'https://shoppingcartbackendapi.herokuapp.com/'
});

api.addAsyncResponseTransform(async response => {
	if (!response.ok) {
		throw response;
	}
});

async function post(endpoint, params, token = null) {
	return await api
		.post(endpoint, params, {
			headers: {
				Authorization: token != null ? 'jwt ' + token : ''
			}
		})
		.then(response => {
			return response;
		})
		.catch(error => {
			throw error;
		});
}

async function get(endpoint, params, token = null) {
	return await api
		.get(endpoint, params, {
			headers: {
				Authorization: token != null ? 'jwt ' + token : ''
			}
		})
		.then(response => {
			return response;
		})
		.catch(error => {
			throw error;
		});
}

async function put(endpoint, params, token = null) {
	return await api
		.put(endpoint, params, {
			headers: {
				Authorization: token != null ? 'jwt ' + token : ''
			}
		})
		.then(response => {
			return response;
		})
		.catch(error => {
			throw error;
		});
}

async function remove(endpoint, params, token = null) {
	return await api
		.delete(endpoint, params, {
			headers: {
				Authorization: token != null ? 'jwt ' + token : ''
			}
		})
		.then(response => {
			return response;
		})
		.catch(error => {
			throw error;
		});
}

export { post, get, put, remove };
