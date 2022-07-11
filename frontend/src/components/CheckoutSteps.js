import React from 'react'

export default function CheckoutSteps(props) {
  return (
    <div className='checkout-steps row'>
      <div className={props.step1 ? 'checkout-step-active' : ''}>Sing-In</div>
      <div className={props.step2 ? 'checkout-step-active' : ''}>Shipping</div>
      <div className={props.step3 ? 'checkout-step-active' : ''}>Payment</div>
      <div className={props.step4 ? 'checkout-step-active' : ''}>
        Place Order
      </div>
    </div>
  )
}
