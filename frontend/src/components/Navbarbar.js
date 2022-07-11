import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Store } from '../Store'
import { FilterMenu } from './FilterMenu'
import { Searchbox } from './Searchbox'

export const Navbarbar = () => {
  const { state, dispatch: ctxDispatch } = useContext(Store)
  const { cart, userInfo, filterMenuIsOpen, mobileMenuIsOpen } = state

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' })
    localStorage.removeItem('userInfo')
    localStorage.removeItem('shippingAddress')
    localStorage.removeItem('paymentMethod')
    window.location.href = '/signin'
  }

  const filterMenuHandler = () => {
    ctxDispatch({ type: 'FILTER_MENU', payload: !filterMenuIsOpen })
    if (mobileMenuIsOpen) {
      ctxDispatch({ type: 'MOBILE_MENU', payload: false })
    }
  }
  const mobileMenuHandler = () => {
    ctxDispatch({ type: 'MOBILE_MENU', payload: !mobileMenuIsOpen })
    if (filterMenuIsOpen) {
      ctxDispatch({ type: 'FILTER_MENU', payload: false })
    }
  }
  const mobileMenuHideHandler = () => {
    ctxDispatch({ type: 'MOBILE_MENU', payload: false })
  }

  return (
    <div className='navbar div-bg'>
      <div className='navbar-row'>
        <button className='nav-filter-btn btn-icon' onClick={filterMenuHandler}>
          <i className='fas fa-bars'></i>
        </button>
        {filterMenuIsOpen ? <FilterMenu show='show' /> : <FilterMenu />}
        <Link to='/'>
          <div className='sign'>
            <span className='fast-flicker'>B</span>uy
            <span className='flicker'>B</span>ug
          </div>
        </Link>
        <div className='nav-search'>
          <Searchbox />
        </div>
        <div className='nav-right-panel'>
          <Link to='/cart' className='cart'>
            Cart
            {cart.cartItems.length > 0 && (
              <span className='cart-items-number-2'>
                <span>
                  {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                </span>
              </span>
            )}
          </Link>
          <div className='mobile-menu-btn' onClick={mobileMenuHandler}>
            <i className='fa fa-user'></i>
          </div>
          <div
            className={
              mobileMenuIsOpen ? 'mobile-menu show-mobile-menu' : 'mobile-menu'
            }
          >
            {!userInfo ? (
              <Link className='signin' to='/signin'>
                <i className='fa fa-user'></i>
              </Link>
            ) : (
              <div className='menu-item'>
                <span>{userInfo.name}</span>

                <ul className='drop-menu'>
                  <li
                    onClick={mobileMenuHideHandler}
                    className='drop-menu-item'
                  >
                    <Link to='/profile'>User {'\xa0'}Profile</Link>
                  </li>

                  <li
                    onClick={mobileMenuHideHandler}
                    className='drop-menu-item'
                  >
                    <Link to='/orderhistory'>Order{'\xa0'}History</Link>
                  </li>
                  <li
                    onClick={mobileMenuHideHandler}
                    className='drop-menu-item'
                  >
                    <Link to='#signout' onClick={signoutHandler}>
                      Sign Out
                    </Link>
                  </li>
                </ul>
              </div>
            )}
            {userInfo && userInfo.isAdmin && (
              <div className='menu-item'>
                <span>Admin</span>
                <ul className='drop-menu'>
                  <li
                    onClick={mobileMenuHideHandler}
                    className='drop-menu-item'
                  >
                    <Link to='/admin/dashboard'>Dashboard</Link>
                  </li>
                  <li
                    onClick={mobileMenuHideHandler}
                    className='drop-menu-item'
                  >
                    <Link to='/admin/products'>Products</Link>
                  </li>
                  <li
                    onClick={mobileMenuHideHandler}
                    className='drop-menu-item'
                  >
                    <Link to='/admin/orders'>Orders</Link>
                  </li>
                  <li
                    onClick={mobileMenuHideHandler}
                    className='drop-menu-item'
                  >
                    <Link to='/admin/users'>Users</Link>
                  </li>
                  <li
                    onClick={mobileMenuHideHandler}
                    className='drop-menu-item'
                  >
                    <Link to='/admin/support'>Support</Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
