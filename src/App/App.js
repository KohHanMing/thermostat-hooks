import React from 'react';
import RadialSlider from '../RadialSlider/RadialSlider';
import Knob from '../Knob/Knob';
import './App.css';
import * as Constants from './AppConstants';
import { Machine, interpret } from 'xstate';
import { thermostatMachine } from '../Model/ThermostatMachine';
import TextField from '@material-ui/core/TextField';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            mouseX: 0,
            mouseY: 0,
            canDrag: false,
            isDragging:false,
            cursor: 'default',
            sliderCentreX: 0,
            sliderCentreY: 0,
            sliderRectLength: 0,
            sliderColourR: Constants.INIT_COL_R,
            sliderColourG: Constants.INIT_COL_G,
            sliderColourB: Constants.INIT_COL_B,
            sliderColour: Constants.INIT_COL,
            knobX: 0,
            knobY: 0,
            deg: Constants.INIT_DEG,
            rad: Constants.INIT_RAD,
            targTemp: Constants.INIT_TEMP,
            currTemp: Constants.INIT_TEMP,
            current: thermostatMachine.initialState,
            inputValue: ''
        };
        this.sliderBoundingRect = React.createRef();
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleClick = this.handleClick.bind(this)
        this.handleWheel = this.handleWheel.bind(this);
        this.updateAngles = this.updateAngles.bind(this);
        this.handleAngleChanged = this.handleAngleChanged.bind(this);
        this.updateTemp = this.updateTemp.bind(this);
        this.updateColour = this.updateColour.bind(this);
        this.updateKnob = this.updateKnob.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    service = interpret(thermostatMachine).onTransition(current =>
        this.setState({ current })
    );

    /* ------------------------------------------------------------------ */
    /* ------------------------ MOUNT COMPONENT ------------------------- */
    /* ------------------------------------------------------------------ */
    
    /* This method adds the custom event listeners, starting the xstate service, and intialises states that needed the component to be
    added to the DOM first*/
    componentDidMount() {
        window.addEventListener('angleChangedTemp', this.updateTemp);
        window.addEventListener('angleChangedColour', this.updateColour);
        window.addEventListener('angleChangedKnob', this.updateKnob);
        this.service.start();
        this.setState({
            sliderCentreX: this.getSliderCentreX(),
            sliderCentreY: this.getSliderCentreY(),
            sliderRectLength: this.sliderBoundingRect.current.getBoundingClientRect().height,
            knobX: this.alignKnobSliderX() + this.getSliderRadius() * Math.cos(Constants.INIT_RAD),
            knobY: this.alignKnobSliderY() + this.getSliderRadius() * Math.sin(Constants.INIT_RAD),
        });
    }

    /* ------------------------------------------------------------------ */
    /* ----------------------------- CLEANUP ---------------------------- */
    /* ------------------------------------------------------------------ */

    /* This method cleans up before the component is removed by removes the custom event listeners and stopping the xstate service*/
    componentWillUnmount() {
        window.removeEventListener('angleChangedTemp', this.updateTemp);
        window.removeEventListener('angleChangedColour', this.updateColour);
        window.removeEventListener('angleChangedKnob', this.updateKnob);
        window.removeEventListener('wheel', this.handleWheel);
        this.service.stop();
    }

    /* ------------------------------------------------------------------ */
    /* ------------------------ EVENT HANDLERS ------------------------- */
    /* ------------------------------------------------------------------ */

    /** ------------------------ INPUT EVENT HANDLERS ------------------------- **/

    /* This method handles the event where the mouse moves. It is considered a drag if the mouse is being held down. This also means
    mouse down event has to have happened first, otherwise the movement is not a drag and will not update the slider.
    preventDefault() was also used to prevent the default action of highlighting an element on screen. It is less messy looking this way. */
    handleMouseMove(e) {
        if (this.state.isDragging) {
                this.updateAngles(e);
            }
        e.preventDefault();
    }

    /* Mouse down indicates an intention to drag, this method sets the boolean isDragging to true. */
    handleMouseDown(e) {
        if (this.state.canDrag) {
            this.setState({
                isDragging: true,
            });
        }
        this.setState({
            cursor: 'grabbing'
        });
    }

    /* Mouse up indicates that the user is done with the dragging action. isDragging is updated accordingly */
    handleMouseUp() {
        this.setState({
            isDragging: false,
            cursor: 'grab'
        });
    }

    /* The user can only drag if the mouse is hovering over the radial slider. This method accounts for this. 
    Additionally, it adds the event listener to enable scrolling to change the angle between the mouse and the 
    centre of the slider, by extension disable scrolling of the page*/
    handleMouseOver() {
        this.setState({
            canDrag: true,
            cursor: 'grab'
        });
        window.addEventListener('wheel', this.handleWheel, {passive: false} );
    }

    /* This method accounts for when the mouse is no longer hovering over the radial slider. Additionally, it removes
    the event handler that allows scrolling to update the angle between the mouse and the centre of the slider, 
    thereby re-enabling scrolling of the page. */
    handleMouseOut() {
        this.setState({
            canDrag: false,
            cursor: 'default'
        });
        window.removeEventListener('wheel', this.handleWheel);
    }
    /* This method updates the angle between the angle between the mouse and the centre of the slider when a click is detected. */
    handleClick(e) {
        this.updateAngles(e);
    }

    /* This method uses the mouse scroll to update the angle between the mouse and the centre of the slider. 1 scroll down is
    considered decrement of 5 degrees. 1 scroll up is considered an increment of 5 degrees */
    handleWheel(e) {
        var angleInDegrees = this.state.deg;
        var angleInRadians = this.state.rad;
        if (e.deltaY < 0) {
            if (angleInDegrees <= Constants.MAX_DEG - Constants.BUFF_DEG && angleInDegrees >= Constants.ANGLE_OFFSET_DEG) {
                angleInDegrees = angleInDegrees + Constants.BUFF_DEG;
                angleInRadians = angleInRadians + Constants.BUFF_RAD;
            } else {
                angleInDegrees = Constants.MIN_DEG;
                angleInRadians = Constants.MIN_RAD;
            }
        } else if (e.deltaY > 0) {
            if (angleInDegrees <= Constants.MAX_DEG && angleInDegrees >= Constants.ANGLE_OFFSET_DEG + Constants.BUFF_DEG) {
                angleInDegrees = angleInDegrees - Constants.BUFF_DEG;
                angleInRadians = angleInRadians - Constants.BUFF_RAD;
            } else {
                angleInDegrees = Constants.MAX_DEG;
                angleInRadians = Constants.MAX_RAD;
            }
        }
        this.setState({
            deg: angleInDegrees,
            rad: angleInRadians
        })
        this.handleAngleChanged(angleInRadians, angleInDegrees);
        e.preventDefault();
    }

    /* This method updates the textbox of the external UI */
    handleTextChange(e, value) {
        this.setState({ value: value })
    }

    /* This method stores the value keyed into the external UI upon pressing enter */
    handleKeyPress(e) {
        if (e.key ==='Enter') {
            this.setState({ currTemp: e.target.value })
            this.service.send({ type: 'UPDATECURRTEMP', currentTemp: e.target.value }); //simulate change in current temp
        }
    }
    
    /** ------------------------ CUSTOM EVENT HANDLERS ------------------------- **/
    
    /* This method updates the angle between the mouse and the centre of the slider in both degrees and radians */
    updateAngles(e) {
        var currX = e.pageX;
        var currY = e.pageY;
        var angleInRadians = Math.atan2(currY - this.state.sliderCentreY, currX - this.state.sliderCentreX);
        var angleInDegrees = (Math.round((180 / Math.PI) * angleInRadians) + Constants.MAX_DEG - Constants.ANGLE_OFFSET_DEG) % 361;
        this.setState({
            cursor: 'grabbing',
            mouseX: currX,
            mouseY: currY,
            deg: angleInDegrees,
            rad: angleInRadians
        });
        this.handleAngleChanged(angleInRadians, angleInDegrees);
    }
    
    /* This method handles the change in angles by doing 2 things:
    1. It checks whether the angle is within range, within the buffer or out of range.
    2. It creates custom events and passes them to their respective handlers to update temperature, the colour of the slider,
    and the position of the knob.
    
    Note: Needs angles to be passed in directly since state has not been updated yet. Input event handler that called has not
    returned yet so state has not been updated */
    handleAngleChanged(angleInRadians, angleInDegrees) {
        var angleStatus;
        if (angleInDegrees >= Constants.ANGLE_OFFSET_DEG) {
            angleStatus = "VALID";
        } else if (angleInDegrees < Constants.BUFF_DEG) { //5 degree buffer so min and max temps are always 50 and 80.
            angleStatus = "MAXBUFF";
        } else if (angleInDegrees < Constants.ANGLE_OFFSET_DEG && this.state.deg >= Constants.ANGLE_OFFSET_DEG - Constants.BUFF_DEG) {
            angleStatus = "MINBUFF";
        } else {
            angleStatus = "INVALID";
        }

        var tempChangeEvent = new CustomEvent('angleChangedTemp', {
            detail: {
                angleStatus: angleStatus,
                targTemp: Constants.LOWEST_TEMP_SLIDER,
                deg: angleInDegrees
            }
        });
        window.dispatchEvent(tempChangeEvent);
        
        var colourChangeEvent = new CustomEvent('angleChangedColour', {
            detail: {
                angleStatus: angleStatus,
                targTemp: Constants.LOWEST_TEMP_SLIDER,
                deg: angleInDegrees
            }
        });
        window.dispatchEvent(colourChangeEvent);

        var knobChangeEvent = new CustomEvent('angleChangedKnob', {
            detail: {
                angleStatus: angleStatus,
                rad: angleInRadians
            }
        });
        window.dispatchEvent(knobChangeEvent);
    }

    /* This method updates the temperature based on the change in angle between the mouse and the centre of the slider. */
    updateTemp(e) {
        var newTemp = this.state.targTemp;
        if (e.detail.angleStatus === "VALID") {
            var tempOffset = Math.round(Constants.TEMP_CHANGE_PER_DEG * (e.detail.deg - Constants.ANGLE_OFFSET_DEG) * 2) / 2; //only display at intervals of 0.5
            newTemp = e.detail.targTemp + tempOffset;
        } else if (e.detail.angleStatus === "MAXBUFF") {
            newTemp = Constants.HIGHEST_TEMP_SLIDER;
        } else if (e.detail.angleStatus === "MINBUFF") {
            newTemp = Constants.LOWEST_TEMP_SLIDER;
        } else {

        }
        this.setState({targTemp: newTemp});
        this.service.send({ type: 'UPDATETARGTEMP', targetTemp: newTemp });
    }

    /* This method updates the colour of the slider based on the change in angle between the mouse and the centre of the slider. */
    updateColour(e) {
        var newR = this.state.sliderColourR;
        var newG = this.state.sliderColourG;
        var newB = this.state.sliderColourB;
        if (e.detail.angleStatus === "VALID") {
            var colourOffsetR = Math.round(Constants.COLOUR_R_CHANGE_PER_DEG * (e.detail.deg - Constants.ANGLE_OFFSET_DEG));
            var colourOffsetG = Math.round(Constants.COLOUR_G_CHANGE_PER_DEG * (e.detail.deg - Constants.ANGLE_OFFSET_DEG));
            var colourOffsetB = Math.round(Constants.COLOUR_B_CHANGE_PER_DEG * (e.detail.deg - Constants.ANGLE_OFFSET_DEG));
            newR = Constants.ROYAL_BLUE_R + colourOffsetR;
            newG = Constants.ROYAL_BLUE_G - colourOffsetG;
            newB = Constants.ROYAL_BLUE_B - colourOffsetB;
        } else if (e.detail.angleStatus === "MAXBUFF") {
            newR = Constants.LIGHT_RED_R;
            newG = Constants.LIGHT_RED_G;
            newB = Constants.LIGHT_RED_B;
        } else if (e.detail.angleStatus === "MINBUFF") {
            newR = Constants.ROYAL_BLUE_R;
            newG = Constants.ROYAL_BLUE_G;
            newB = Constants.ROYAL_BLUE_B;
        } else {

        }
        this.setState({
            sliderColourR: newR,
            sliderColourG: newG,
            sliderColourB: newB,
            sliderColour: "rgb(" + newR + ", " + newG + ", " + newB + ")"
        });
    }

    /* This method updates the position of the knob based on the change in angle between the mouse and the centre of the slider. */
    updateKnob(e) {
        var knobNewX = this.state.knobX;
        var knobNewY = this.state.knobY;
        if (e.detail.angleStatus === "VALID") {
            knobNewX = this.alignKnobSliderX() + this.getSliderRadius() * Math.cos(e.detail.rad);
            knobNewY = this.alignKnobSliderY() + this.getSliderRadius() * Math.sin(e.detail.rad);
        } else if (e.detail.angleStatus === "MAXBUFF") {
            knobNewX = this.alignKnobSliderX() + this.getSliderRadius() * Math.cos(Constants.MAX_RAD);
            knobNewY = this.alignKnobSliderY() + this.getSliderRadius() * Math.sin(Constants.MAX_RAD);
        } else if (e.detail.angleStatus === "MINBUFF") {
            knobNewX = this.alignKnobSliderX() + this.getSliderRadius() * Math.cos(Constants.MIN_RAD);
            knobNewY = this.alignKnobSliderY() + this.getSliderRadius() * Math.sin(Constants.MIN_RAD);
        } else {

        }
        this.setState({
            knobX: knobNewX,
            knobY: knobNewY
        });
    }

    /* ------------------------------------------------------------------ */
    /* ------------------------ HELPER FUNCTIONS ------------------------ */
    /* ------------------------------------------------------------------ */
    
    /* This method returns the X coordinate of the centre of the radial slider by taking reference from the slider's bounding box. */
    getSliderCentreX() {
        return this.sliderBoundingRect.current.getBoundingClientRect().left + (this.sliderBoundingRect.current.getBoundingClientRect().width / 2);
    }

    /* This method returns the Y coordinate of the centre of the radial slider by taking reference from the slider's bounding box. */
    getSliderCentreY() {
        return this.sliderBoundingRect.current.getBoundingClientRect().top + (this.sliderBoundingRect.current.getBoundingClientRect().height / 2);
    }

    /* This method returns the X coordinate required for the knob to align to the centre of the radial slider.
    It also takes reference from the slider's bounding box. */
    alignKnobSliderX() {
        const sliderCentreX = this.getSliderCentreX();
        return sliderCentreX - this.sliderBoundingRect.current.getBoundingClientRect().height * Constants.KNOB_TO_SLIDER_RATIO / 2;
    }

    /* This method returns the Y coordinate required for the knob to align to the centre of the radial slider.
    It also takes reference from the slider's bounding box. */
    alignKnobSliderY() {
        const sliderCentreY = this.getSliderCentreY();
        return sliderCentreY - this.sliderBoundingRect.current.getBoundingClientRect().height * Constants.KNOB_TO_SLIDER_RATIO / 2;
    }

    /* This method returns the radius of the radial slider by taking referece from the slider's bounding box. */
    getSliderRadius() {
        return this.sliderBoundingRect.current.getBoundingClientRect().height * 0.9 / 2;
    }

    /* This method returns the distance in the X direction the knob has to be offset in order for the knob to be on the edge of the slider. */
    getKnobOffsetX() {
        return this.getSliderRadius() * Math.cos(Constants.ANGLE_OFFSET_RAD);
    }

    /* This method returns the distance in the Y direction the knob has to be offset in order for the knob to be on the edge of the slider. */
    getKnobOffsetY() {
        return this.getSliderRadius() * Math.sin(Constants.ANGLE_OFFSET_RAD);
    }

    /* --------------------------------------------------------- */
    /* ------------------------ RENDER ------------------------- */
    /* --------------------------------------------------------- */
    
    /* This method returns the JSX for the entire component. */
    render() {
        const { current } = this.state;
        const { send } = this.service;
        const knobStyles = {
            position: 'absolute',
            top: this.state.knobY,
            left: this.state.knobX,
            cursor: this.state.cursor,
        }
        return (
            <div className='main-wrapper' >
                <div className="app" onMouseMove={this.handleMouseMove} onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp} >
                    <div 
                        className="slider-wrapper" ref={this.sliderBoundingRect} onMouseOver={this.handleMouseOver} 
                        onMouseOut={this.handleMouseOut} onClick={this.handleClick} onScroll={this.handleWheel}
                    >
                        <RadialSlider 
                            sliderRectLength={this.state.sliderRectLength} targTemp={this.state.targTemp} currTemp={this.state.currTemp}
                            sliderColour={this.state.sliderColour} 
                            modeColour={current.matches('heaterOn') ? 'red'
                                : current.matches('coolerOn') ? 'blue'
                                : 'grey'
                            }
                            mode={current.matches('heaterTurningOn') ? 'Turning on...'
                                : current.matches('heaterOn') ? 'Heater on'
                                : current.matches('heaterTurningOff') ? 'Turning off...'
                                : current.matches('coolerTurningOn') ? 'Turning on...'
                                : current.matches('coolerOn') ? 'Cooler on'
                                : current.matches('coolerTurningOff') ? 'Turning off...'
                                : 'Off'
                            }
                        />
                        <div style={knobStyles} >
                            <Knob knobRectLength={this.state.sliderRectLength * Constants.KNOB_TO_SLIDER_RATIO} />
                        </div>
                    </div>
                </div>
                    <TextField
                        id="testText"
                        label="Input Temperature"
                        defaultValue="72"
                        helperText="Press enter to store value (Must be 32-100)" 
                        value={this.state.value}
                        onChange={this.handleTextChange}
                        onKeyPress={this.handleKeyPress}
                    />
            </div>
        );
    }
};

export default App;
