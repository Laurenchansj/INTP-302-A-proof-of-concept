import './App.css';
import React, { useEffect, useState } from 'react';
import { set, useForm } from 'react-hook-form';


function App() {
    const { register, reset, handleSubmit } = useForm();

    const [ widthGap, setWidthGap ] = useState(0);
    const [ widthTolerance, setWidthTolerance ] = useState("")
    const [ gapArea, setGapArea ] = useState(0);
    const [ gapAreaTolerance, setGapAreaTolerance ] = useState("")

    const handleCalculate = (data) => {
        if (data.model !== "null" && data.location !== "null") {
            console.log(data);
            reset();
            calculatePanelGap(data.leftLength, data.rightLength, data.topWidth, data.bottomWidth);
        } else {
            alert("Please select a model / location of the panel gap.");
        }
    }

    const calculatePanelGap = (L, R, T, B) => {
        // @TODO: consider the model and location


        const thisGap = Math.abs(T - B).toFixed(2);

        setWidthGap(thisGap);
        // check tolerance
        setWidthTolerance(thisGap < 0.5 ? "Pass" : "Reject");

        // get the gap area
        const gapArea = (parseFloat(T) + parseFloat(B)) * Math.min(L, R) / 2;
        console.log('gapArea', gapArea);
        setGapArea(gapArea);

        setGapAreaTolerance(gapArea < 40 ? "Pass" : "Reject");

    }

    useEffect(() => {
        console.log(widthGap);
        console.log(widthTolerance);
        console.log(gapArea);
        console.log(gapAreaTolerance);
    }, [widthGap, widthTolerance, gapArea, gapAreaTolerance]);
    


    return (
        <div className="App">
            <div class="container">

            <h1 className="title">Tesla Panel Gap Calculator</h1>

            <form onSubmit={handleSubmit(handleCalculate)}>
                <div className="form-group">
                    <label for="model" className="tds-form-label">Select Your Tesla Model:</label>
                    <select id="model" name="model" required {...register('model', {required: true})}>
                        <option value="null" selected>Please Select a Model..</option> 
                        <option value="model3">Model 3</option>
                        <option value="modely">Model Y</option>
                        <option value="modelx">Model X</option>
                        <option value="models">Model S</option>
                    </select>
                </div>

                <div className="form-group">
                    <label for="location" className="tds-form-label">Location of Panel Gap:</label>
                    <select id="location" name="location" required {...register('location')}>
                        <option value="null" selected>Please Select a Location..</option>
                        <option value="front-quarter-driver">Front Quarter Panel and Drivers Door</option>
                        <option value="driver-rear-passenger">Drivers Door and Rear Passenger Door</option>
                        <option value="rear-passenger-quarter">Rear Passenger Door and Rear Quarter Panel</option>
                        <option value="front-quarter-passenger">Front Quarter Panel and Front Passenger Door</option>
                        <option value="front-passenger-rear-passenger">Front Passenger Door and Rear Passenger Door</option>
                    </select>
                </div>

                <h2 className="subheading">Panel Gap Dimensions</h2>

                <div className="grid-container">
                    <div className="form-group">
                        <label for="right-length" className="tds-form-label">Right Length (cm):</label>
                        <input type="number" id="right-length" name="right-length" min="0" step="0.01" required {...register('rightLength')} />
                    </div>
                    <div className="form-group">
                        <label for="left-length" className="tds-form-label">Left Length (cm):</label>
                        <input type="number" id="left-length" name="left-length" min="0" step="0.01" required {...register('leftLength')}/>
                    </div>
                    <div className="form-group">
                        <label for="top-width" className="tds-form-label">Top of Gap Width (cm):</label>
                        <input type="number" id="top-width" name="top-width" min="0" step="0.01" required {...register('topWidth')}/>
                    </div>
                    <div className="form-group">
                        <label for="bottom-width" className="tds-form-label">Bottom of Gap Width (cm):</label>
                        <input type="number" id="bottom-width" name="bottom-width" min="0" step="0.01" required {...register('bottomWidth')} />
                    </div>
                </div>

                <div className="button-container">
                    <button className="tds-btn" type="submit" id="calculateButton">Calculate</button>
                </div>
            </form>

            <div className="results">
                <h2 className="subheading">Results</h2>
                </div>

            <div className="image-placeholder">
                </div>

            </div>
        </div>
    );
}

export default App;
