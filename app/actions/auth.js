import Auth0Lock from 'auth0-lock'
import { setFilterRecipes } from './sync'

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGOUT = 'LOGOUT'

// -- Sync --
export const receiveLogin = (user) => {
  return {
    type: LOGIN_SUCCESS,
    id_token: user.id_token,
    name: user.name,
    email: user.email
  }
}

export const logout = () => {
  return {
    type: LOGOUT
  }
}

// -- Async --
export const auth0Login = () => {
  const options = {
    auth: {
      redirectUrl: 'https://thejam-recipes.herokuapp.com/',
//      redirectUrl: 'http://localhost:5000/',
      responseType: 'token',
      params: {
        scope: 'openid email username name'
      }
    },
    theme: {
      logo: 'https://thejam-recipes.herokuapp.com/images/hi_jam.gif'
    },
    languageDictionary: {
      title: 'the Jam',
      passwordInputPlaceholder: 'password',
      userNameInputPlaceholder: 'username'
    }
  },
    lock = new Auth0Lock(process.env.AUTH0_ID, process.env.AUTH0_DOMAIN, options)

  lock.show()
}

export const logoutUser = () => {
  return dispatch => {
    localStorage.removeItem('idToken')
    localStorage.removeItem('profile')

    dispatch(setFilterRecipes('public'))
    dispatch(logout())
    return
  }
}
