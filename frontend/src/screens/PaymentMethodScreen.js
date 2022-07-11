import React, { useContext, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import CheckoutSteps from '../components/CheckoutSteps'
import { Store } from '../Store'
import { useNavigate } from 'react-router-dom'

export const PaymentMethodScreen = () => {
  const navigate = useNavigate()
  const { state, dispatch: ctxDispatch } = useContext(Store)
  const {
    cart: { shippingAddress, paymentMethod },
  } = state

  const [paymentMethodName, setPaymentMethodName] = useState(
    paymentMethod || 'PayPal'
  )

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping')
    }
  }, [shippingAddress, navigate])

  const submitHandler = (e) => {
    e.preventDefault()
    ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName })
    localStorage.setItem('paymentMethod', paymentMethodName)
    navigate('/placeorder')
  }

  return (
    <div>
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <div className='container small-container'>
        <Helmet>
          <title>Payment Method</title>
        </Helmet>
        <h1 className='title'>Payment Method</h1>
        <form className='div-bg' onSubmit={submitHandler}>
          <ul className='form-check-list'>
            <li className='form-check-row'>
              <input
                type='radio'
                id='paypal'
                name='Paypal'
                value='paypal'
                checked={paymentMethodName === 'PayPal'}
                onChange={(e) => setPaymentMethodName(e.target.value)}
              />
              <label htmlFor='paypal'>Paypal</label>
            </li>
            <li className='form-check-row'>
              <input
                type='radio'
                id='Stripe'
                name='Stripe'
                value='Stripe'
                checked={paymentMethodName === 'Stripe'}
                onChange={(e) => setPaymentMethodName(e.target.value)}
              />
              <label htmlFor='Stripe'>Stripe</label>
            </li>
          </ul>
          <div className='mb-2'>
            <button type='submit'>Continue</button>
          </div>
        </form>
      </div>
    </div>
  )
}
