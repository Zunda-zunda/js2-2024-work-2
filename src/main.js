async function getWeather() {
  const city = document.getElementById('cityInput').value.trim();
  const apiKey = '06ee01deb2a373de827e600ee025ba6c'; // OpenWeather APIキーをここに入力してください
  const geoApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
  const weatherInfo = document.getElementById('weatherInfo');

  // 都市名が入力されていない場合の処理
  if (!city) {
      weatherInfo.innerHTML = `<p class="error">都市名を入力してください。</p>`;
      return;
  }

  try {
      // 1. 緯度・経度を取得
      const geoResponse = await fetch(geoApiUrl);
      if (!geoResponse.ok) {
          throw new Error('都市が見つかりません');
      }
      const geoData = await geoResponse.json();
      if (geoData.length === 0) {
          throw new Error('指定された都市が見つかりません');
      }

      const { lat, lon } = geoData[0];

      // 2. 現在の天気情報を取得
      const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;
      const weatherResponse = await fetch(weatherApiUrl);
      if (!weatherResponse.ok) {
          throw new Error('現在の天気情報の取得に失敗しました');
      }
      const weatherData = await weatherResponse.json();

      // 3. 5日間の天気予報を取得
      const forecastApiUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;
      const forecastResponse = await fetch(forecastApiUrl);
      if (!forecastResponse.ok) {
          throw new Error('天気予報の取得に失敗しました');
      }
      const forecastData = await forecastResponse.json();

      // 4. データを表示
      const forecastRows = forecastData.list
          .slice(0, 5) // 最初の5つのデータ（おおよそ5日分）
          .map((forecast) => {
              const date = new Date(forecast.dt * 1000);
              return `
                  <tr>
                      <td>${date.toLocaleString('ja-JP')}</td>
                      <td>${forecast.main.temp} &#8451;</td>
                      <td>${forecast.weather[0].description}</td>
                  </tr>
              `;
          })
          .join('');

      weatherInfo.innerHTML = `
          <div class="current-weather">
              <h3>現在の天気情報</h3>
              <table>
                  <tbody>
                      <tr><th>都市</th><td>${weatherData.name}</td></tr>
                      <tr><th>緯度</th><td>${lat}</td></tr>
                      <tr><th>経度</th><td>${lon}</td></tr>
                      <tr><th>気温</th><td>${weatherData.main.temp} &#8451;</td></tr>
                      <tr><th>天気</th><td>${weatherData.weather[0].description}</td></tr>
                      <tr><th>湿度</th><td>${weatherData.main.humidity}%</td></tr>
                  </tbody>
              </table>
          </div>
          <div class="forecast-weather">
              <h3>直近の天気予報</h3>
              <table>
                  <thead>
                      <tr>
                          <th>日時</th>
                          <th>気温</th>
                          <th>天気</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${forecastRows}
                  </tbody>
              </table>
          </div>
      `;
  } catch (error) {
      weatherInfo.innerHTML = `<p class="error">エラー: ${error.message}</p>`;
  }
}
