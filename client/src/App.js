import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import SignUp from "./components/signup";
import {RequireToken} from './components/Auth.js'
 
import Dashboard from "./components/dashboard";
import Home from "./components/home";
import Employee from "./components/employee";
import Profile from "./components/profile";
import AddEmployee from "./components/addemployee";
import EditEmployee from './components/editemployee'
 
function App() {
  return (
    <div className="app">
        <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
               
              <Route path='/' element={
                  <RequireToken>
                    <Dashboard />
                  </RequireToken>
                  }>
                  <Route path='' element={<Home />}></Route>
                  <Route path='/employee' element={<Employee />}></Route>
                  <Route path='/profile' element={<Profile />}></Route>
                  <Route path='/create' element={<AddEmployee />}></Route>
                  <Route path='/employeeedit/:id' element={<EditEmployee />}></Route>
              </Route>
            </Routes>
        </BrowserRouter>
    </div>
  );
}
   
export default App;