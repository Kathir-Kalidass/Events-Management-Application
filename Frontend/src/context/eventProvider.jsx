import {useState, useEffect, createContext, useContext} from "react"

const eventContext = createContext();

export const EventProvider = ({children}) => {

  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(()=>{
    const loggedUser = JSON.parse(localStorage.getItem('userInfo'));
    setUser(loggedUser);
  }, [])

  return (
    <eventContext.Provider value={{user, setUser, events, setEvents}}>
      {children}
    </eventContext.Provider>
  )
}

export const eventState = ()=>{
  return useContext(eventContext);
}