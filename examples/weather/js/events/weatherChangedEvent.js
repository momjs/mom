function weatherChangedEvent(weather) {
   return {
      name: 'WeatherChanged',
      weather: weather
   };
}