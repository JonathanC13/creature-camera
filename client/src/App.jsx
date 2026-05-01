import './App.css'
import { Provider } from 'react-redux';
import store from './app/store'
import { BrowserRouter, Routes, Route } from "react-router";
import { ROLES } from './constants/roles'
import ModalManager from './features/modals/ModalManager';
import PersistentLogin from './components/PersistentLogin'
import RequireAuth from './components/RequireAuth';
import Landing from './components/Landing';
import Layout from './components/Layout'
import RoleProtected from './components/RoleProtected'
import AdminHome from './features/admin/adminHome'
import Users from './features/users/Users'
import UserPage from './features/users/UserPage'
import Cameras from './features/cameras/Cameras'
import CameraPage from './features/cameras/CameraPage'
import UserHome from './features/user/userHome'
import AccountSettings from './features/auth/AccountSettings'
import Login from './features/auth/Login'
import ForgotPassword from './features/auth/ForgotPassword';
import Error from './features/error/Error'
import Missing from './components/Missing'
import Unauthorized from './components/Unauthorized'
import HomeRedirect from './components/HomeRedirect'
import DashboardRedirect from './components/DashboardRedirect';

function App() {
  return (
    <>
      <Provider store={store}>
        <BrowserRouter>
          <ModalManager />
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomeRedirect />} />
            <Route element={<Landing></Landing>}>
              <Route path="/login" element={<Login />} />
              <Route path="/forgotPassword" element={<ForgotPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
            </Route>

            <Route element={<PersistentLogin></PersistentLogin>}>
              
              {/* protected routes valid logged in users. */}
              <Route element={<RequireAuth />}>
                <Route element={<Layout></Layout>}>
                  <Route path='/dashboard' element={<DashboardRedirect />}></Route>

                  <Route path="/admin" element={<RoleProtected allowedRoles={[ROLES.ADMIN]} />}>
                    <Route index element={<AdminHome />}></Route>
                  </Route>

                  <Route element={<RoleProtected allowedRoles={[ROLES.ADMIN]} />}>
                    <Route path='/users'>
                      <Route index element={<Users />}></Route>
                      <Route path=":id" element={<UserPage />}></Route>
                    </Route>
                    <Route path='/cameras'>
                      <Route index element={<Cameras />}></Route>
                      <Route path=":id" element={<CameraPage />}></Route>
                    </Route>
                    
                  </Route>
                    
                  <Route path="/user" element={<RoleProtected allowedRoles={[ROLES.USER]} />}>
                    <Route index element={<UserHome></UserHome>}></Route>
                  </Route>
                </Route>
              </Route>
                
              <Route path="/settings" element={<AccountSettings></AccountSettings>}/>
                
            </Route>

            <Route path='/error' element={<Error/>}></Route>

            {/* catach all */}
            <Route path='*' element={<Missing/>}></Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </>
  )
}

export default App
