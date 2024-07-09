import './App.css';

function App() {
  return (
    <div className="App">
      <div class="container">

      <h1 class="title">Tesla Panel Gap Calculator</h1>

      <div class="form-group">
          <label for="model" class="tds-form-label">Select Your Tesla Model:</label>
          <select id="model" name="model" required>
      <option value="" disabled selected></option> 
              <option value="model3">Model 3</option>
              <option value="modely">Model Y</option>
              <option value="modelx">Model X</option>
              <option value="models">Model S</option>
          </select>
      </div>

      <div class="form-group">
          <label for="location" class="tds-form-label">Location of Panel Gap:</label>
          <select id="location" name="location" required>
      <option value="" disabled selected></option>
              <option value="front-quarter-driver">Front Quarter Panel and Drivers Door</option>
              <option value="driver-rear-passenger">Drivers Door and Rear Passenger Door</option>
              <option value="rear-passenger-quarter">Rear Passenger Door and Rear Quarter Panel</option>
              <option value="front-quarter-passenger">Front Quarter Panel and Front Passenger Door</option>
              <option value="front-passenger-rear-passenger">Front Passenger Door and Rear Passenger Door</option>
          </select>
      </div>

      <h2 class="subheading">Panel Gap Dimensions</h2>

      <div class="grid-container">
          <div class="form-group">
              <label for="right-length" class="tds-form-label">Right Length (cm):</label>
              <input type="number" id="right-length" name="right-length" min="0" step="0.50" required />
          </div>
          <div class="form-group">
              <label for="left-length" class="tds-form-label">Left Length (cm):</label>
              <input type="number" id="left-length" name="left-length" min="0" step="0.50" required />
          </div>
          <div class="form-group">
              <label for="top-width" class="tds-form-label">Top of Gap Width (cm):</label>
              <input type="number" id="top-width" name="top-width" min="0" step="0.50" required />
          </div>
          <div class="form-group">
              <label for="bottom-width" class="tds-form-label">Bottom of Gap Width (cm):</label>
              <input type="number" id="bottom-width" name="bottom-width" min="0" step="0.50" required />
          </div>
      </div>

      <div class="button-container">
        <button class="tds-btn" type="button" id="calculateButton">Calculate</button>
      </div>


      <div class="results">
          <h2 class="subheading">Results</h2>
          </div>

      <div class="image-placeholder">
          </div>

      </div>
    </div>
  );
}

export default App;
