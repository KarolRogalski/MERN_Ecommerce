import axios from 'axios'
import React, { useContext, useEffect, useReducer, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
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

    default:
      return state
  }
}

export const OrderHistoryScreen = () => {
  const { state } = useContext(Store)
  const { userInfo } = state
  const navigate = useNavigate()

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' })
      try {
        const { data } = await axios.get('/api/orders/mine', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        })
        dispatch({ type: 'FETCH_SUCCESS', payload: data })
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) })
      }
    }
    fetchData()
  }, [userInfo])

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
        <title>Order History</title>
      </Helmet>
      <h1 className='title'>Order History</h1>
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
      <div className='table-wrap'>
        {loading ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant='danger'>{error}</MessageBox>
        ) : (
          <table className='table'>
            <thead>
              <tr>
                <th>ID</th>
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
                    <td>{order.createdAt.substring(0, 10)}</td>
                    <td>{order.totalPrice}</td>
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
                    </td>
                  </tr>
                ))}
              {!searchTxt &&
                orders &&
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.createdAt.substring(0, 10)}</td>
                    <td>{order.totalPrice}</td>
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
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
