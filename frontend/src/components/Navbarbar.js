import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Store } from '../Store'
import { FilterMenu } from './FilterMenu'
import { Searchbox } from './Searchbox'

export const Navbarbar = () => {
  const { state, dispatch: ctxDispatch } = useContext(Store)
  const { cart, userInfo, filerMenuIsOpen } = state

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' })
    localStorage.removeItem('userInfo')
    localStorage.removeItem('shippingAddress')
    localStorage.removeItem('paymentMethod')
    window.location.href = '/signin'
  }

  const filterMenuHandler = () => {
    ctxDispatch({ type: 'FILTER_MENU', payload: !filerMenuIsOpen })
  }
  return (
    <div className='navbar div-bg'>
      <div className='navbar-row'>
        <button className='nav-filter-btn btn-icon' onClick={filterMenuHandler}>
          <i className='fas fa-bars'></i>
        </button>
        {filerMenuIsOpen ? <FilterMenu show='show' /> : <FilterMenu />}
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
          <div className='mobile-menu-btn'>
            <i class='fa fa-user'></i>

            <div className='mobile-menu'>
              {!userInfo ? (
                <Link className='signin' to='/signin'>
                  <i class='fa fa-user'></i>
                </Link>
              ) : (
                <div className='menu-item'>
                  <span>{userInfo.name}</span>

                  <ul className='drop-menu'>
                    <li className='drop-menu-item'>
                      <Link to='/profile'>User {'\xa0'}Profile</Link>
                    </li>

                    <li className='drop-menu-item'>
                      <Link to='/orderhistory'>Order{'\xa0'}History</Link>
                    </li>
                    <li className='drop-menu-item'>
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
                    <li className='drop-menu-item'>
                      <Link to='/admin/dashboard'>Dashboard</Link>
                    </li>
                    <li className='drop-menu-item'>
                      <Link to='/admin/products'>Products</Link>
                    </li>
                    <li className='drop-menu-item'>
                      <Link to='/admin/orders'>Orders</Link>
                    </li>
                    <li className='drop-menu-item'>
                      <Link to='/admin/users'>Users</Link>
                    </li>
                    <li className='drop-menu-item'>
                      <Link to='/admin/support'>Support</Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
