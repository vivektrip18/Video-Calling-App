import { Route, Routes, BrowserRouter } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/HomePage'
import { Meeting } from './pages/Meeting'
import {  useState } from 'react'

import { MeetingRoom } from './pages/MeetingRoom'


function App() {
  const [isloggedin, setLoggedin] = useState(false);
  const [username,setUsername] = useState("");

 

  return (
    <>
      <BrowserRouter>        
        <Routes>
          <Route
            path="/"
            element={<HomePage
              setLoggedin={setLoggedin}
              username={username}
              setUsername={setUsername}
            />}
          />

          <Route
            path="/meeting"
            element={
                <Meeting
                username={username} 
                setUsername={setUsername} 
                 />
            }
          />
          <Route
            path="/meeting/:meetingCode"
            element={<MeetingRoom username={username}/>
              }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
