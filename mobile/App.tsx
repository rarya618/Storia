import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

export default function App() {
  const [loaded] = useFonts({
    'NotoSans-Regular': require('./assets/fonts/NotoSans-Regular.ttf'),
  });

  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  
  if (!loaded) {
    return null;
  }

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}
