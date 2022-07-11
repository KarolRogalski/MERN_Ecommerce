import { useContext } from 'react'
import { Store } from '../Store'
import { Helmet } from 'react-helmet-async'
import MessageBox from '../components/MessageBox'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function CartScreen() {
  const navigate = useNavigate()
  const { state, dispatch: ctxDispatch } = useContext(Store)
  const {
    cart: { cartItems },
  } = state

  const updateCartHandler = async (item, quantity) => {
    const { data } = await axios.get(`/api/products/${item._id}`)
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock')
      return
    }

    ctxDispatch({ type: 'CART_ADD_ITEM', payload: { ...item, quantity } })
  }

  const removeItemHandler = (item) => {
    ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item })
  }

  const checkoutHandler = () => {
    navigate('/signin?redirect=/shipping')
  }
  return (
    <>
      <Helmet>
        <title>Shopping Cart</title>
      </Helmet>
      <h1 className='title'>Shopping Cart</h1>
      <div className='cart-row'>
        <div className='cart-col-items'>
          {cartItems.length === 0 ? (
            <MessageBox variant='danger'>
              Cart is empty.{' '}
              <Link to='/'>
                <ins>Go Shopping</ins>
              </Link>
            </MessageBox>
          ) : (
            <>
              {cartItems.map((item) => (
                <>
                  <div className='cart-row-item' key={item._id}>
                    <div className='item-img'>
                      {' '}
                      <Link to={`/product/${item.slug}`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='img-fluid img-thumbnail'
                        ></img>
                      </Link>
                    </div>
                    <div className='item-name'>
                      <Link to={`/product/${item.slug}`}>{item.name}</Link>
                    </div>
                    <div className='item-quantity'>
                      <button
                        className='btn-icon'
                        onClick={() =>
                          updateCartHandler(item, item.quantity - 1)
                        }
                        disabled={item.quantity === 1}
                      >
                        <i className='fas fa-minus-circle'></i>
                      </button>{' '}
                      <span>{item.quantity}</span>{' '}
                      <button
                        className='btn-icon'
                        onClick={() =>
                          updateCartHandler(item, item.quantity + 1)
                        }
                        disabled={item.quantity === item.countInStock}
                      >
                        <i className='fas fa-plus-circle'></i>
                      </button>
                    </div>

                    <div className='item-price'>£{item.price}</div>
                    <div className='item-delete'>
                      <button
                        className='btn-icon'
                        onClick={() => removeItemHandler(item)}
                        variant='light'
                      >
                        <i className='fas fa-trash'></i>
                      </button>
                    </div>
                  </div>
                  <hr />
                </>
              ))}
            </>
          )}
        </div>
        <div className='shoping-cart-right-summary'>
          <h3>
            Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}
            {'\xa0'}
            items): £{cartItems.reduce((a, c) => a + c.price * c.quantity, 0)}
          </h3>
          <hr />
          <button onClick={checkoutHandler} disabled={cartItems.length === 0}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  )
}
