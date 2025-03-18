import { router } from "expo-router";
import React, { useState, useContext } from "react";

const userContext = React.createContext();
const userToggleContext = React.createContext();
const userLogoutContext = React.createContext();
const rutaContext = React.createContext();
const rutaToggleContext = React.createContext();
const busIdContext = React.createContext();
const busIdToggleContext = React.createContext();
const BusListContext = React.createContext();
const BusListToggleContext = React.createContext();
const BusQueueContext = React.createContext();
const BusQueueToggleContext = React.createContext();
const ConnectionState = React.createContext();
const ConnectionStateToggle = React.createContext();

export function useRutaContext() {
  return useContext(rutaContext);
}

export function useRutaToggleContext() {
  return useContext(rutaToggleContext);
}

export function useUserContext() {
  return useContext(userContext);
}

export function useUserToggleContext() {
  return useContext(userToggleContext);
}

export function useUserLogoutContext() {
  return useContext(userLogoutContext);
}
export function useBusIdContext() {
  return useContext(busIdContext);
}
export function useBusIdToggleContext() {
  return useContext(busIdToggleContext);
}

export function useBusListContext() {
  return useContext(BusListContext);
}

export function useBusListToggleContext() {
  return useContext(BusListToggleContext);
}

export function useBusQueueContext() {
  return useContext(BusQueueContext);
}
export function useBusQueueToggleContext() {
  return useContext(BusQueueToggleContext);
}

export function ConnectionStateContext() {
  return useContext(ConnectionState);
}
export function ConnectionStateToggleContext() {
  return useContext(ConnectionStateToggle);
}

export function UserProvider(props) {
  const [user, setUser] = useState(null);
  const [rutas, setRutas] = useState([]);
  const [busId, setBusId] = useState(null);
  const [busList, setBusList] = useState([]);
  const [busQueue, setBusQueue] = useState([]);
  const [connectionState, setConnectionState] = useState(false);

  const Login = (data) => {
    setUser(data);
  };
  const Logout = () => {
    setUser(null);
    setBusId(null);
    router.push("/");
  };
  const ruta = (data) => {
    setRutas(data);
  };
  const bus = (data) => {
    setBusId(data);
  };

  const busLi = (data) => {
    setBusList(data);
  };
  const busQue = (data) => {
    setBusQueue(data);
  };
  return (
    <userContext.Provider value={user}>
      <userToggleContext.Provider value={Login}>
        <userLogoutContext.Provider value={Logout}>
          <BusListContext.Provider value={busList}>
            <BusListToggleContext.Provider value={busLi}>
              <rutaContext.Provider value={rutas}>
                <rutaToggleContext.Provider value={ruta}>
                  <busIdContext.Provider value={busId}>
                    <busIdToggleContext.Provider value={bus}>
                      <BusQueueContext.Provider value={busQueue}>
                        <BusQueueToggleContext.Provider value={busQue}>
                          <ConnectionState.Provider value={connectionState}>
                            <ConnectionStateToggle.Provider value={setConnectionState}>
                              {props.children}
                            </ConnectionStateToggle.Provider>
                          </ConnectionState.Provider>
                        </BusQueueToggleContext.Provider>
                      </BusQueueContext.Provider>
                    </busIdToggleContext.Provider>
                  </busIdContext.Provider>
                </rutaToggleContext.Provider>
              </rutaContext.Provider>
            </BusListToggleContext.Provider>
          </BusListContext.Provider>
        </userLogoutContext.Provider>
      </userToggleContext.Provider>
    </userContext.Provider>
  );
}
