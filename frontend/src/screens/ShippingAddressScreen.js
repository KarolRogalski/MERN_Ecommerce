import React, { useContext, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'

import { Store } from '../Store'
import { useNavigate } from 'react-router-dom'
import CheckoutSteps from '../components/CheckoutSteps'

export default function ShippingAddressScreen() {
  const navigate = useNavigate()
  const { state, dispatch: ctxDispatch } = useContext(Store)
  const {
    userInfo,
    cart: { shippingAddress },
  } = state

  const [fullName, setFullName] = useState(shippingAddress.fullName || '')
  const [address, setAddress] = useState(shippingAddress.address || '')
  const [city, setCity] = useState(shippingAddress.city || '')
  const [postCode, setPostCode] = useState(shippingAddress.postCode || '')
  const [country, setCountry] = useState(shippingAddress.country || '')

  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/shipping')
    }
  }, [userInfo, navigate])

  const submitHandler = (e) => {
    e.preventDefault()
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        city,
        postCode,
        country,
      },
    })
    localStorage.setItem(
      'shippingAddress',
      JSON.stringify({
        fullName,
        address,
        city,
        postCode,
        country,
      })
    )
    navigate('/payment')
  }
  return (
    <div>
      <Helmet>
        <title>Shipping Address</title>
      </Helmet>
      <CheckoutSteps step1 step2></CheckoutSteps>
      <div className='container small-container'>
        <h1 className='title'>Shipping Address</h1>
        <form className='div-bg' onSubmit={submitHandler}>
          <label className='label'>
            <input
              type='text'
              value={fullName}
              required
              placeholder='e.g. Joe Dow'
              onChange={(e) => setFullName(e.target.value)}
            />
            <span>Full Name</span>
            <span className='box-underline'></span>
          </label>
          <label className='label'>
            <input
              type='text'
              value={address}
              required
              placeholder='e.g. 1 London Road'
              onChange={(e) => setAddress(e.target.value)}
            />
            <span>Address</span>
            <span className='box-underline'></span>
          </label>
          <label className='label'>
            <input
              type='text'
              value={city}
              required
              placeholder='e.g. London'
              onChange={(e) => setCity(e.target.value)}
            />
            <span>City</span>
            <span className='box-underline'></span>
          </label>
          <label className='label'>
            <input
              type='text'
              value={postCode}
              required
              placeholder='e.g. SE1 6LN'
              onChange={(e) => setPostCode(e.target.value)}
            />
            <span>Postcode</span>
            <span className='box-underline'></span>
          </label>
          <label className='label'>
            <input
              type='text'
              value={country}
              required
              placeholder='e.g. UK'
              onChange={(e) => setCountry(e.target.value)}
            />
            <span>Country</span>
            <span className='box-underline'></span>
          </label>
          <div className='mb-2'>
            <button variant='primary' type='submit'>
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
