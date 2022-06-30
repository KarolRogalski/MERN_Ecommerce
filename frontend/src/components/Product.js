import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import Rating from './Rating'
import axios from 'axios'
import { Store } from '../Store'

function Product(props) {
  const { product } = props
  const { state, dispatch: ctxDispatch } = useContext(Store)
  const {
    cart: { cartItems },
  } = state

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id)
    const quantity = existItem ? existItem.quantity + 1 : 1
    const { data } = await axios.get(`/api/products/${item._id}`)
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock')
      return
    }

    ctxDispatch({ type: 'CART_ADD_ITEM', payload: { ...item, quantity } })
  }

  return (
    <div className='product-card'>
      <Link to={`/product/${product.slug}`}>
        <div className='img-wrap'>
          <img
            src={product.image}
            className='card-img-top'
            alt={product.name}
          />
        </div>
      </Link>
      <div className='product-card-details'>
        <Link to={`/product/${product.slug}`}>
          <h5>{product.name}</h5>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <p>£{product.price}</p>
        {product.countInStock === 0 ? (
          <button disabled>Out of Stock</button>
        ) : (
          <button onClick={() => addToCartHandler(product)}>
            Add{'\xa0'}to{'\xa0'}cart
          </button>
        )}
      </div>
    </div>
  )
}

export default Product
