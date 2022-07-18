import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import HomeScreen from './screens/HomeScreen'
import ProductScreen from './screens/ProductScreen'
import { Store } from './Store'
import { useContext, useEffect, useState } from 'react'
import CartScreen from './screens/CartScreen'
import SigninScreen from './screens/SigninScreen'
import ShippingAddressScreen from './screens/ShippingAddressScreen'
import SignupScreen from './screens/SignupScreen'
import { PaymentMethodScreen } from './screens/PaymentMethodScreen'
import { PlaceOrderScreen } from './screens/PlaceOrderScreen'
import { OrderScreen } from './screens/OrderScreen'
import { OrderHistoryScreen } from './screens/OrderHistoryScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { getError } from './utils'
import axios from 'axios'
import { SearchScreen } from './screens/SearchScreen'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardScreen } from './screens/DashboardScreen'
import { AdminRoute } from './components/AdminRoute'
import { ProductListScreen } from './screens/ProductListScreen'
import { ProductEditScreen } from './screens/ProductEditScreen'
import { OrderListScreen } from './screens/OrderListScreen'
import { UserListScreen } from './screens/UserListScreen'
import { UserEditScreen } from './screens/UserEditScreen'
import { ChatBox } from './components/ChatBox'
import SupportScreen from './screens/SupportScreen'
import './css/style.css'
import { Navbarbar } from './components/Navbarbar'

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store)
  const { userInfo } = state

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`)
        ctxDispatch({ type: 'SET_CATEGORIES', payload: data })
      } catch (err) {
        toast.error(getError(err))
      }
    }
    fetchCategories()
  }, [])

  return (
    <BrowserRouter>
      <ToastContainer position='bottom-center' limit={1} />
      <header>
        <Navbarbar />
      </header>
      <div className='main-app-container'>
        <Routes>
          <Route path='product/:slug' element={<ProductScreen />} />
          <Route path='/cart' element={<CartScreen />} />
          <Route path='/search' element={<SearchScreen />} />
          <Route path='/signin' element={<SigninScreen />} />
          <Route path='/signup' element={<SignupScreen />} />
          <Route
            path='/profile'
            element={
              <ProtectedRoute>
                <ProfileScreen />
              </ProtectedRoute>
            }
          />
          <Route path='/shipping' element={<ShippingAddressScreen />} />
          <Route path='/payment' element={<PaymentMethodScreen />} />
          <Route path='/placeorder' element={<PlaceOrderScreen />} />
          <Route
            path='/order/:id'
            element={
              <ProtectedRoute>
                <OrderScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path='/orderhistory'
            element={
              <ProtectedRoute>
                <OrderHistoryScreen />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes*/}
          <Route
            path='admin/dashboard'
            element={
              <AdminRoute>
                <DashboardScreen />
              </AdminRoute>
            }
          />
          <Route
            path='admin/products'
            element={
              <AdminRoute>
                <ProductListScreen />
              </AdminRoute>
            }
          />
          <Route
            path='admin/product/:id'
            element={
              <AdminRoute>
                <ProductEditScreen />
              </AdminRoute>
            }
          />
          <Route
            path='admin/orders'
            element={
              <AdminRoute>
                <OrderListScreen />
              </AdminRoute>
            }
          />
          <Route
            path='admin/users'
            element={
              <AdminRoute>
                <UserListScreen />
              </AdminRoute>
            }
          />
          <Route
            path='admin/user/:id'
            element={
              <AdminRoute>
                <UserEditScreen />
              </AdminRoute>
            }
          />
          <Route
            path='admin/support'
            element={
              <AdminRoute>
                <SupportScreen />
              </AdminRoute>
            }
          />
          <Route path='/' element={<HomeScreen />} />
        </Routes>
      </div>
      <footer>
        {userInfo && !userInfo.isAdmin && <ChatBox userInfo={userInfo} />}
        <div className='footer'>
          Copyright © 2022 Karol{'\xa0'}Rogalski. All{'\xa0'}rights{'\xa0'}
          reserved
        </div>
      </footer>
    </BrowserRouter>
  )
}

export default App
