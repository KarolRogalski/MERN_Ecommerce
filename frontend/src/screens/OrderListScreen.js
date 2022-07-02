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
      return { ...state, loading: false, orders: action.payload }
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

export const OrderListScreen = () => {
  const navigate = useNavigate()
  const { state } = useContext(Store)
  const { userInfo } = state

  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    })

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' })
        const { data } = await axios.get('/api/orders', {
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

  const deleteHandlerOrder = async (order) => {
    if (window.confirm('Are you sure to delete')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' })
        const { data } = await axios.delete(`/api/orders/${order._id}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        })
        toast.success('order deleted successfully')
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
    const textNo = 'no'
    setSearchTxt(text)
    let tempItems = orders
      .filter(
        (prod) => prod._id.toLowerCase().indexOf(text.toLowerCase()) !== -1
      )
      .concat(
        orders.filter(
          (prod) =>
            prod.user &&
            prod.user.name.toLowerCase().indexOf(text.toLowerCase()) !== -1
        ),
        orders.filter(
          (prod) =>
            prod.createdAt.toLowerCase().indexOf(text.toLowerCase()) !== -1
        ),
        orders.filter((prod) =>
          prod.paidAt
            ? prod.paidAt.toLowerCase().indexOf(text.toLowerCase()) !== -1
            : textNo.toLowerCase().indexOf(text.toLowerCase()) !== -1
        ),
        orders.filter((prod) =>
          prod.deliveredAt
            ? prod.deliveredAt.toLowerCase().indexOf(text.toLowerCase()) !== -1
            : textNo.toLowerCase().indexOf(text.toLowerCase()) !== -1
        ),
        orders.filter(
          (prod) =>
            prod.totalPrice.toString().indexOf(text.toLowerCase()) !== -1
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
        <title>Orders</title>
      </Helmet>
      <h1 className='title'>Orders</h1>
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
                <th>USER</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {searchTxt &&
                filteredItems.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                    <td>{order.createdAt.substring(0, 10)}</td>
                    <td>{order.totalPrice.toFixed(2)}</td>
                    <td>
                      {order.isPaid ? order.paidAt.substring(0, 10) : 'No'}
                    </td>
                    <td>
                      {order.isDelivered
                        ? order.deliveredAt.substring(0, 10)
                        : 'No'}
                    </td>
                    <td>
                      <button
                        type='button'
                        variant='light'
                        onClick={() => {
                          navigate(`/order/${order._id}`)
                        }}
                      >
                        Details
                      </button>
                      &nbsp;
                      <button
                        disabled={loadingDelete}
                        type='button'
                        variant='light'
                        onClick={() => deleteHandlerOrder(order)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              {!searchTxt &&
                orders &&
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                    <td>{order.createdAt.substring(0, 10)}</td>
                    <td>{order.totalPrice.toFixed(2)}</td>
                    <td>
                      {order.isPaid ? order.paidAt.substring(0, 10) : 'No'}
                    </td>
                    <td>
                      {order.isDelivered
                        ? order.deliveredAt.substring(0, 10)
                        : 'No'}
                    </td>
                    <td>
                      <button
                        type='button'
                        variant='light'
                        onClick={() => {
                          navigate(`/order/${order._id}`)
                        }}
                      >
                        Details
                      </button>
                      &nbsp;
                      <button
                        disabled={loadingDelete}
                        type='button'
                        variant='light'
                        onClick={() => deleteHandlerOrder(order)}
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
