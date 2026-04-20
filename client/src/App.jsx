import './App.css'
import store from './app/store'
import { BrowserRouter, Routes, Route } from "react-router";
/*
todo elements
Layout
Home
AuthLayout
Login ** OK
Register ** HERE
Error
Missing
features/navbars/Navbar
PersistentLogin
components/formInput
*/

function App() {
  return (
    <>
      <Provider store={store}>
        <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route element={<PersistentLogin></PersistentLogin>}></Route>
              <Route path='/' element={<Layout/>}>
                <Route index element={<Home/>}></Route>

                <Route element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                </Route>

                {/* protected routes valid logged in users. */}
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
