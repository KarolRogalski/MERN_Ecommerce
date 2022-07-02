import axios from 'axios'
import React, { useContext, useEffect, useReducer, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { Store } from '../Store'
import { getError } from '../utils'

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, users: action.payload }
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.playload }
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false }
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true }
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false }
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false }

    default:
      return state
  }
}

export const UserListScreen = () => {
  const navigate = useNavigate()
  const [{ loading, error, users, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    })

  const { state } = useContext(Store)
  const { userInfo } = state

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' })
        const { data } = await axios.get('/api/users', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        })
        dispatch({ type: 'FETCH_SUCCESS', payload: data })
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) })
      }
    }
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' })
    } else {
      fetchData()
    }
  }, [userInfo, successDelete])

  const deleteHandler = async (user) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' })
        await axios.delete(`/api/users/${user._id}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        })
        toast.success('User deleted successful')
        dispatch({ type: 'DELETE_SUCCESS' })
      } catch (err) {
        toast.error(getError(err))
        dispatch({ type: 'DELETE_FAIL' })
      }
    }
  }
  const [filteredItems, setFilteredItems] = useState([])
  const [searchTxt, setSearchTxt] = useState('')
  const searchHandler = (text) => {
    const textAdmin = 'admin yes'
    setSearchTxt(text)
    let tempItems = users
      .filter(
        (prod) => prod.name.toLowerCase().indexOf(text.toLowerCase()) !== -1
      )
      .concat(
        users.filter(
          (prod) =>
            prod.isAdmin &&
            textAdmin.toLowerCase().indexOf(text.toLowerCase()) !== -1
        ),
        users.filter(
          (prod) => prod.email.toLowerCase().indexOf(text.toLowerCase()) !== -1
        ),
        users.filter(
          (prod) => prod._id.toLowerCase().indexOf(text.toLowerCase()) !== -1
        )
      )
      .reduce((accumulator, current) => {
        if (!accumulator.find(({ _id }) => _id === current._id)) {
          accumulator.push(current)
        }
        return accumulator
      }, [])
    setFilteredItems(tempItems)
  }
  return (
    <div>
      <Helmet>
        <title>Users</title>
      </Helmet>
      <h1 className='title'>Users</h1>
      <div className='product-search-row div-bg'>
        <label className='label'>
          <input
            type='text'
            placeholder='e.g. spider'
            onChange={(e) => searchHandler(e.target.value)}
          />
          <span>Search</span>
          <span className='box-underline'></span>
          <i className='search-icon fas fa-search'></i>
        </label>
      </div>
      {loadingDelete && <LoadingBox />}
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant='danger'>{error}</MessageBox>
      ) : (
        <div className='table-wrap'>
          <table className='table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>IS ADMIN</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {searchTxt &&
                filteredItems.map((user) => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.isAdmin ? 'YES' : 'NO'}</td>
                    <td>
                      <button
                        type='button'
                        variant='light'
                        onClick={() => navigate(`/admin/user/${user._id}`)}
                      >
                        Edit
                      </button>
                      &nbsp;
                      <button
                        disabled={loadingDelete}
                        type='button'
                        variant='light'
                        onClick={() => deleteHandler(user)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              {users &&
                !searchTxt &&
                users.map((user) => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.isAdmin ? 'YES' : 'NO'}</td>
                    <td>
                      <button
                        type='button'
                        variant='light'
                        onClick={() => navigate(`/admin/user/${user._id}`)}
                      >
                        Edit
                      </button>
                      &nbsp;
                      <button
                        disabled={loadingDelete}
                        type='button'
                        variant='light'
                        onClick={() => deleteHandler(user)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
