import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import { get, set, useForm } from "react-hook-form";
import axios from "axios";
// import ChatBot from './components/ChatBot';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


// Note 1: the range of the height and width of the panel gap for each model and location is based on our measurement of the actual Tesla Model S car, and estimated for other models and locations.
// Note 2: both the tolerance for the width gap which is 3mm and the tolerance for the gap area which is 5mm² are estimated by our team.

function App() {
  const modelLocationRanges = {
    model3: {
        "front-quarter-driver": { heightRange: [795, 805], widthRange: [3.0, 9.0] },
        "driver-rear-passenger": { heightRange: [1295, 1305], widthRange: [3.0, 9.0] },
        "rear-passenger-quarter": { heightRange: [995, 1005], widthRange: [3.0, 9.0] },
        "front-quarter-passenger": { heightRange: [795, 805], widthRange: [3.0, 9.0] },
        "front-passenger-rear-passenger": { heightRange: [1295, 1305], widthRange: [3.0, 9.0] },
    },
  
    modely: {
        "front-quarter-driver": { heightRange: [845, 855], widthRange: [3.0, 9.0] },
        "driver-rear-passenger": { heightRange: [1345, 1355], widthRange: [3.0, 9.0] },
        "rear-passenger-quarter": { heightRange: [1045, 1055], widthRange: [3.0, 9.0] },
        "front-quarter-passenger": { heightRange: [845, 855], widthRange: [3.0, 9.0] },
        "front-passenger-rear-passenger": { heightRange: [1345, 1355], widthRange: [3.0, 9.0] },
    },
  
    modelx: {
        "front-quarter-driver": { heightRange: [1045, 1055], widthRange: [3.0, 9.0] },
        "driver-rear-passenger": { heightRange: [1545, 1555], widthRange: [3.0, 9.0] },
        "rear-passenger-quarter": { heightRange: [1245, 1255], widthRange: [3.0, 9.0] },
        "front-quarter-passenger": { heightRange: [1045, 1055], widthRange: [3.0, 9.0] },
        "front-passenger-rear-passenger": { heightRange: [1545, 1555], widthRange: [3.0, 9.0] },
    },
  
    models: {
        "front-quarter-driver": { heightRange: [645, 655], widthRange: [3.0, 9.0] },
        "driver-rear-passenger": { heightRange: [1145,1155], widthRange: [3.0, 9.0] },
        "rear-passenger-quarter": { heightRange: [845, 855], widthRange: [3.0, 9.0] },
        "front-quarter-passenger": { heightRange: [645, 655], widthRange: [3.0, 9.0] },
        "front-passenger-rear-passenger": { heightRange: [1145, 1155], widthRange: [3.0, 9.0] },
    },
  };
  const API_KEY = process.env.REACT_APP_API_KEY;
  const chatRef = useRef(null);
  const { register, reset, handleSubmit} = useForm();
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
    alertMessage: "",
  });
  const [chatResult, setChatResult] = useState([{
    role: "",
    message: "",
  }]);
  const [loading, setLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatBot, setChatBot] = useState(false);
  const [temp, setTemp] = useState({
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
    alertMessage: "",
  });

  // Track if the calculation has been performed
  const [isCalculated, setIsCalculated] = useState(false);

  
  const getStatusMessage = (label, status) => {
    const cleanStatus = status.replace("Rejected! ", "");
    return (
      <p style={{color: "white"}}>
        {label}: {cleanStatus}
      </p>
    )
  }

  const handleCalculate = (data) => {
    if (!data.model) {
      setResult((result) => ({
        ...result,
        alertMessage: "Please select a model.",
      }));
      return;
    }

    if (!data.location) {
      setResult((result) => ({
        ...result,
        alertMessage: "Please select a location.",
      }));
      return;
    }

    const modelRanges = modelLocationRanges[data.model];
    if (!modelRanges) {
      setResult((result) => ({
        ...result,
        alertMessage: "Please select model.",
      }));
      return;
    }

    const locationRanges = modelRanges[data.location];
    if (!locationRanges) {
      setResult((result) => ({
        ...result,
        alertMessage: "Please select location.",
      }));
      return;
    }   
    
    setTemp(data);
    
    

    calculatePanelGap(
      data.leftLength,
      data.rightLength,
      data.topWidth,
      data.bottomWidth,
      data.model,
      data.location,
      locationRanges.heightRange,
      locationRanges.widthRange        
    );
    
    // set to true after the calculation is performed
    setIsCalculated(true);
    reset();
  };

  useEffect(() => {
    const resultPrompt = `
      Here is the height and width tolerance for each model: ${JSON.stringify(modelLocationRanges, null, 2)}. 
      And we hope the difference between the top and bottom of the gap is less than 3mm.
      The gap area should be within (mm²): the average of height range * the average of width range) abs. 5 mm².
      There is note for model: "modely" is model Y, "modelx" is model X, "models" is model S, and "model3" is model 3.
      Can you help me to check if this is Tesla ${temp.model} and the gap located on ${temp.location} with the gap dimension as following if they are within the tolerance? 
      the top of gap width ${temp.topWidth}mm, the bottom of gap width ${temp.bottomWidth}mm, and the left length ${temp.leftLength}, and the right length ${temp.rightLength}.`
    setChatPrompt(resultPrompt);
  }, [temp]);


  const handleChatBot = () => {
    console.log(chatPrompt);
    setChatBot(true);
    generateAnswer(chatPrompt);
  }

  const calculatePanelGap = (L, R, T, B, model, location, heightRange, widthRange) => {
    const leftLengthStatus = checkInRange("Left length", L, heightRange);
    const rightLengthStatus = checkInRange("Right length", R, heightRange);
    const topWidthStatus = checkInRange("Top width", T, widthRange);
    const bottomWidthStatus = checkInRange("Bottom width", B, widthRange);

    // check tolerance: the difference between the top and bottom of the gap should be less than 3mm.
    const thisGap = Math.abs(T - B).toFixed(2);
    setWidthGap(thisGap);
    setWidthTolerance(thisGap < 3 ? "Pass" : "Reject");

    // check tolerance: the gap area should be within (mm²): the average of height range * the average of width range) abs. 5 mm²
    const gapArea = (
      ((parseFloat(T) + parseFloat(B)) * Math.min(L, R)) /
      2
    ).toFixed(4);
    setGapArea(gapArea);

    const avgHeight = (heightRange[0] + heightRange[1]) / 2;
    const avgWidth = (widthRange[0] + widthRange[1]) / 2;
    const gapAreaTolerance = [
      Math.abs(avgHeight * avgWidth - 5),
      Math.abs(avgHeight * avgWidth + 5),
    ];

    setGapAreaTolerance(
      gapArea > gapAreaTolerance[0] && gapArea < gapAreaTolerance[1]
        ? "Pass"
        : "Reject"
    );

    setResult((result) => ({
      ...result,
      model: model,
      location: location,
      leftLength: L,
      rightLength: R,
      topWidth: T,
      bottomWidth: B,
      widthGap: thisGap,
      widthTolerance: thisGap < 3 ? "Pass" : "Reject",
      gapArea: gapArea,
      gapAreaTolerance:
        gapArea > gapAreaTolerance[0] && gapArea < gapAreaTolerance[1]
          ? "Pass"
          : "Reject",
      
      alertMessage: [
        leftLengthStatus,
        rightLengthStatus,
        topWidthStatus,
        bottomWidthStatus
      ].filter((status) => status.startsWith("Reject"))
      .map((status, index) => {
        const labels = ["", "", "", ""];
        return getStatusMessage(labels[index], status);
      }),
    }));
  };
  
  const checkInRange = (name, value, range) => {
    if (value < range[0] || value > range[1]) {
      return `Rejected! ${name} out of range (${range[0]}mm - ${range[1]}mm)`;
    }
    return "Passed";
  };

  useEffect(() => {
    handleScrollToBottom();
  }, [chatResult]);


  async function generateAnswer(analyzeResult) {
    setLoading(true);
    const yourRole = "Tesla Senior product specialist";
    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      method: "post",
      data: {
        contents: [
          { parts: [{ "text": 
            `Now you are ${yourRole}. 
            ${analyzeResult}`
          }]},
        ],
      },
    });
    if (response) {
      setLoading(false);
    }
    const responseMess = response.data["candidates"][0]["content"]["parts"][0]["text"];
    setChatResult((prev) => [...prev, {role: yourRole, message: responseMess}]);
  }

  const handleUserPrompt = (e) => {
    setUserPrompt(e.target.value);
  }
  
  const handleSendUserPrompt = () => {
    setChatResult((prev) => [...prev, {role: "User", message: userPrompt}]);
    generateAnswer(userPrompt);
    setUserPrompt("");
  }

  const handleScrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  const handleClearBtn = () => {
    setIsCalculated(false);
    setWidthGap(0);
    setWidthTolerance("");
    setGapArea(0);
    setGapAreaTolerance("");
    setResult({
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
      alertMessage: "",
    });
    setChatResult([{
      role: "",
      message: "",
    }]);
  }


  return (
    <div className="App">
      <div className="page-container">
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
                {...register("model", { required: "Please select a model" })}
              >
                <option value="">Please Select a Model..</option>
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
                required = "Please select a location"
                {...register("location", { required: "Please select a location" })}
              >
                <option value="" selected>
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
          <div className="button-container">
            <button className="tds-btn" onClick={handleClearBtn}>Clear Result</button>
          </div>
          
          {result.alertMessage && result.alertMessage.length > 0 && (
            <div>
              <div style={{ backgroundColor: "#C33149", padding: 10, borderRadius: 15 }}>
                <p className="alert-message" style={{ color: "white", fontWeight: "bold" }}>
                  Some dimension are rejected
                </p>
                {result.alertMessage}
              </div>
            </div>
          )}
            
          {isCalculated && (
            <div className="result">
              <h2 className="subheading">Result</h2>
              <p> Model: {result.model} </p> 
              <p> Location: {result.location} </p>
              <p>
                Left Length: {result.leftLength} mm, Right Length:{" "}
                {result.rightLength} mm
              </p>
              <p>
                Top Width: {result.topWidth} mm, Bottom Width:{" "}
                {result.bottomWidth} mm
              </p>
              <p> Width Gap: {widthGap} mm </p>
              <p style={{fontWeight: "bold"}}> Width Tolerance: {widthTolerance} </p>
              <p> Gap Area: {gapArea} mm² </p>
              <p style={{fontWeight: "bold"}}> Gap Area Tolerance: {gapAreaTolerance} </p>
              <div className="button-container">
                <button className="tds-btn" onClick={handleChatBot}>Chat with Gemini</button>
              </div>
            </div>
          )}
        </div>


        { chatBot && (
          <div className="container chatBot-container">
            <h2 className="subheading">Chat with Gemini</h2>
            <div className="chatBot-response">
              <React.Fragment>
                {chatResult.length > 1 && chatResult.map((chat, index) => (
                  <React.Fragment key={index}>
                    {chat.role === "User" ? (
                      <div className="chatBot-each-response">
                        <p className="role-tag role-you">You:</p>
                        <p>{chat.message}</p>
                      </div>
                    ): (
                      <div className="chatBot-each-response">
                        <div ref={chatRef}></div>
                        <p className="role-tag role-gemini">Gemini:</p>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {chat.message}
                        </ReactMarkdown>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </React.Fragment>
              
            </div>
            <div>
              {loading && <p>Gemini is typing...</p>}
              <div className="chatBot-input">
                <input value={userPrompt} onChange={handleUserPrompt} type="text" placeholder="Type your message here" />
                <button className="tds-btn send-mes-btn" onClick={handleSendUserPrompt}>Send</button>
              </div>
            </div>
          </div>
          )}

      </div>
    </div>
    
  );
}

export default App;
