import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import ProtectRoute from './ProRoute.jsx'
import LoginSpecial from './LoginRoute.jsx'
import Dashboard from './components/DashBoard.jsx'

function App() {
  return (
    <Router>
      <div className='App'>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet" />


        <Routes>
          <Route path='/' element={
            <LoginSpecial>
              <Login />
            </LoginSpecial>
          } />

          <Route path='*' element={
            <ProtectRoute>
            <div>Page not Found</div>
          </ProtectRoute>
        } />

        <Route path='/dashBoard' element={
          <ProtectRoute>
            <Dashboard />
          </ProtectRoute>
        }
        />

        </Routes>
      </div>

    </Router>

  )
}



export default App
