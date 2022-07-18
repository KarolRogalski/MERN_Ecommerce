import { useEffect, useReducer } from 'react'
import axios from 'axios'

import Product from '../components/Product'
import { Helmet } from 'react-helmet-async'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { useLocation, useNavigate } from 'react-router-dom'
// import data from '../data'

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      }
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

function HomeScreen() {
  const navigate = useNavigate()
  const [{ loading, error, products, pages }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: '',
  })
  const { search } = useLocation()
  const sp = new URLSearchParams(search)
  const page = sp.get('page') || 1
  console.log(page)

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' })
      try {
        const result = await axios.get(`/api/products?page=${page}`)
        console.log(result)
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data })
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message })
      }
    }
    fetchData()
  }, [page])

  return (
    <div>
      <Helmet>
        <title>BuyBug</title>
      </Helmet>
      <h1 className='title'> Featured Products</h1>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant='danger'>{error}</MessageBox>
      ) : (
        <>
          <div className='products'>
            {products.map((product) => (
              <Product key={product._id} product={product}></Product>
            ))}
          </div>
          <div className='pages-count'>
            {[...Array(pages).keys()].map((x) => (
              <button
                key={x + 1}
                className={Number(page) === x + 1 ? 'active mx-1' : 'mx-1'}
                onClick={() => navigate(`/?page=${Number(x) + 1}`)}
              >
                {x + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
export default HomeScreen
