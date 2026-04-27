import './App.css'
import store from './app/store'
import { BrowserRouter, Routes, Route } from "react-router";
import RequireAuth from './components/RequireAuth';
import { ROLES } from './constants/roles'
import ModalManager from './features/modals/ModalManager';
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

videoPlayerModal ** use Portal, OK
CameraList ** OK
  CameraItem ** OK
    VideoList ** OK
      VideoItem ** OK

RegisterUserModel ** use Portal, OK
users * register user button ** OK
  usersTable ** structure of table with get all users table, OK
    usersRow ** row for info, + button to redirect to userPage, OK
userPage ** seperate page. display user info, buttons: update(unlocks some fields) and button changes to [cancel][confirm], assign cameras, and delete(only shows when user role !== 1 || id === self id), ** OK
AssignCameraModule ** since want module as popup, place component under Component 'user', use a assignCameraSlice to hold the visiblity, user id, user's current assigned. ** OK
  **
  cameras = refetch cameras since could be changed from other admins
  refetch button for manual
  for user subsribed camera id, populate right 'assigned' with <id=id>camera Name. below button: remove
  for left cameras with removed already subscribed. below button: add
  multi-select in boxes

  on submit. camera Id Array generated and send to updateUser. storeSlice also updated -> cause rerender.
  **

cameras ** with button to register new camera and get all cameras  ** OK
registerCamera  ** OK
  camerasTable ** structure for camera info  ** OK
    cameraRow ** + button for redirect to cameraPage  ** OK
camerasPage * for edit, delete  ** OK

accountSettings * to edit and toggle settings ** Todo

forgot password process ** TODO

*/

function App() {
  return (
    <>
      <Provider store={store}>
        <BrowserRouter>
          <ModalManager />
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
                    </Route>
                    <Route path='/cameras' element={<Cameras />}>
                      <Route path=":id" element={<CameraPage />}></Route>
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
