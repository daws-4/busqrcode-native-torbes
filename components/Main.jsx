import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import {
  useUserContext,
  useBusIdContext,
  useRutaContext,
  useRutaToggleContext,
  useBusIdToggleContext,
  useBusListContext,
  useBusListToggleContext,
  useBusQueueContext,
  useBusQueueToggleContext,
  ConnectionStateContext,
  ConnectionStateToggleContext,
  UrlConnectionContext,
} from "../lib/AuthProvider";
import { Screen } from "./Screen";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { API } from "@env";
import { Link } from "expo-router";
import { DeleteIcon } from "../components/Icons";
import NetInfo from "@react-native-community/netinfo";
export function Main() {
  const user = useUserContext();
  const setRutas = useRutaToggleContext();
  const rutas = useRutaContext();
  const busData = useBusIdContext();
  const setBusData = useBusIdToggleContext();
  const busList = useBusListContext();
  const busQueue = useBusQueueContext();
  const setBusQueue = useBusQueueToggleContext();
  const setBusList = useBusListToggleContext();
  const connection = ConnectionStateContext();
  const url = UrlConnectionContext();
  const setConnection = ConnectionStateToggleContext();
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedRealTime, setSelectedRealTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [getRegistros, setGetRegistros] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [requestQueue, setRequestQueue] = useState([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  const [connectionTest, setConnectionTest] = useState(true);

  //-------------------------- IMPORTANTE -----------------------

  //que el fiscal que marque salida pueda definir la hora a la que debe llegar el bus a determinado punto

  // ----------------      PENDIENTE ----------------------
  const fetchData = async () => {
    setIsLoading(true); // Iniciar carga
    try {
      const data = (await axios.get(`${url}/api/app/rutas`)).data;
      let rutasl = [];
      for (let r of data) {
        for (let f of r.fiscales) {
          if (f.fiscal_id == user?._id) {
            rutasl.push(r);
          }
        }
      }
      const buses = (await axios.get(`${url}/api/app/unidades`)).data;

      fetchRegistros();
      setBusList(buses);
      setRutas(rutasl);
    } catch (error) {
      console.log(error + " error");
    } finally {
      setIsLoading(false); // Finalizar carga
    }
  };
  const fetchRegistros = async () => {
    setIsLoading(true); // Iniciar carga
    const timeout = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("La solicitud tardó demasiado en responder")),
        10000
      )
    );

    try {
      if (user?.sethora) {
        const fetchPromise = axios.post(`${url}/api/app/timestamp/fiscal`, {
          numero_fiscal: user?.numero,
          id_fiscal: user?._id,
        });

        const response = await Promise.race([fetchPromise, timeout]);

        const sortedData = response.data.sort(
          (a, b) => new Date(b.timestamp_salida) - new Date(a.timestamp_salida)
        );
        setGetRegistros(sortedData);
      }
    } catch (error) {
      console.log(error.message + " error");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // función para eliminar los registros de la base de datos

  const deleteRegistro = async (id) => {
    Alert.alert(
      "Alerta",
      "¿Estás seguro de que quieres eliminar este registro?",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancelado"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              const response = await axios.delete(
                `${url}/api/app/timestamp/fiscal/${id}`
              );
              if (response.status === 200) {
                alert("Registro eliminado");
                const newRegistros = getRegistros.filter((r) => r._id !== id);
                setGetRegistros(newRegistros);
              }
            } catch (error) {
              alert("error");
              console.log(error + " error");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  //petición de la cola hacia el servidor

  // arreglar enviar arreglo en vez de individualmente

  //
  const sendQueueRequest = async (request) => {
    try {
      const response = await axios.post(`${url}/api/app/timestamp`, request);

      if (
        response.status === 200 ||
        response.status === 201 ||
        response.status === 202
      ) {
        return { success: true }; // Indicar que la petición se envió correctamente
      }
    } catch (error) {
      console.log(error);
      return { success: false }; // Indicar que la petición no se envió correctamente
    }
  };
  //
  //petición normal hacia el servidor
  const sendRequest = async (request, isQueued = false) => {
    setIsSubmitting(true);
    try {
      const response = await Promise.race([
        axios.post(`${url}/api/app/timestamp`, request),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 20000)
        ),
      ]);

      if (response.status === 201) {
        {
          response.data.delay == 1
            ? alert(`La unidad tiene ${response.data.delay} minuto de retraso`)
            : alert(
                `La unidad tiene ${response.data.delay} minutos de retraso`
              );
        }
        console.log(response.data.delay);
        return true;
      }

      if (response.status === 200) {
        alert("Datos enviados correctamente");
        // setTimeout(() => alert(''), 3000);
        return true; // Indicar que la petición se envió correctamente
      }
      if (response.status == 202) {
        alert("La unidad no tiene ruta asignada");
        return true; // Indicar que la petición se envió correctamente
      }
    } catch (error) {
      console.log(error + " error");
      // setTimeout(() => alert(''), 3000);
      return false; // Indicar que la petición se agregó a la cola
    }
  };

  //
  // función para manejar el envío de datos
  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (user?.sethora == false) {
      if (busData) {
        console.log(busData, selectedRuta, "datos del bus");
        setIsSubmitting(true); // Establecer isSubmitting a true al inicio
        try {
          const now = new Date();
          const year = now.getUTCFullYear();
          const month = String(now.getUTCMonth() + 1).padStart(2, "0");
          const day = String(now.getUTCDate()).padStart(2, "0");
          const hours = String(now.getUTCHours()).padStart(2, "0");
          const minutes = String(now.getUTCMinutes()).padStart(2, "0");
          const seconds = String(now.getUTCSeconds()).padStart(2, "0");
          const milliseconds = String(now.getUTCMilliseconds()).padStart(
            3,
            "0"
          );
          const utcDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;

          const request = {
            id_ruta: selectedRuta,
            id_unidad: busData._id,
            timestamp_telefono: utcDate,
            timestamp_salida: selectedTime,
            id_fiscal: user?._id,
          };

          // Intentar enviar la petición
          // const sent = await sendRequest(request);

          // if (sent) {
          //   setSelectedRuta(null);
          //   setBusData(null);
          // } else {
            // Verificar si el registro ya existe en la cola
            const existsInQueue = busQueue.some(
              (item) =>
                item.id_unidad === request.id_unidad &&
                item.timestamp_salida === request.timestamp_salida
            );

            if (!existsInQueue) {
              // alert("La petición se agregó a la cola");

              setBusQueue([...busQueue, request]);
            }

            setSelectedRuta(null);
            setBusData(null);
          // }
        } finally {
          setIsSubmitting(false); // Establecer isSubmitting a false al final
          fetchRegistros();
        }
      } else {
        alert("Debes seleccionar ruta y autobús");
      }
    } else {
      if (selectedRuta && busData) {
        console.log(busData, selectedRuta, "datos del bus");
        setIsSubmitting(true); // Establecer isSubmitting a true al inicio
        try {
          const now = new Date();
          const year = now.getUTCFullYear();
          const month = String(now.getUTCMonth() + 1).padStart(2, "0");
          const day = String(now.getUTCDate()).padStart(2, "0");
          const hours = String(now.getUTCHours()).padStart(2, "0");
          const minutes = String(now.getUTCMinutes()).padStart(2, "0");
          const seconds = String(now.getUTCSeconds()).padStart(2, "0");
          const milliseconds = String(now.getUTCMilliseconds()).padStart(
            3,
            "0"
          );
          const utcDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;

          const request = {
            id_ruta: selectedRuta,
            id_unidad: busData._id,
            timestamp_telefono: utcDate,
            timestamp_salida: selectedTime,
            id_fiscal: user?._id,
          };

          // Intentar enviar la petición
          // const sent = await sendRequest(request);

          // if (sent) {
          //   setSelectedRuta(null);
          //   setBusData(null);
          // } else {
            // Verificar si el registro ya existe en la cola
            const existsInQueue = busQueue.some(
              (item) =>
                item.id_unidad === request.id_unidad &&
                item.timestamp_salida === request.timestamp_salida
            );

            if (!existsInQueue) {
              // alert("La petición se agregó a la cola");
              setBusQueue([...busQueue, request]);
            }

            setSelectedRuta(null);
            setBusData(null);
          // }
        } finally {
          setIsSubmitting(false); // Establecer isSubmitting a false al final
          fetchRegistros();
        }
      } else {
        alert("Debes seleccionar ruta y autobús");
      }
    }
  };
  //
  // Procesar la cola de peticiones pendientes cada 10 segundos si hay conexión a internet y la cola no está vacía
  useEffect(() => {
    const processQueue = async () => {
        if (showTimePicker || isProcessingQueue || busQueue.length === 0)
          return;
      setIsProcessingQueue(true);

      const updatedQueue = [...busQueue]; // Copia de la cola actual
      const failedRequests = []; // Lista para almacenar las peticiones fallidas

      for (let i = 0; i < updatedQueue.length; i++) {
        const nextRequest = updatedQueue[i];
        const bus = busList.find(
          (b) => b._id === nextRequest.id_unidad
        )?.numero;

        const result = await sendQueueRequest(nextRequest);

        if (result.success) {
          console.log("Se envió la unidad: ", bus);
        } else {
          console.log("Fallo en el envío de la unidad: ", bus);
          failedRequests.push(nextRequest); // Agregar a la lista de fallidos
        }
      }

      // Actualizar la cola con las peticiones fallidas
      setBusQueue(failedRequests);
      setIsProcessingQueue(false);

      if (failedRequests.length === 0) {
          alert("Datos enviados correctamente");
        console.log("Todos los datos de la cola se enviaron correctamente");
      }
    };

    if (busQueue.length > 0 && !isProcessingQueue && !showTimePicker) {
      console.log(busQueue, "datos de la cola", busQueue.length);
      processQueue();
    }
  }, [busQueue, isProcessingQueue]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnection(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, [setConnection]);

  //
  // Función para manejar el cambio de hora
  const onTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || selectedTime;
    setShowTimePicker(false);
    setSelectedTime(currentDate);
    setSelectedRealTime(currentDate);
  };

  const formatDate1 = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const secs = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strHours = String(hours).padStart(2, "0");
    return `${strHours}:${minutes} ${ampm}`;
  };

  return (
    <ScrollView>
      <Screen>
        <View className="flex flex-col items-center justify-center">
          <Text className="text-2xl">Bienvenido Fiscal {user?.numero}</Text>
          <Link asChild href="/scanqr">
            <Pressable className="bg-slate-400 p-2 m-4 rounded">
              <Text className="text-xl font-bold">Escánea el código QR</Text>
            </Pressable>
          </Link>
          {/* {busQueue.length > 0 && (
                <Pressable className="bg-slate-400 p-2 m-4 rounded" onPress={() => processQueue()}>
            <Text className="text-xl font-bold">Enviar Cola</Text>
          </Pressable>
              )} */}

          {/* <Pressable className="bg-slate-400 p-2 m-4 rounded" onPress={() => setConnectionTest(!connectionTest)}>
            <Text className="text-xl font-bold">
              {connection ? 'Conectado' : 'Desconectado'}
            </Text>
          </Pressable> */}
        </View>
        {busData && (
          <View className="mt-6 p-4">
            <Text className="text-black text-black/90 mb-2 mx-4 text-lg">
              <Text className="font-bold text-black">Unidad: </Text>
              {busData.numero}
            </Text>
            {user?.sethora ? (
              <>
                <View className="m-3 bg-slate-200 rounded">
                  <Picker
                    selectedValue={selectedRuta}
                    onValueChange={(itemValue, itemIndex) =>
                      setSelectedRuta(itemValue)
                    }
                  >
                    <Picker.Item
                      key="r._id"
                      label="Selecciona una Ruta"
                      value={null}
                    />
                    {rutas.map((r) => (
                      <Picker.Item key={r._id} label={r.nombre} value={r._id} />
                    ))}
                  </Picker>
                </View>
                <View>
                  <Pressable
                    className="p-3 mt-10 bg-slate-200 rounded items-center justify-center border-slate-800 border-2"
                    onPress={() => setShowTimePicker(true)}
                    title="Seleccionar Hora"
                  >
                    <Text className="text-lg font-bold">Hora de Salida</Text>
                  </Pressable>
                  {showTimePicker && (
                    <DateTimePicker
                      value={selectedTime}
                      mode="time"
                      display="default"
                      onChange={onTimeChange}
                    />
                  )}

                  <View>
                    <Text className="text-base">
                      Hora seleccionada:{" "}
                      {selectedRealTime ? formatDate1(selectedRealTime) : ""}{" "}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              ""
            )}
            {isSubmitting ? (
              <View className="p-3 mt-10 bg-slate-200 rounded items-center justify-center border-slate-800 border-2">
                <Text className="text-lg font-bold">Enviando...</Text>
              </View>
            ) : (
              <Pressable
                onPress={() => handleSubmit()}
                className="p-3 mt-10 bg-slate-200 rounded items-center justify-center border-slate-800 border-2"
              >
                <Text className="text-lg font-bold">Enviar Datos</Text>
              </Pressable>
            )}
          </View>
        )}

        {user?.sethora ? (
          <View className="m-6">
            {isLoading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : getRegistros.length > 0 ? (
              <View className="mt-6 p-4">
                {getRegistros.map((registro) => {
                  const bus = busList.find(
                    (bus) => bus._id === registro.id_unidad
                  );
                  return (
                    <View
                      className="m-4 p-4 bg-slate-200 rounded "
                      key={registro._id}
                    >
                      <View className="flex flex-row justify-between">
                        <Text className="text-black text-black/90 mb-2 mx-4 text-lg">
                          <Text className="font-bold text-black">
                            Control:{" "}
                          </Text>
                          {bus ? bus.numero : "N/A"}
                        </Text>
                        {user.setdelete && (
                          <Pressable
                            onPress={() => deleteRegistro(registro._id)}
                          >
                            <DeleteIcon />
                          </Pressable>
                        )}
                      </View>
                      <Text className="text-black text-black/90 mb-2 mx-4 text-lg">
                        <Text className="font-bold text-black">
                          Hora de salida:{" "}
                        </Text>
                        {formatDate1(registro.timestamp_salida)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text>No hay registros disponibles</Text>
            )}
          </View>
        ) : (
          ""
        )}
      </Screen>
    </ScrollView>
  );
}
