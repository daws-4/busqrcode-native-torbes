import { router } from "expo-router";
import React, { useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
const UrlConnection = React.createContext();
const linea = React.createContext();

export function lineaContext() {
  return useContext(linea);
}

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

export function UrlConnectionContext() {
  return useContext(UrlConnection);
}

export function UserProvider(props) {
  const [user, setUser] = useState(null);
  const [rutas, setRutas] = useState([]);
  const [busId, setBusId] = useState(null);
  const [busList, setBusList] = useState([]);
  const [busQueue, setBusQueue] = useState([]);
  const [connectionState, setConnectionState] = useState(false);
  const UrlCon = "https://busqrcode-torbes.vercel.app";
  const line = 'Línea Torbes Barrios'

  useEffect(() => {
    // Cargar el estado del usuario desde AsyncStorage al iniciar
    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        const storedBusList = await AsyncStorage.getItem("busList");
        if (storedBusList) {
          setBusList(JSON.parse(storedBusList));
        }
        const storedBusQueue = await AsyncStorage.getItem("busQueue");
        if (storedBusQueue) {
          setBusQueue(JSON.parse(storedBusQueue));
        }
        const storedRutas = await AsyncStorage.getItem("rutas");
        if (storedRutas) {
          setRutas(JSON.parse(storedRutas));
        }
        const storedBusId = await AsyncStorage.getItem("busId");
        if (storedBusId) {
          setBusId(JSON.parse(storedBusId));
        }
      } catch (error) {
        console.error("Error loading data from AsyncStorage:", error);
      }
    };

    loadData();
  }, []);

  const saveData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to AsyncStorage:`, error);
    }
  };

  const Login = async (data) => {
    setUser(data);
    await saveData("user", data);
  };
  const Logout = async () => {
    setUser(null);
    setBusId(null);
    setBusQueue([]);
    try {
      await AsyncStorage.removeItem("user"); // Eliminar el usuario de AsyncStorage al cerrar sesión
      await AsyncStorage.removeItem("busList");
      await AsyncStorage.removeItem("busQueue");
      await AsyncStorage.removeItem("rutas");
      await AsyncStorage.removeItem("busId");
    } catch (error) {
      console.error("Error removing data from AsyncStorage:", error);
    }
    router.push("/");
  };
  const ruta = async (data) => {
    setRutas(data);
    await saveData("rutas", data);
  };
  const bus = async (data) => {
    setBusId(data);
    await saveData("busId", data);
  };

  const busLi = async (data) => {
    setBusList(data);
    await saveData("busList", data);
  };
  const busQue = async (data) => {
    setBusQueue(data);
    await saveData("busQueue", data);
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
                            <ConnectionStateToggle.Provider
                              value={setConnectionState}
                            >
                              <UrlConnection.Provider value={UrlCon}>
                                <linea.Provider value={line}>
                                  {props.children}
                                </linea.Provider>
                              </UrlConnection.Provider>
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
