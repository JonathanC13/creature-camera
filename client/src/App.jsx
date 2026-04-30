import './App.css'
import { Provider } from 'react-redux';
import store from './app/store'
import { BrowserRouter, Routes, Route } from "react-router";
import { ROLES } from './constants/roles'
import ModalManager from './features/modals/ModalManager';
import PersistentLogin from './components/PersistentLogin'
import RequireAuth from './components/RequireAuth';
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

function App() {
  return (
    <>
      <Provider store={store}>
        <BrowserRouter>
          <ModalManager />
          <Routes>
            {/* Public */}
            <Route element={<PersistentLogin></PersistentLogin>}>
              <Route path='/' element={<Layout/>}>
                {/* protected routes valid logged in users. */}
                <Route element={<RequireAuth />}>

                    {/* <Route path="/admin" element={<RoleProtected allowedRoles={[ROLES.ADMIN]} />}>
                      <Route index element={<AdminHome />} />
                      <Route path='users' element={<Users />}>
                        <Route path=":id" element={<UserPage />}></Route>
                      </Route>
                      <Route path='cameras' element={<Cameras />}>
                        <Route path=":id" element={<CameraPage />}></Route>
                      </Route>
                    </Route> */}
                      
                    {/* <Route path="/user" element={<RoleProtected allowedRoles={[ROLES.USER]} />}>
                      <Route index element={<UserHome></UserHome>}></Route>
                    </Route> */}

                    {/* <Route path="/settings" element={<AccountSettings></AccountSettings>}/> */}

                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/forgotPassword" element={<ForgotPassword />} />
              </Route>
            
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
