import axios from 'axios'
import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ListGroup from 'react-bootstrap/ListGroup'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import { Helmet } from 'react-helmet-async'
import Rating from '../components/Rating'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { getError } from '../utils'
import { Store } from '../Store'
import { toast } from 'react-toastify'

const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PRODUCT':
      return { ...state, product: action.payload }
    case 'CREATE_REQUEST':
      return { ...state, loadingCreateReview: true }
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreateReview: false }
    case 'CREATE_FAIL':
      return { ...state, loadingCreateReview: false }
    case 'FETCH_REQUEST':
      return { ...state, loading: true }
    case 'FETCH_SUCCESS':
      return { ...state, product: action.payload, loading: false }
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

function ProductScreen() {
  let reviewRef = useRef()
  const navigate = useNavigate()
  const params = useParams()
  const { slug } = params

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [selectedImage, setSelectedImage] = useState('')

  const [{ loading, error, product, loadingCreateReview }, dispatch] =
    useReducer(reducer, {
      product: [],
      loading: true,
      error: '',
    })

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' })
      try {
        const result = await axios.get(`/api/products/slug/${slug}`)
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data })
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) })
      }
    }
    fetchData()
  }, [slug])

  const { state, dispatch: ctxDispatch } = useContext(Store)
  const { cart, userInfo } = state
  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id)
    const quantity = existItem ? existItem.quantity + 1 : 1
    const { data } = await axios.get(`/api/products/${product._id}`)
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock')
      return
    }

    ctxDispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } })
    navigate('/cart')
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    if (!comment || !rating) {
      toast.error('Please enter comment and rating')
      return
    }
    try {
      dispatch({ type: 'CREATE_REQUEST' })
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment, name: userInfo.name },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      )
      dispatch({ type: 'CREATE_SUCCESS' })
      toast.success('review submitted successfully')
      product.reviews.unshift(data.review)
      product.numReviews = data.numReviews
      product.rating = data.rating
      dispatch({ type: 'REFRESH_PRODUCT', payload: product })
      window.scrollTo({ behavior: 'smooth', top: reviewRef.current.offsetTop })
    } catch (err) {
      toast.error(getError(err))
      dispatch({ type: 'CREATE_FAIL' })
    }
  }

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant='danger'>{error}</MessageBox>
  ) : (
    <div className='product-bg'>
      <div className='product-main'>
        <div className='product-images'>
          <img
            className='product-img-large'
            src={selectedImage || product.image}
            alt={product.name}
          ></img>
          <div className='product-img-small'>
            {[product.image, ...product.images].map((x) => (
              <img
                key={x}
                className='img-thumbnail'
                src={x}
                alt={product.name}
                onClick={() => setSelectedImage(x)}
              ></img>
            ))}
          </div>
        </div>
        <div className='product-details'>
          <h1>{product.name}</h1>
          <Rating
            rating={product.rating}
            numReviews={product.numReviews}
          ></Rating>
          <h2>
            £{product.price}
            {product.countInStock > 0 ? (
              <span className='product-stock success'>
                <strong>In&nbsp;Stock</strong>
              </span>
            ) : (
              <span className='product-stock danger'>
                <strong>Unavailable</strong>
              </span>
            )}
          </h2>
          <hr />
          <p>{product.description} </p>
          <button onClick={addToCartHandler} variant='primary'>
            Add To Cart
          </button>
        </div>
      </div>

      <div className='product-reviews'>
        <h2 ref={reviewRef}>Reviews</h2>

        {product.reviews.length === 0 && (
          <MessageBox>There is no review</MessageBox>
        )}
        <div className='reviews-wrap'>
          {product.reviews.map((review, index) => (
            <div className='single-review' key={review._id}>
              <strong>{review.name}</strong>
              <Rating rating={review.rating} caption=' '></Rating>
              <p>{review.createdAt.substring(0, 10)}</p>
              <p>{review.comment}</p>
              <hr
                className={
                  product.reviews.length - 1 === index
                    ? 'display-none'
                    : 'display-block'
                }
              />
            </div>
          ))}
        </div>
        {userInfo ? (
          <form onSubmit={submitHandler}>
            <h2>Write a customer review</h2>

            <label for='rating'>Rating</label>
            <select
              id='rating'
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value=''>Select...</option>
              <option value='1'>1-Poor</option>
              <option value='2'>2- Fair</option>
              <option value='3'>3- Good</option>
              <option value='4'>4- Very Good</option>
              <option value='5'>5- Excelent</option>
            </select>
            <label for='comment'>Comments</label>
            <textarea
              type='text'
              id='comment'
              placeholder='Leave a comment here'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
            <button disabled={loadingCreateReview} type='submit'>
              Submit
            </button>
          </form>
        ) : (
          <MessageBox>
            Please{' '}
            <Link to={`/signin?redirect=/product/${product.slug}`}>
              Sign In
            </Link>{' '}
            to write a review
          </MessageBox>
        )}
      </div>
    </div>
  )
}

export default ProductScreen
