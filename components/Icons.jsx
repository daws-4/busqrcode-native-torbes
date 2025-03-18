import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

export const CircleInfoIcon = (props) => (
  <FontAwesome6 name="circle-info" size={24} color="black" {...props} />
);

export const HomeIcon = (props) => (
  <FontAwesome name="home" size={32} color="black" {...props} />
);

export const InfoIcon = (props) => (
  <FontAwesome name="info" size={32} color="black" {...props} />
);

export const ScannerIcon = (props) => (
  <MaterialIcons name="qr-code-scanner" size={32} color="black" {...props} />
)

export const LogoutIcon = (props) => (
  <MaterialIcons name="logout" size={32} color="black" {...props}/>
)

export const FlashOn = (props) => (
   <Ionicons name="flash" size={24} color="black" />
)

export const FlashOff = (props) => (
  <Ionicons name="flash-off" size={24} color="black" />
)