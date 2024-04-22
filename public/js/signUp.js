import axios from 'axios'
import { showAlert } from './alerts'

export const signUp = async (name, email, photo, password, passwordConfirm) => {
	try {
		const res = await axios({
			method: 'POST',
			url: 'http://localhost:8000/api/v1/users/signUp',
			data: {
				name,
				email,
				photo,
				password,
				passwordConfirm,
			},
		})
		if (res.data.status === 'success') {
			showAlert('success', 'You account has been create!')
			window.setTimeout(() => {
				location.assign('/')
			}, 1250)
		}
	} catch (err) {
		showAlert('error', err.response.data.message)
	}
}
