import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Helmet } from 'react-helmet-async'
import Axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { Store } from '../Store'
import { toast } from 'react-toastify'
import { getError } from '../utils'

export default function SigninScreen() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const redirectInUrl = new URLSearchParams(search).get('redirect')
  const redirect = redirectInUrl ? redirectInUrl : '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { state, dispatch: ctxDispatch } = useContext(Store)
  const { userInfo } = state
  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      const { data } = await Axios.post('/api/users/signin', {
        email,
        password,
      })
      ctxDispatch({ type: 'USER_SIGNIN', payload: data })
      localStorage.setItem('userInfo', JSON.stringify(data))
      navigate(redirect || '/')
    } catch (err) {
      toast.error(getError(err))
    }
  }

  useEffect(() => {
    if (userInfo) {
      navigate(redirect)
    }
  }, [navigate, redirect, userInfo])

  return (
    <div className='small-container'>
      <Helmet>
        <title>Sign In</title>
      </Helmet>
      <h1 className='title'> Sign-In</h1>

      <form onSubmit={submitHandler} className='small-container div-bg'>
        <label className='label'>
          <input
            type='email'
            value={email}
            required
            placeholder='e.g. joedoe@email.com'
            onChange={(e) => setEmail(e.target.value)}
          />
          <span>Email</span>
          <span className='box-underline'></span>
        </label>
        <label className='label'>
          <input
            type='password'
            value={password}
            required
            placeholder='e.g. my_secret_password'
            onChange={(e) => setPassword(e.target.value)}
          />
          <span>Password</span>
          <span className='box-underline'></span>
        </label>

        <div className='mb-2'>
          <button type='submit'>Sign In</button>
        </div>
        <div className='mb-2'>
          New customer?{' '}
          <Link to={`/signup?redirect=${redirect}`}>
            <ins>Create your account</ins>
          </Link>
        </div>
      </form>
    </div>
  )
}
