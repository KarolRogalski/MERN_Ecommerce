import axios from 'axios'
import React, { useContext, useEffect, useReducer, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Store } from '../Store'
import { getError } from '../utils'

import { Helmet } from 'react-helmet-async'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false }
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.playload }
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true }
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false }
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false }

    default:
      return state
  }
}

export const UserEditScreen = () => {
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  })

  const { state } = useContext(Store)
  const { userInfo } = state

  const params = useParams()
  const { id: userId } = params
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' })
        const { data } = await axios.get(`/api/users/${userId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        })
        setName(data.name)
        setEmail(data.email)
        setIsAdmin(data.isAdmin)
        dispatch({ type: 'FETCH_SUCCESS' })
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) })
      }
    }
    fetchData()
  }, [userId, userInfo])

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      dispatch({ type: 'UPDATE_REQUEST' })
      await axios.put(
        `/api/users/${userId}`,
        { _id: userId, name, email, isAdmin },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      )
      dispatch({ type: 'UPDATE_SUCCESS' })
      toast.success('User updated successfully')
      navigate('/admin/users')
    } catch (err) {
      toast.error(getError(err))
      dispatch({ type: 'UPDATE_FAIL' })
    }
  }

  return (
    <div className='small-container'>
      <Helmet>
        <title>Edit User {userId}</title>
      </Helmet>
      <h1 className='title'>Edit User</h1>
      <h5> {userId}</h5>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant='danger'>{error}</MessageBox>
      ) : (
        <form onSubmit={submitHandler} className='small-container div-bg'>
          <label className='label'>
            <input
              type='name'
              value={name}
              required
              placeholder='e.g. Joe Doe'
              onChange={(e) => setName(e.target.value)}
            />
            <span>Name</span>
            <span className='box-underline'></span>
          </label>
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
              className='mb-2'
              type='checkbox'
              id='isAdmin'
              checked={isAdmin}
              onChange={(e) => setIsAdmin(!isAdmin)}
            />
            <span>Is Admin ?</span>
          </label>

          <div className='mb-2'>
            <button disabled={loadingUpdate} type='submit'>
              Update
            </button>
            {loadingUpdate && <LoadingBox />}
          </div>
        </form>
      )}
    </div>
  )
}
