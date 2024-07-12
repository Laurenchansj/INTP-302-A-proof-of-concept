import "./App.css";
import React, { useEffect, useState } from "react";
import { set, useForm } from "react-hook-form";

const modelLocationRanges = {
  model3: {
    "front-quarter-driver": { heightRange: [700, 800], widthRange: [2.0, 3.0] },
    "driver-rear-passenger": {
      heightRange: [600, 700],
      widthRange: [2.0, 3.0],
    },
    "rear-passenger-quarter": {
      heightRange: [700, 800],
      widthRange: [2.5, 3.5],
    },
    "front-quarter-passenger": {
      heightRange: [700, 800],
      widthRange: [2.5, 3.5],
    },
    "front-passenger-rear-passenger": {
      heightRange: [600, 700],
      widthRange: [2.5, 3.5],
    },
  },
  modely: {
    "front-quarter-driver": { heightRange: [750, 850], widthRange: [2.5, 3.5] },
    "driver-rear-passenger": {
      heightRange: [650, 750],
      widthRange: [2.5, 3.5],
    },
    "rear-passenger-quarter": {
      heightRange: [750, 850],
      widthRange: [3.0, 4.0],
    },
    "front-quarter-passenger": {
      heightRange: [750, 850],
      widthRange: [3.0, 4.0],
    },
    "front-passenger-rear-passenger": {
      heightRange: [650, 750],
      widthRange: [3.0, 4.0],
    },
  },
  modelx: {
    "front-quarter-driver": { heightRange: [750, 850], widthRange: [2.5, 3.5] },
    "driver-rear-passenger": {
      heightRange: [650, 750],
      widthRange: [2.5, 3.5],
    },
    "rear-passenger-quarter": {
      heightRange: [750, 850],
      widthRange: [3.0, 4.0],
    },
    "front-quarter-passenger": {
      heightRange: [750, 850],
      widthRange: [3.0, 4.0],
    },
    "front-passenger-rear-passenger": {
      heightRange: [650, 750],
      widthRange: [3.0, 4.0],
    },
  },
  models: {
    "front-quarter-driver": { heightRange: [750, 850], widthRange: [2.5, 3.5] },
    "driver-rear-passenger": {
      heightRange: [650, 750],
      widthRange: [2.5, 3.5],
    },
    "rear-passenger-quarter": {
      heightRange: [750, 850],
      widthRange: [3.0, 4.0],
    },
    "front-quarter-passenger": {
      heightRange: [750, 850],
      widthRange: [3.0, 4.0],
    },
    "front-passenger-rear-passenger": {
      heightRange: [650, 750],
      widthRange: [3.0, 4.0],
    },
  },
};

function App() {
  const { register, reset, handleSubmit } = useForm();
  const [widthGap, setWidthGap] = useState(0);
  const [widthTolerance, setWidthTolerance] = useState("");
  const [gapArea, setGapArea] = useState(0);
  const [gapAreaTolerance, setGapAreaTolerance] = useState("");
  const [result, setResult] = useState({
    model: "",
    location: "",
    leftLength: "",
    rightLength: "",
    topWidth: "",
    bottomWidth: "",
    widthGap: "",
    widthTolerance: "",
    gapArea: "",
    gapAreaTolerance: "",
  });

  let heightRange; // (mm)
  let widthRange; // (mm)

  // Track if the calculation has been performed
  const [isCalculated, setIsCalculated] = useState(false);

  const handleCalculate = (data) => {
    if (data.model && data.location) {
      // console.log(data);
      const ranges = modelLocationRanges[data.model][data.location];
      heightRange = ranges.heightRange;
      widthRange = ranges.widthRange;
      reset();
      calculatePanelGap(
        data.leftLength,
        data.rightLength,
        data.topWidth,
        data.bottomWidth
      );
      // set to true after the calculation is performed
      setIsCalculated(true);
    } else {
      alert("Please select a model / location of the panel gap.");
    }
  };

  const calculatePanelGap = (L, R, T, B) => {
    if (checkInRange("Left length", L, heightRange)) return;
    if (checkInRange("Right length", R, heightRange)) return;
    if (checkInRange("Top width", T, widthRange)) return;
    if (checkInRange("Bottom width", B, widthRange)) return;

    // check tolerance: the difference between the top and bottom of the gap should be less than 0.5mm
    const thisGap = Math.abs(T - B).toFixed(2);
    setWidthGap(thisGap);
    setWidthTolerance(thisGap < 0.5 ? "Pass" : "Reject");

    // check tolerance: the gap area should be within (mm²): the average of height range * the average of width range) abs. 0.5 mm²
    const gapArea = (
      ((parseFloat(T) + parseFloat(B)) * Math.min(L, R)) /
      2
    ).toFixed(4);
    setGapArea(gapArea);

    const avgHeight = (heightRange[0] + heightRange[1]) / 2;
    const avgWidth = (widthRange[0] + widthRange[1]) / 2;
    // const gapAreaTolerance = [(avgHeight * avgWidth) - 0.5, (avgHeight * avgWidth) + 0.5];
    const gapAreaTolerance = [
      Math.abs(avgHeight * avgWidth - 0.5),
      Math.abs(avgHeight * avgWidth + 0.5),
    ];
    setGapAreaTolerance(
      gapArea > gapAreaTolerance[0] && gapArea < gapAreaTolerance[1]
        ? "Pass"
        : "Reject"
    );

    setResult({
      // model: data.model,
      // location: data.location,
      leftLength: L,
      rightLength: R,
      topWidth: T,
      bottomWidth: B,
      widthGap: thisGap,
      widthTolerance: thisGap < 0.5 ? "Pass" : "Reject",
      gapArea: gapArea,
      gapAreaTolerance:
        gapArea > gapAreaTolerance[0] && gapArea < gapAreaTolerance[1]
          ? "Pass"
          : "Reject",
    });
  };

  const checkInRange = (mes, value, range) => {
    if (value >= range[0] && value <= range[1]) {
      setResult((prevResult) => ({
        ...prevResult,
        [mes]: "Pass",
        alertMessage: "",
      }));
      // return false;
    } else {
      alert(`${mes} is out of range (${range[0]} - ${range[1]})`);
      setResult((prevResult) => ({
        ...prevResult,
        [mes]: "Reject",
        alertMessage: `${mes} is out of range (${range[0]} - ${range[1]})`,
      }));
      // return true;
    }
  };

  useEffect(() => {
    console.log(result);
  }, [result]);

  return (
    <div className="App">
      <div class="container">
        <h1 className="title">Tesla Panel Gap Calculator</h1>

        <form onSubmit={handleSubmit(handleCalculate)}>
          <div className="form-group">
            <label for="model" className="tds-form-label">
              Select Your Tesla Model:
            </label>
            <select
              id="model"
              name="model"
              required
              {...register("model", { required: true })}
            >
              <option value="null" selected>
                Please Select a Model..
              </option>
              <option value="model3">Model 3</option>
              <option value="modely">Model Y</option>
              <option value="modelx">Model X</option>
              <option value="models">Model S</option>
            </select>
          </div>

          <div className="form-group">
            <label for="location" className="tds-form-label">
              Location of Panel Gap:
            </label>
            <select
              id="location"
              name="location"
              required
              {...register("location", { required: true })}
            >
              <option value="null" selected>
                Please Select a Location..
              </option>
              <option value="front-quarter-driver">
                Front Quarter Panel and Drivers Door
              </option>
              <option value="driver-rear-passenger">
                Drivers Door and Rear Passenger Door
              </option>
              <option value="rear-passenger-quarter">
                Rear Passenger Door and Rear Quarter Panel
              </option>
              <option value="front-quarter-passenger">
                Front Quarter Panel and Front Passenger Door
              </option>
              <option value="front-passenger-rear-passenger">
                Front Passenger Door and Rear Passenger Door
              </option>
            </select>
          </div>

          <h2 className="subheading">Panel Gap Dimensions</h2>

          <div className="grid-container">
            <div className="form-group">
              <label for="right-length" className="tds-form-label">
                Right Length (mm):
              </label>
              <input
                type="number"
                id="right-length"
                name="right-length"
                min="0"
                step="0.01"
                required
                {...register("rightLength")}
              />
            </div>
            <div className="form-group">
              <label for="left-length" className="tds-form-label">
                Left Length (mm):
              </label>
              <input
                type="number"
                id="left-length"
                name="left-length"
                min="0"
                step="0.01"
                required
                {...register("leftLength")}
              />
            </div>
            <div className="form-group">
              <label for="top-width" className="tds-form-label">
                Top of Gap Width (mm):
              </label>
              <input
                type="number"
                id="top-width"
                name="top-width"
                min="0"
                step="0.01"
                required
                {...register("topWidth")}
              />
            </div>
            <div className="form-group">
              <label for="bottom-width" className="tds-form-label">
                Bottom of Gap Width (mm):
              </label>
              <input
                type="number"
                id="bottom-width"
                name="bottom-width"
                min="0"
                step="0.01"
                required
                {...register("bottomWidth")}
              />
            </div>
          </div>

          <div className="button-container">
            <button className="tds-btn" type="submit" id="calculateButton">
              Calculate
            </button>
          </div>
        </form>

        {isCalculated && (
          <div className="result">
            <h2 className="subheading">Calculation Results</h2>
            {/* <p>
              Model: {result.model}, Location: {result.location}
            </p> */}
            <p>
              Left Length: {result.leftLength} mm, Right Length:{" "}
              {result.rightLength} mm
            </p>
            <p>
              Top Width: {result.topWidth} mm, Bottom Width:{" "}
              {result.bottomWidth} mm
            </p>
            <p>
              Width Gap: {widthGap} mm, Width Tolerance: {widthTolerance}
            </p>
            <p>
              Gap Area: {gapArea} mm², Gap Area Tolerance: {gapAreaTolerance}
            </p>
          </div>
        )}

        <div className="image-placeholder"></div>
      </div>
    </div>
  );
}

export default App;
