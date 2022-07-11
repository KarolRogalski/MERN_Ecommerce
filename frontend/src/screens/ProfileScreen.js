import axios from 'axios'
import React, { useContext, useReducer, useState } from 'react'

import { Helmet } from 'react-helmet-async'
import { toast } from 'react-toastify'
import { Store } from '../Store'
import { getError } from '../utils'

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true }
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false }
    case 'UPDATE_FAIL':
      return { ...state, loading: false }

    default:
      return state
  }
}

export const ProfileScreen = () => {
  const { state, dispatch: ctxDispatch } = useContext(Store)
  const { userInfo } = state
  const [name, setName] = useState(userInfo.name)
  const [email, setEmail] = useState(userInfo.email)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  })

  const submitHandler = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      setConfirmPassword('')
      setPassword('')
      return
    }
    try {
      dispatch({ type: 'UPDATE_REQUESR' })
      const { data } = await axios.put(
        '/api/users/profile',
        {
          name,
          email,
          password,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      )
      dispatch({ type: 'UPDATE_SUCCESS' })
      ctxDispatch({ type: 'USER_SIGNIN', payload: data })
      localStorage.setItem('userInfo', JSON.stringify(data))
      toast.success('User updated successfully')
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL' })
      toast.error(getError(err))
    }
  }
  return (
    <div className='container smal-container'>
      <Helmet>
        <title>User Profile</title>
      </Helmet>
      <h1 className='my-3'>User Profile</h1>
      <form onSubmit={submitHandler} className='div-bg'>
        <label className='label'>
          <input
            value={name}
            required
            type='text'
            placeholder='e.g. Joe Dow'
            onChange={(e) => setName(e.target.value)}
          />
          <span>Name</span>
          <span className='box-underline'></span>
        </label>
        <label className='label'>
          <input
            value={email}
            required
            type='email'
            placeholder='e.g. joedow@gemail.com'
            onChange={(e) => setEmail(e.target.value)}
          />
          <span>Email</span>
          <span className='box-underline'></span>
        </label>
        <label className='label'>
          <input
            value={password}
            required
            type='password'
            placeholder='e.g. my-secret-password'
            onChange={(e) => setPassword(e.target.value)}
          />
          <span>Pasword</span>
          <span className='box-underline'></span>
        </label>
        <label className='label'>
          <input
            value={confirmPassword}
            required
            type='password'
            placeholder='e.g. my-secret-password'
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span>Confirm Pasword</span>
          <span className='box-underline'></span>
        </label>
        <button type='submit'>Update</button>
      </form>
      {/* <form onSubmit={submitHandler}>
        <Form.Group className='mb-2' controlId='name'>
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className='mb-2' controlId='email'>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className='mb-2' controlId='password'>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group className='mb-2' controlId='confirmPassword'>
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        <div className='mb-2'>
          <button type='submit'>Update</button>
        </div>
      </form> */}
    </div>
  )
}
