import axios from 'axios'
import React, { useContext, useReducer } from 'react'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { Store } from '../Store'
import { getError } from '../utils'

import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' }
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.playload }
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true }
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true }
    case 'PAY_FAIL':
      return { ...state, loadingPay: false }
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false }
    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true }
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true }
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false }
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      }
    default:
      return state
  }
}

export const OrderScreen = () => {
  const { state } = useContext(Store)
  const { userInfo } = state

  const params = useParams()
  const { id: orderId } = params
  const navigate = useNavigate()

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
    successPay: false,
    loadingPay: false,
  })

  const [{ options, isPending }, paypalDispatch] = usePayPalScriptReducer()

  function createOrder(data, action) {
    return action.order
      .create({
        purchase_units: [
          {
            amount: {
              value: order.totalPrice,
            },
          },
        ],
      })
      .then((orderId) => {
        return orderId
      })
  }

  function onApprove(data, action) {
    return action.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' })
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          { headers: { authorization: `Bearer ${userInfo.token}` } }
        )
        dispatch({ type: 'PAY_SUCCESS', payload: data })
        toast.success('order is paid')
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', payload: getError(err) })
        toast.error(getError(err))
      }
    })
  }

  function onError(err) {
    toast.error(getError(err))
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' })
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        })
        dispatch({ type: 'FETCH_SUCCESS', payload: data })
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) })
      }
    }
    if (!userInfo) {
      return navigate('/login')
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder()
      if (successPay) {
        dispatch({ type: 'PAY_RESET' })
      }
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' })
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        })
        paypalDispatch({
          type: 'resetOptions',
          value: {
            ...options,
            'client-id': clientId,
            currency: 'GBP',
          },
        })
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' })
      }
      loadPaypalScript()
    }
  }, [
    order,
    userInfo,
    orderId,
    navigate,
    paypalDispatch,
    successPay,
    successDeliver,
  ])

  const deliverOrderHandler = async () => {
    try {
      dispatch({ type: 'DELIVER_REQUEST' })
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      )
      dispatch({ type: 'DELIVER_SUCCESS', payload: data })
      toast.success('Order is delivered')
    } catch (err) {
      toast.error(getError(err))
      dispatch({ type: 'DELIVER_FAIL' })
    }
  }
  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant='danger'>{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>
      <h1 className='title'>Order: </h1>
      <h5>{orderId}</h5>
      <div className='order-details-row'>
        <div className='order-details'>
          <div className='order-shipping div-bg'>
            <h5>Shipping</h5>
            <p>
              <strong>Name:</strong> {order.shippingAddress.fullName}
              <br />
              <strong>Address:</strong> {order.shippingAddress.address},{' '}
              {order.shippingAddress.city}, {order.shippingAddress.postCode},{' '}
              {order.shippingAddress.country}
            </p>
            {order.isDelivered ? (
              <MessageBox variant='success'>
                Delivered at {order.deliveredAt.substring(0, 10)}{' '}
                {order.deliveredAt.substring(11, 16)}
              </MessageBox>
            ) : (
              <MessageBox variant='danger'>Not Delivered</MessageBox>
            )}
          </div>
          <div className='order-shipping div-bg'>
            <h5>Payment</h5>
            <p>
              <strong>Method:</strong> {order.paymentMethod}
            </p>
            {order.isPaid ? (
              <MessageBox variant='success'>
                Paid at {order.paidAt.substring(0, 10)}{' '}
                {order.paidAt.substring(11, 16)}
              </MessageBox>
            ) : (
              <MessageBox variant='danger'>Not Paid</MessageBox>
            )}
          </div>
        </div>
        <div className='order-summary col-4 div-bg'>
          <h5>Order Summary</h5>
          <div className='row'>
            <div className='col-5'>Item</div>
            <div className='col-5'>£{order.itemsPrice.toFixed(2)}</div>
          </div>
          <div className='row'>
            <div className='col-5'>Shipping</div>
            <div className='col-5'>£{order.shippingPrice.toFixed(2)}</div>
          </div>
          <div className='row'>
            <div className='col-5'>Tax</div>
            <div className='col-5'>£{order.taxPrice.toFixed(2)}</div>
          </div>
          <div className='row'>
            <div className='col-5'>
              <strong>Order Total</strong>
            </div>
            <div className='col-5'>
              <strong>£{order.totalPrice.toFixed(2)}</strong>
            </div>
          </div>
          <hr />
          {!order.isPaid && (
            <div className='d-grid'>
              {isPending ? (
                <LoadingBox />
              ) : (
                <div>
                  <PayPalButtons
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                  ></PayPalButtons>
                </div>
              )}
              {loadingPay && <LoadingBox />}
            </div>
          )}
          {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
            <div className='row'>
              {loadingDeliver && <LoadingBox />}
              <div className='d-grid'>
                <button type='button' onClick={deliverOrderHandler}>
                  Deliver Order
                </button>
              </div>
            </div>
          )}
        </div>

        <div className='order-list-items div-bg'>
          <h5>Items</h5>

          {order.orderItems.map((item) => (
            <div className='order-row' key={item._id}>
              <div className='col-5'>
                <Link to={`/product/${item.slug}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className='img-fluid rounded img-thumbnail'
                  ></img>
                </Link>
              </div>
              <div className='item-name col-3'>
                <Link to={`/product/${item.slug}`}>{item.name}</Link>
              </div>
              <div className='col-2'>
                <span>{item.quantity}</span>
              </div>
              <div className='col-2' mb='3'>
                £{item.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
