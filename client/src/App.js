import React, { useEffect, useState } from "react"
import io from "socket.io-client"
import "./App.css"

function App() {
  const [users,setUsers] = useState([])
  useEffect(
    () => {
      const socket = io.connect("http://localhost:5000")
      const newUserConnected = (user) => {
        const userName = user || `User${Math.floor(Math.random() * 1000000)}`;
        socket.emit("new user", userName);
      };
      newUserConnected();
      socket.on("new user", (data) => {
        console.log(data, "jfi");
        setUsers(data)
      });
    },
    []
  )


  return (
    <div className="card">
      <div className="render-chat">
        <h1>Chat Log</h1>
        {users.map(user=>{
          return <h5>{user}</h5>
        })}
      </div>
    </div>
  )
}

export default App