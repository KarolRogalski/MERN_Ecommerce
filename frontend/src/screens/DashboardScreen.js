import axios from 'axios'
import React, { useContext, useEffect, useReducer } from 'react'
import Chart from 'react-google-charts'
import { Helmet } from 'react-helmet-async'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { Store } from '../Store'
import { getError } from '../utils'

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, summary: action.payload }
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.playload }
    default:
      return state
  }
}

export const DashboardScreen = () => {
  const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  })

  const { state } = useContext(Store)
  const { userInfo } = state

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' })
      try {
        const { data } = await axios.get('/api/orders/summary', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        })
        dispatch({ type: 'FETCH_SUCCESS', payload: data })
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) })
      }
    }
    fetchData()
  }, [userInfo])

  return (
    <div>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <h1>Dashboard</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant='danger'>{error}</MessageBox>
      ) : (
        <>
          <div className='row'>
            <div className='dashboard-stats div-bg'>
              <h5>Users</h5>
              <h5>
                {summary
                  ? summary.users && summary.users[0]
                    ? summary.users[0].numUsers
                    : 0
                  : 'data not found'}
              </h5>
            </div>
            <div className='dashboard-stats div-bg'>
              <h5>Orders</h5>
              <h5>
                {summary
                  ? summary.orders && summary.users[0]
                    ? summary.orders[0].numOrders
                    : 0
                  : 'data not found'}
              </h5>
            </div>
            <div className='dashboard-stats div-bg'>
              <h5>Total</h5>
              <h5>
                {' '}
                £
                {summary
                  ? summary.orders && summary.users[0]
                    ? summary.orders[0].totalSales.toFixed(2)
                    : 0
                  : 'data not found'}
              </h5>
            </div>
          </div>
          <div className='my-3'>
            <h2>Sales</h2>
            {summary.dailyOrders.length === 0 ? (
              <MessageBox>No Sales</MessageBox>
            ) : (
              <Chart
                className='chart div-bg'
                width='100%'
                height='400px'
                chartType='AreaChart'
                loader={<div>Loading Chart...</div>}
                data={[
                  ['Date', 'Sales'],
                  ...summary.dailyOrders
                    .sort((a, b) => (a._id > b._id ? 1 : -1))
                    .map((x) => [x._id, x.sales]),
                ]}
                options={{
                  colors: ['#83ff24'],
                  backgroundColor: {
                    fill: '#212529',
                    fillOpacity: 0.1,
                  },
                  legendTextStyle: { color: '#ff6224' },
                  hAxis: {
                    textStyle: { color: '#ff6224' },
                  },
                  vAxis: {
                    textStyle: { color: '#ff6224' },
                  },
                }}
              ></Chart>
            )}
          </div>
          <div className='my-3'>
            <h2>Categories</h2>
            {summary.productCategories.length === 0 ? (
              <MessageBox>No Category</MessageBox>
            ) : (
              <Chart
                className='chart div-bg'
                width='100%'
                height='400px'
                chartType='PieChart'
                loader={<div>Loading Chart...</div>}
                data={[
                  ['Category', 'Products'],
                  ...summary.productCategories
                    .sort((a, b) => (a._id > b._id ? 1 : -1))
                    .map((x) => [x._id, x.count]),
                ]}
                options={{
                  backgroundColor: {
                    fill: '#212529',
                    fillOpacity: 0.1,
                  },
                  legendTextStyle: { color: '#ff6224' },
                  hAxis: {
                    textStyle: { color: '#ff6224' },
                  },
                  vAxis: {
                    textStyle: { color: '#ff6224' },
                  },
                }}
              ></Chart>
            )}
          </div>
        </>
      )}
    </div>
  )
}
