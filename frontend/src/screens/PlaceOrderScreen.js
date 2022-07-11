import React, { useContext, useEffect, useReducer } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'

import { toast } from 'react-toastify'
import { getError } from '../utils'
import { Store } from '../Store'
import CheckoutSteps from '../components/CheckoutSteps'
import Axios from 'axios'
import LoadingBox from '../components/LoadingBox'

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true }
    case 'CREATE_SUCCESS':
      return { ...state, loading: false }
    case 'CREATE_FAIL':
      return { ...state, loading: false }

    default:
      return state
  }
}

export const PlaceOrderScreen = () => {
  const navigate = useNavigate()
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  })
  const { state, dispatch: ctxDispatch } = useContext(Store)
  const { userInfo, cart } = state

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  )
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10)
  cart.taxPrice = round2(0.15 * cart.itemsPrice)
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' })
      const { data } = await Axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      )
      ctxDispatch({ type: 'CART_CLEAR' })
      dispatch({ type: 'CREATE_SUCCESS' })
      localStorage.removeItem('cartItems')
      navigate(`/order/${data.order._id}`)
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' })
      toast.error(getError(err))
    }
  }

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('payment')
    }
  }, [cart, navigate])
  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      <h1 className='title'>Preview Order</h1>
      <div className='order-details-row'>
        <div className='order-details'>
          <div className='order-shipping div-bg'>
            <h5>Shipping</h5>
            <p>
              <strong>Name: </strong>
              {` ${cart.shippingAddress.fullName}`}
              <br />
              <strong>Address:</strong>
              {` ${cart.shippingAddress.address}, ${cart.shippingAddress.city}, ${cart.shippingAddress.postCode}, ${cart.shippingAddress.country}`}
            </p>
            <Link to='/shipping'>
              <ins>Edit</ins>
            </Link>
          </div>

          <div className='order-shipping div-bg'>
            <h5>Payment</h5>
            <p>
              <strong>Method:</strong> {`${cart.paymentMethod}`}
            </p>
            <Link to='/payment'>
              <ins>Edit</ins>
            </Link>
          </div>
        </div>

        <div className='order-summary col-4 div-bg'>
          <h5>Order Summary</h5>
          <div className='row'>
            <div className='col-5'>Item</div>
            <div className='col-5'>£{cart.itemsPrice.toFixed(2)}</div>
          </div>
          <div className='row'>
            <div className='col-5'>Shipping</div>
            <div className='col-5'>£{cart.shippingPrice.toFixed(2)}</div>
          </div>
          <div className='row'>
            <div className='col-5'>Tax</div>
            <div className='col-5'>£{cart.taxPrice.toFixed(2)}</div>
          </div>
          <div className='row'>
            <div className='col-5'>
              <strong>Order Total</strong>
            </div>
            <div className='col-5'>
              <strong>£{cart.totalPrice.toFixed(2)}</strong>
            </div>
          </div>
          <div className='d-grid'>
            <button
              type='button'
              onClick={placeOrderHandler}
              disabled={cart.cartItems.length === 0}
            >
              Place Order
            </button>
            {loading && <LoadingBox></LoadingBox>}
          </div>
        </div>
      </div>
      <div className='order-list-items div-bg'>
        <h5>Items</h5>
        <Link to='/cart'>
          <ins>Edit Cart</ins>
        </Link>
        {cart.cartItems.map((item) => (
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
            <div className='col-2'>
              <span>£{item.price}</span>
            </div>
            {/* <hr /> */}
          </div>
        ))}
      </div>
    </div>
  )
}
