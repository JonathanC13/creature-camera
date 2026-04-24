import './App.css'
import store from './app/store'
import { BrowserRouter, Routes, Route } from "react-router";
import RequireAuth from './components/RequireAuth';
import { ROLES } from './constants/roles'
/*
todo elements
Layout ** OK
AuthLayout **OK
RequireAuth ** OK, check if has token and a roleName, based on role go to /adminHome or /userHome
RoleProtected ** OK, protects nexted routes with role based access control
Login ** OK
Register ** OK
Error
Missing
features/navbars/Navbar ** with ROLES based what appears
PersistentLogin
components/formInput ** OK

adminHome ** OK
userHome ** OK

CameraList ** OK
  CameraItem ** OK
    VideoList ** OK
      VideoItem ** OK
users * get all users ** HERE
usersPage * for specific and edit
cameras * get all cameras
camerasPage * for specific and edit
accountSettings * to edit and toggle settings

forgotPassword page
*/

function App() {
  return (
    <>
      <Provider store={store}>
        <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route element={<PersistentLogin></PersistentLogin>}>
                {/* protected routes valid logged in users. */}
                <Route index element={<RequireAuth />}>
                  
                  <Route path='/' element={<Layout/>}>

                    <Route path="/admin" element={<RoleProtected allowedRoles={[ROLES.ADMIN]} />}>
                      <Route index element={<AdminHome />} />
                      <Route path='/users' element={<Users />}>
                        <Route path=":id" element={<UserPage />}></Route>
                        <Route path="register" element={<RegisterUser />} /> {/* Admin can only register */}
                      </Route>
                      <Route path='/cameras' element={<Cameras />}>
                        <Route path=":id" element={<CameraPage />}></Route>
                        <Route path="register" element={<RegisterCamera />} /> {/* Admin can only register */}
                      </Route>
                    </Route>
                      
                    <Route path="/user" element={<RoleProtected allowedRoles={[ROLES.USER]} />}>
                      <Route index element={<UserHome></UserHome>}></Route>
                    </Route>

                  </Route>
                </Route>

                <Route element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
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
